package com.exercise.engine

import com.exercise.model._
import com.exercise.utils.{SolrConf, SolrConnector}
import com.typesafe.scalalogging.LazyLogging
import org.apache.spark.sql.SparkSession

class CohortSearchEngine(spark: SparkSession, solrConf: SolrConf) extends LazyLogging {
  private val connector = new SolrConnector(spark, solrConf)

  /**
   * Maps FHIR resource names to Solr collection names
   */
  private val resourceToCollection: Map[String, String] = Map(
    "Patient" -> "patientAphp",
    "Encounter" -> "encounterAphp",
    "DocumentReference" -> "documentReferenceAphp",
    "Organization" -> "organizationAphp"
  )

  /**
   * Maps FHIR resource names to patient ID column names
   */
  private val resourceToPatientIdColumn: Map[String, String] = Map(
    "Patient" -> "id",
    "Encounter" -> "subject_reference",
    "DocumentReference" -> "subject_reference"
  )

  /**
   * Translates a FHIR search parameter into a Solr filter query
   * Examples:
   *   birthDate=ge2005-01-01 -> birthDate:[2005-01-01T00:00:00Z TO *]
   *   length=lt12 -> length:[* TO 11]
   *   gender=male -> gender:male
   *   active=true -> active:true
   *   description=cancer -> description:*cancer*
   */
  private def translateToSolrFilter(searchParam: String): String = {
    val parts = searchParam.split("=", 2)
    if (parts.length != 2) return searchParam
    
    val field = parts(0)
    val value = parts(1)
    
    // Handle comparison prefixes (ge, gt, le, lt)
    value match {
      case v if v.startsWith("ge") =>
        val actual = v.substring(2)
        if (field.toLowerCase.contains("date")) {
          s"$field:[${actual}T00:00:00Z TO *]"
        } else {
          s"$field:[$actual TO *]"
        }
      case v if v.startsWith("gt") =>
        val actual = v.substring(2)
        if (field.toLowerCase.contains("date")) {
          s"$field:{${actual}T00:00:00Z TO *}"
        } else {
          s"$field:{$actual TO *}"
        }
      case v if v.startsWith("le") =>
        val actual = v.substring(2)
        if (field.toLowerCase.contains("date")) {
          s"$field:[* TO ${actual}T23:59:59Z]"
        } else {
          s"$field:[* TO $actual]"
        }
      case v if v.startsWith("lt") =>
        val numStr = v.substring(2)
        val actual = scala.util.Try(numStr.toInt).toOption match {
          case Some(n) => (n - 1).toString  // lt12 -> [* TO 11]
          case None => numStr
        }
        if (field.toLowerCase.contains("date")) {
          s"$field:{* TO ${v.substring(2)}T00:00:00Z}"
        } else {
          s"$field:[* TO $actual]"
        }
      case v if v.contains("*") =>
        // Already a wildcard pattern
        s"$field:$v"
      case v if field == "description" || field == "content" || field == "text" =>
        // Text search fields - use wildcards
        s"$field:*$v*"
      case v =>
        // Exact match
        s"$field:$v"
    }
  }

  /**
   * Parses searchParams string into Solr filter queries
   * Example: "birthDate=ge2005-01-01&gender=male" -> Seq("birthDate:[2005-01-01T00:00:00Z TO *]", "gender:male")
   */
  private def parseSearchParams(searchParams: String): Seq[String] = {
    if (searchParams.isEmpty) Seq.empty
    else {
      searchParams.split("&").map(translateToSolrFilter).toSeq
    }
  }

  /**
   * Extracts patient IDs from a DataFrame based on the resource type
   */
  private def extractPatientIds(df: DataFrame, resource: String): DataFrame = {
    val patientIdCol = resourceToPatientIdColumn.getOrElse(resource, "subject_reference")
    
    if (resource == "Patient") {
      df.select(col("id").as("patient_id"))
    } else {
      // For other resources, extract patient ID from reference (e.g., "Patient/123" -> "123")
      df.select(
        regexp_extract(col(patientIdCol), "Patient/(.+)", 1).as("patient_id")
      ).filter(col("patient_id") =!= "")
    }
  }

  def runSearch(criteria: SearchCriteria): Long = {
    // ETAPE 1: Process each criterion and build patient sets
    
    val criteriaResults: Seq[(DataFrame, Boolean)] = criteria.Criteria.map { criterion =>
      val collectionName = resourceToCollection.getOrElse(
        criterion.Resource, 
        criterion.Resource.toLowerCase + "Aphp"
      )
      
      // Parse and translate search params to Solr filters
      val solrFilters = parseSearchParams(criterion.searchParams)
      
      // Load collection with filters pushed down to Solr
      val df = connector.loadCollection(collectionName, solrFilters)
      
      // Extract patient IDs
      val patientIds = extractPatientIds(df, criterion.Resource).distinct()
      
      // Return tuple of (patientIds DataFrame, isInclude flag)
      val isInclude = criterion.Include.toLowerCase == "true"
      (patientIds, isInclude)
    }
    
    // Start with all patients from inclusion criteria
    val inclusionSets = criteriaResults.filter(_._2).map(_._1)
    val exclusionSets = criteriaResults.filterNot(_._2).map(_._1)
    
    if (inclusionSets.isEmpty) {
      // No inclusion criteria - return 0 (or could load all patients)
      return 0L
    }
    
    // Intersect all inclusion sets (patients must match ALL inclusion criteria)
    var resultPatients = inclusionSets.reduce { (a, b) =>
      a.join(b, Seq("patient_id"), "inner")
    }
    
    // Exclude patients matching any exclusion criteria
    exclusionSets.foreach { exclusionSet =>
      resultPatients = resultPatients.join(
        exclusionSet, 
        Seq("patient_id"), 
        "left_anti"  // Anti-join: keep only patients NOT in exclusion set
      )
    }
    
    // ETAPE 2: Filter by perimeters (organizations)
    // Exclude patients who haven't had a visit in one of the specified organizations
    if (criteria.Perimeters.nonEmpty) {
      // Load encounters for the specified organizations
      val orgFilters = criteria.Perimeters.map { perimeter =>
        // perimeter format: "Organization/aphp-psl" -> serviceProvider_reference:Organization/aphp-psl
        s"serviceProvider_reference:$perimeter"
      }
      
      // Create OR filter for organizations
      val orgFilter = orgFilters.mkString("(", " OR ", ")")
      
      val encountersInPerimeter = connector.loadCollection("encounterAphp", Seq(orgFilter))
      val patientsInPerimeter = extractPatientIds(encountersInPerimeter, "Encounter").distinct()
      
      // Keep only patients who have visits in the perimeter
      resultPatients = resultPatients.join(
        patientsInPerimeter, 
        Seq("patient_id"), 
        "inner"
      )
    }
    
    // Return distinct patient count
    resultPatients.distinct().count()
  }

  def stop(): Unit = spark.stop()
}
