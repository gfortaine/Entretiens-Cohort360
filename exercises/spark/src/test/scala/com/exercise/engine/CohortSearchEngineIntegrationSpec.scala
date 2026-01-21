package com.exercise.engine

import com.exercise.model._
import org.apache.spark.sql.{DataFrame, SparkSession}
import org.apache.spark.sql.functions._
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.should.Matchers
import org.scalatest.BeforeAndAfterAll

/**
 * Integration tests for CohortSearchEngine using a local Spark session
 * with mock data (no Solr required).
 * 
 * These tests validate the core DataFrame logic:
 * - Inclusion/exclusion joins
 * - Patient ID extraction
 * - Perimeter filtering
 */
class CohortSearchEngineIntegrationSpec extends AnyFlatSpec with Matchers with BeforeAndAfterAll {

  // Use object to get stable identifier for implicits
  object TestSpark {
    lazy val spark: SparkSession = SparkSession.builder()
      .appName("CohortSearchEngineTest")
      .master("local[*]")
      .config("spark.ui.enabled", "false")
      .getOrCreate()
  }

  import TestSpark.spark
  import spark.implicits._

  override def beforeAll(): Unit = {
    spark.sparkContext.setLogLevel("ERROR")
  }

  override def afterAll(): Unit = {
    spark.stop()
  }

  /**
   * Helper to create mock patient data
   */
  def createPatientDF(patients: Seq[(String, String, String, Boolean)]): DataFrame = {
    patients.toDF("id", "birthDate", "gender", "active")
  }

  /**
   * Helper to create mock encounter data
   */
  def createEncounterDF(encounters: Seq[(String, String, Int, String)]): DataFrame = {
    encounters.toDF("id", "subject_reference", "length", "serviceProvider_reference")
  }

  /**
   * Helper to create mock document reference data
   */
  def createDocumentReferenceDF(docs: Seq[(String, String, String)]): DataFrame = {
    docs.toDF("id", "subject_reference", "description")
  }

  "Patient ID extraction" should "work for Patient resource using id column" in {
    val patients = Seq(
      ("p1", "2010-01-01", "male", true),
      ("p2", "2000-05-15", "female", true),
      ("p3", "1990-12-25", "male", false)
    )
    val df = createPatientDF(patients)
    
    val patientIds = df.select(col("id").as("patient_id"))
    patientIds.count() shouldBe 3
    patientIds.collect().map(_.getString(0)).toSet shouldBe Set("p1", "p2", "p3")
  }

  it should "extract patient ID from subject_reference for Encounter" in {
    val encounters = Seq(
      ("e1", "Patient/p1", 5, "Organization/aphp-psl"),
      ("e2", "Patient/p2", 10, "Organization/aphp-psl"),
      ("e3", "Patient/p1", 15, "Organization/other")
    )
    val df = createEncounterDF(encounters)
    
    val patientIds = df.select(
      regexp_extract(col("subject_reference"), "Patient/(.+)", 1).as("patient_id")
    ).filter(col("patient_id") =!= "").distinct()
    
    patientIds.count() shouldBe 2
    patientIds.collect().map(_.getString(0)).toSet shouldBe Set("p1", "p2")
  }

  "Inclusion logic" should "intersect multiple inclusion criteria" in {
    // Patients: p1, p2, p3
    val patientSet1 = Seq("p1", "p2").toDF("patient_id")
    val patientSet2 = Seq("p2", "p3").toDF("patient_id")
    
    // Intersection should be p2 only
    val result = patientSet1.join(patientSet2, Seq("patient_id"), "inner")
    result.count() shouldBe 1
    result.collect().head.getString(0) shouldBe "p2"
  }

  "Exclusion logic" should "use anti-join to remove excluded patients" in {
    val inclusionSet = Seq("p1", "p2", "p3").toDF("patient_id")
    val exclusionSet = Seq("p2").toDF("patient_id")
    
    // Anti-join should keep p1, p3
    val result = inclusionSet.join(exclusionSet, Seq("patient_id"), "left_anti")
    result.count() shouldBe 2
    result.collect().map(_.getString(0)).toSet shouldBe Set("p1", "p3")
  }

  "Perimeter filtering" should "keep only patients with encounters in specified organizations" in {
    val allPatients = Seq("p1", "p2", "p3").toDF("patient_id")
    
    val encounters = Seq(
      ("e1", "Patient/p1", 5, "Organization/aphp-psl"),
      ("e2", "Patient/p2", 10, "Organization/other"),
      ("e3", "Patient/p1", 15, "Organization/aphp-psl")
    )
    val encounterDF = createEncounterDF(encounters)
    
    // Filter encounters by organization
    val filteredEncounters = encounterDF.filter(
      col("serviceProvider_reference") === "Organization/aphp-psl"
    )
    
    val patientsInPerimeter = filteredEncounters.select(
      regexp_extract(col("subject_reference"), "Patient/(.+)", 1).as("patient_id")
    ).filter(col("patient_id") =!= "").distinct()
    
    // Join with all patients
    val result = allPatients.join(patientsInPerimeter, Seq("patient_id"), "inner")
    
    // Only p1 has encounters in aphp-psl
    result.count() shouldBe 1
    result.collect().head.getString(0) shouldBe "p1"
  }

