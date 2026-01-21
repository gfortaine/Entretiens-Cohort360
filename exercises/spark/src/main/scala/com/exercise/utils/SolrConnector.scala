package com.exercise.utils

import org.apache.spark.sql.{DataFrame, Dataset, Row, SparkSession}

class SolrConnector(spark: SparkSession, solrUrl: String) {

  /**
   * Charge une collection Solr en tant que Dataset[Row] (DataFrame).
   *
   * @param collectionName Nom de la collection Solr (ex: patientAphp)
   * @param filters Liste de filtres natifs Solr (Filter Queries 'fq')
   * @return Le Dataset chargé avec les filtres appliqués à la source
   */
  def loadCollection(collectionName: String, filters: Seq[String] = Seq.empty): Dataset[Row] = {
    var reader = spark.read
      .format("solr")
      .option("zkhost", "localhost:9983")
      .option("collection", collectionName)
    
    // Application des filtres natifs pour le pushdown Solr
    if (filters.nonEmpty) {
      reader = reader.option("solr.params", filters.map(f => s"fq=$f").mkString("&"))
    }

    reader.load()
  }
}
