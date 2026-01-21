name := "scala-spark-solr-exercise"
version := "0.1"
scalaVersion := "2.12.17"

val sparkVersion = "3.3.2"

libraryDependencies ++= Seq(
  "org.apache.spark" %% "spark-core" % sparkVersion,
  "org.apache.spark" %% "spark-sql" % sparkVersion,
  
  // Connecteur Solr
  "com.lucidworks.spark" % "spark-solr" % "4.0.2" 
    exclude("org.apache.spark", "*") 
    exclude("org.apache.bahir", "*")
    exclude("com.fasterxml.jackson.module", "jackson-module-scala_2.12"), 
  
  // Tests
  "org.scalatest" %% "scalatest" % "3.2.15" % Test
)

// Pour éviter les conflits de log4j
libraryDependencies += "org.slf4j" % "slf4j-api" % "1.7.36"
libraryDependencies += "org.slf4j" % "slf4j-log4j12" % "1.7.36"

// Configuration pour Spark et Java 17+
fork := true
javaOptions ++= Seq(
  "--add-opens=java.base/java.lang=ALL-UNNAMED",
  "--add-opens=java.base/java.lang.invoke=ALL-UNNAMED",
  "--add-opens=java.base/java.util=ALL-UNNAMED",
  "--add-opens=java.base/java.nio=ALL-UNNAMED",
  "--add-opens=java.base/sun.nio.ch=ALL-UNNAMED",
  "--add-opens=java.base/sun.nio.cs=ALL-UNNAMED",
  "--add-opens=java.base/java.security=ALL-UNNAMED",
  "--add-opens=java.base/sun.util.calendar=ALL-UNNAMED",
  "--add-opens=java.base/java.math=ALL-UNNAMED"
)
