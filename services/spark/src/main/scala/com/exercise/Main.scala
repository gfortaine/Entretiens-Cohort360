package com.exercise

import com.exercise.engine.CohortSearchEngine
import com.exercise.model._
import com.exercise.utils.SolrConf
import com.lucidworks.spark.LazyLogging
import io.github.cdimascio.dotenv.Dotenv
import org.apache.spark.sql.SparkSession

object Main extends LazyLogging {
  private val dotenv = Dotenv.configure().ignoreIfMissing().load()
  val criteriaPath: String = dotenv.get("CRITERIA_PATH")
  val solrUrl: String = dotenv.get("SOLR_URL")
  val solrZkHost: String = dotenv.get("SOLR_ZK_HOST")

  def main(args: Array[String]): Unit = {

    logger.info("Starting CohortSearchEngine...")
    val spark: SparkSession = SparkSession.builder()
      .appName("CohortSearchEngine")
      .master("local[*]")
      .getOrCreate()
    import spark.implicits._

    val solrConf = SolrConf(solrUrl, solrZkHost)
    val engine = new CohortSearchEngine(spark, solrConf)

    try {
      // Chargement des critères depuis le fichier JSON
      val criteriaDS = spark.read
        .option("multiline", "true")
        .json(criteriaPath)
        .as[SearchCriteria]
      val criteria = criteriaDS.first()
      logger.info(s"Critères chargés : $criteria")

      logger.info("Exécution de la recherche...")
      val result = engine.runSearch(criteria)
      logger.info(s"Nombre de patients trouvés : $result")
    } catch {
      case e: Exception => logger.error("An error occurred during execution", e)
    } finally {
      engine.stop()
      logger.info("Engine stopped.")
    }
  }
}
