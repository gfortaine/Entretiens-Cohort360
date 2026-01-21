package com.exercise.utils

import org.apache.spark.sql.{DataFrame, SparkSession}
import org.apache.solr.client.solrj.impl.HttpSolrClient
import org.apache.solr.client.solrj.request.schema.SchemaRequest
import com.typesafe.scalalogging.LazyLogging

import scala.collection.JavaConverters.asScalaBufferConverter

/**
 * A utility class responsible for interacting with Solr collections using Spark.
 * This class facilitates loading data from Solr into a Spark DataFrame and retrieving metadata,
 * such as field names and their types, for a specific Solr collection.
 *
 * @constructor Creates a new SolrConnector with the given Spark session and Solr configuration.
 * @param spark    the Spark session to use for interacting with Solr
 * @param solrConf the configuration details required for connecting to Solr
 */
class SolrConnector(spark: SparkSession, solrConf: SolrConf) extends LazyLogging {

  /**
   * Formats a sequence of filter query parameters (fq) for Solr into a single query string.
   * If the provided filters are null, it defaults to "q=*:*".
   *
   * @param filters a sequence of filter query strings; each non-empty filter will be included in the formatted query
   * @return a formatted query string including the "q=*:*" default and any non-empty filter queries
   */
  private def formatFqParams(filters: Seq[String]): String = {
    if (filters == null) return "q=*:*"
    s"q=*:*${filters.filter(_.nonEmpty).map(f => s"&fq=$f").mkString}"
  }

  /**
   * Load a Solr collection into a DataFrame.
   *
   * @param collection Solr collection name
   * @param filters    Solr filters list (optional) ex: Seq("patientId:123456789","gender:female")
   * @return DataFrame of Solr documents
   */
  def loadCollection(collection: String, filters: Seq[String] = Seq.empty): DataFrame = {
    spark.read
      .format("solr")
      .option("zkhost", solrConf.solrZkHost)
      .option("collection", collection)
      .option("solr.params", formatFqParams(filters))
      .options(solrConf.extraOptions)
      .load()
  }

  /**
   * Retrieves a map of field names and their corresponding field types for a given Solr collection.
   *
   * @param collection the name of the Solr collection whose schema fields and types are to be fetched
   * @return a map where the keys are field names and the values are the corresponding field types
   */
  def getCollectionFieldTypeMap(collection: String): Map[String, String] = {
    val client = new HttpSolrClient.Builder(s"${solrConf.solrBaseUrl}/$collection").build()
    try {
      new SchemaRequest.Fields()
        .process(client)
        .getFields
        .asScala
        .map(f => f.get("name").toString -> f.get("type").toString)
        .toMap
    } finally {
      client.close()
    }
  }
}
