package com.exercise.utils

case class SolrConf(solrBaseUrl: String, solrZkHost: String, extraOptions: Map[String, String] = Map.empty)
