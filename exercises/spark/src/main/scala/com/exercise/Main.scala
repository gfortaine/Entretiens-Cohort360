package com.exercise

import com.exercise.engine.CohortSearchEngine
import com.exercise.model._
import org.apache.spark.sql.SparkSession

object Main {
  def main(args: Array[String]): Unit = {
    val solrUrl = "http://localhost:8983/solr"
    val engine = new CohortSearchEngine(solrUrl)
    
    try {
      // Chargement des critères depuis le fichier JSON
      val criteriaPath = "src/main/resources/query.json"
      
      // Utilisation de Spark pour lire le JSON et le convertir en notre modèle
      import engine.spark.implicits._
      val criteriaDS = engine.spark.read
        .option("multiline", "true")
        .json(criteriaPath)
        .as[SearchCriteria]
      
      val criteria = criteriaDS.first()
      
      println("Critères chargés :")
      println(criteria)

      println("Exécution de la recherche...")
      val result = engine.runSearch(criteria)
      
      println(s"Nombre de patients trouvés : $result")
      
    } catch {
      case e: Exception =>
        e.printStackTrace()
    } finally {
      engine.stop()
    }
  }
}