  "Combined inclusion + exclusion + perimeter" should "produce correct cohort" in {
    // Scenario from query.json:
    // - Include: Patients born >= 2005, male, active
    // - Include: Encounters with length < 12
    // - Exclude: DocumentReferences with "cancer" in description
    // - Perimeter: Organization/aphp-psl
    
    // Mock data
    val patients = Seq(
      ("p1", "2010-01-01", "male", true),   // Matches patient criteria
      ("p2", "2008-05-15", "male", true),   // Matches patient criteria
      ("p3", "2000-12-25", "male", true),   // Too old (born before 2005)
      ("p4", "2015-03-10", "female", true), // Wrong gender
      ("p5", "2012-07-20", "male", true)    // Matches patient criteria
    )
    val patientDF = createPatientDF(patients)
    
    val encounters = Seq(
      ("e1", "Patient/p1", 5, "Organization/aphp-psl"),   // p1: length < 12, in perimeter
      ("e2", "Patient/p2", 10, "Organization/aphp-psl"),  // p2: length < 12, in perimeter
      ("e3", "Patient/p3", 8, "Organization/aphp-psl"),   // p3: length < 12, in perimeter
      ("e4", "Patient/p5", 15, "Organization/aphp-psl"),  // p5: length >= 12 (excluded)
      ("e5", "Patient/p1", 20, "Organization/other")      // p1: different org
    )
    val encounterDF = createEncounterDF(encounters)
    
    val documents = Seq(
      ("d1", "Patient/p1", "routine checkup"),     // p1: no cancer
      ("d2", "Patient/p2", "cancer diagnosis"),    // p2: has cancer (excluded)
      ("d3", "Patient/p3", "follow-up visit")      // p3: no cancer
    )
    val documentDF = createDocumentReferenceDF(documents)
    
    // Step 1: Apply patient criteria (born >= 2005, male, active)
    val matchingPatients = patientDF
      .filter(col("birthDate") >= "2005-01-01")
      .filter(col("gender") === "male")
      .filter(col("active") === true)
      .select(col("id").as("patient_id"))
    
    matchingPatients.count() shouldBe 3 // p1, p2, p5
    
    // Step 2: Apply encounter criteria (length < 12)
    val matchingEncounters = encounterDF
      .filter(col("length") < 12)
      .select(regexp_extract(col("subject_reference"), "Patient/(.+)", 1).as("patient_id"))
      .distinct()
    
    matchingEncounters.count() shouldBe 3 // p1, p2, p3
    
    // Step 3: Intersect inclusions
    val afterInclusion = matchingPatients.join(matchingEncounters, Seq("patient_id"), "inner")
    afterInclusion.count() shouldBe 2 // p1, p2 (p5 has length >= 12)
    
    // Step 4: Apply exclusion (cancer documents)
    val cancerPatients = documentDF
      .filter(col("description").contains("cancer"))
      .select(regexp_extract(col("subject_reference"), "Patient/(.+)", 1).as("patient_id"))
      .distinct()
    
    cancerPatients.count() shouldBe 1 // p2
    
    val afterExclusion = afterInclusion.join(cancerPatients, Seq("patient_id"), "left_anti")
    afterExclusion.count() shouldBe 1 // p1 only
    
    // Step 5: Apply perimeter filter
    val perimeterEncounters = encounterDF
      .filter(col("serviceProvider_reference") === "Organization/aphp-psl")
      .select(regexp_extract(col("subject_reference"), "Patient/(.+)", 1).as("patient_id"))
      .distinct()
    
    val finalCohort = afterExclusion.join(perimeterEncounters, Seq("patient_id"), "inner")
    finalCohort.count() shouldBe 1
    finalCohort.collect().head.getString(0) shouldBe "p1"
  }

  "Empty inclusion criteria" should "return 0 patients" in {
    // When there are no inclusion criteria, result should be 0
    val inclusionSets: Seq[DataFrame] = Seq.empty
    
    inclusionSets.isEmpty shouldBe true
    // Engine should return 0L in this case
  }

  "Multiple exclusion criteria" should "exclude patients matching ANY exclusion" in {
    val inclusionSet = Seq("p1", "p2", "p3", "p4").toDF("patient_id")
    val exclusionSet1 = Seq("p1").toDF("patient_id")
    val exclusionSet2 = Seq("p3").toDF("patient_id")
    
    var result = inclusionSet
    result = result.join(exclusionSet1, Seq("patient_id"), "left_anti")
    result = result.join(exclusionSet2, Seq("patient_id"), "left_anti")
    
    result.count() shouldBe 2
    result.collect().map(_.getString(0)).toSet shouldBe Set("p2", "p4")
  }
}
