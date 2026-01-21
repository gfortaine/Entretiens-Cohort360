#!/bin/bash

# Attente que Solr soit prêt
(
  echo "Waiting for Solr to start..."
  until curl -s "http://localhost:8983/solr/admin/info/system" > /dev/null; do
    sleep 2
  done

  echo "Solr is up. Creating collections..."

  for coll in patientAphp encounterAphp documentReferenceAphp organizationAphp; do
    echo "Processing collection: $coll"
    # Suppression (si elle existe)
    curl -s "http://localhost:8983/solr/admin/collections?action=DELETE&name=$coll" > /dev/null
    # Création via API (plus fiable au démarrage que le binaire solr)
    curl -s "http://localhost:8983/solr/admin/collections?action=CREATE&name=$coll&numShards=1&replicationFactor=1&collection.configName=_default" > /dev/null
  done

  echo "Defining schema..."
  # Définir organization comme string pour éviter la tokenisation
  curl -s -X POST -H 'Content-Type: application/json' 'http://localhost:8983/solr/patientAphp/schema' --data-binary '{
    "add-field": [
      { "name": "managingOrganization.reference", "type": "string", "indexed": true, "stored": true },
      { "name": "gender", "type": "string", "indexed": true, "stored": true },
      { "name": "active", "type": "boolean", "indexed": true, "stored": true },
      { "name": "birthDate", "type": "pdate", "indexed": true, "stored": true },
      { "name": "name.family", "type": "string", "indexed": true, "stored": true },
      { "name": "name.given", "type": "string", "indexed": true, "stored": true, "multiValued": true },
      { "name": "deceasedBoolean", "type": "boolean", "indexed": true, "stored": true }
    ]
  }' > /dev/null

  curl -s -X POST -H 'Content-Type: application/json' 'http://localhost:8983/solr/encounterAphp/schema' --data-binary '{
    "add-field": [
      { "name": "subject.reference", "type": "string", "indexed": true, "stored": true },
      { "name": "serviceProvider.reference", "type": "string", "indexed": true, "stored": true },
      { "name": "status", "type": "string", "indexed": true, "stored": true },
      { "name": "class.code", "type": "string", "indexed": true, "stored": true },
      { "name": "period.start", "type": "pdate", "indexed": true, "stored": true },
      { "name": "length", "type": "pint", "indexed": true, "stored": true }
    ]
  }' > /dev/null

  curl -s -X POST -H 'Content-Type: application/json' 'http://localhost:8983/solr/organizationAphp/schema' --data-binary '{
    "add-field": [
      { "name": "name", "type": "string", "indexed": true, "stored": true },
      { "name": "active", "type": "boolean", "indexed": true, "stored": true }
    ]
  }' > /dev/null

  curl -s -X POST -H 'Content-Type: application/json' 'http://localhost:8983/solr/documentReferenceAphp/schema' --data-binary '{
    "add-field": [
      { "name": "subject.reference", "type": "string", "indexed": true, "stored": true },
      { "name": "status", "type": "string", "indexed": true, "stored": true },
      { "name": "type.coding.code", "type": "string", "indexed": true, "stored": true },
      { "name": "date", "type": "pdate", "indexed": true, "stored": true },
      { "name": "description", "type": "text_general", "indexed": true, "stored": true }
    ]
  }' > /dev/null

  echo "Indexing test data..."
  
  # 0. Organizations (2 documents)
  ORGANIZATIONS_DATA='[
    {"id":"aphp-psl", "name":"Hôpital Pitié-Salpêtrière", "active":true},
    {"id":"aphp-sl", "name":"Hôpital Saint-Louis", "active":true}
  ]'
  curl -s -X POST -H 'Content-Type: application/json' 'http://localhost:8983/solr/organizationAphp/update?commit=true' --data-binary "$ORGANIZATIONS_DATA"

  # 1. Patients (30 documents)
  PATIENTS_DATA='[
    {"id":"P1", "name.family":"Dupont", "name.given":["Jean"], "birthDate":"2010-05-15T00:00:00Z", "gender":"male", "active":true, "managingOrganization.reference":"Organization/aphp-psl"},
    {"id":"P2", "name.family":"Martin", "name.given":["Marie"], "birthDate":"1995-03-10T00:00:00Z", "gender":"female", "active":true, "managingOrganization.reference":"Organization/aphp-psl"},
    {"id":"P3", "name.family":"Durand", "name.given":["Pierre"], "birthDate":"2008-11-20T00:00:00Z", "gender":"male", "active":true, "managingOrganization.reference":"Organization/aphp-psl"},
    {"id":"P4", "name.family":"Petit", "name.given":["Julie"], "birthDate":"2012-01-30T00:00:00Z", "gender":"female", "active":true, "managingOrganization.reference":"Organization/aphp-psl"},
    {"id":"P5", "name.family":"Leroy", "name.given":["Thomas"], "birthDate":"2004-12-31T00:00:00Z", "gender":"male", "active":true, "managingOrganization.reference":"Organization/aphp-psl"},
    {"id":"P6", "name.family":"Moreau", "name.given":["Lucas"], "birthDate":"2006-07-04T00:00:00Z", "gender":"male", "active":false, "managingOrganization.reference":"Organization/aphp-psl"},
    {"id":"P7", "name.family":"Simon", "name.given":["Nicolas"], "birthDate":"2015-09-12T00:00:00Z", "gender":"male", "active":true, "managingOrganization.reference":"Organization/aphp-psl"},
    {"id":"P8", "name.family":"Laurent", "name.given":["Sophie"], "birthDate":"2005-01-01T00:00:00Z", "gender":"female", "active":true, "managingOrganization.reference":"Organization/aphp-psl"},
    {"id":"P9", "name.family":"Lefebvre", "name.given":["Kevin"], "birthDate":"2007-02-14T00:00:00Z", "gender":"male", "active":true, "managingOrganization.reference":"Organization/aphp-psl"},
    {"id":"P10", "name.family":"Roux", "name.given":["Michel"], "birthDate":"1950-01-01T00:00:00Z", "gender":"male", "active":true, "managingOrganization.reference":"Organization/aphp-psl"},
    {"id":"P11", "name.family":"Garcia", "name.given":["Emma"], "birthDate":"2009-08-22T00:00:00Z", "gender":"female", "active":true, "managingOrganization.reference":"Organization/aphp-psl"},
    {"id":"P12", "name.family":"Bertrand", "name.given":["Gabriel"], "birthDate":"2011-12-05T00:00:00Z", "gender":"male", "active":true, "managingOrganization.reference":"Organization/aphp-psl"},
    {"id":"P13", "name.family":"Fontaine", "name.given":["Jade"], "birthDate":"2003-04-18T00:00:00Z", "gender":"female", "active":true, "managingOrganization.reference":"Organization/aphp-psl"},
    {"id":"P14", "name.family":"Vincent", "name.given":["Arthur"], "birthDate":"2010-10-10T00:00:00Z", "gender":"male", "active":true, "managingOrganization.reference":"Organization/aphp-psl"},
    {"id":"P15", "name.family":"Bonnet", "name.given":["Louise"], "birthDate":"2006-03-15T00:00:00Z", "gender":"female", "active":true, "managingOrganization.reference":"Organization/aphp-psl"},
    {"id":"P16", "name.family":"Lemoine", "name.given":["Hugo"], "birthDate":"2008-05-20T00:00:00Z", "gender":"male", "active":true, "managingOrganization.reference":"Organization/aphp-sl"},
    {"id":"P17", "name.family":"Meyer", "name.given":["Lina"], "birthDate":"2014-07-07T00:00:00Z", "gender":"female", "active":true, "managingOrganization.reference":"Organization/aphp-sl"},
    {"id":"P18", "name.family":"Roussel", "name.given":["Leo"], "birthDate":"2005-12-25T00:00:00Z", "gender":"male", "active":true, "managingOrganization.reference":"Organization/aphp-sl"},
    {"id":"P19", "name.family":"Blanc", "name.given":["Alice"], "birthDate":"2012-09-30T00:00:00Z", "gender":"female", "active":true, "managingOrganization.reference":"Organization/aphp-sl"},
    {"id":"P20", "name.family":"Guerrier", "name.given":["Nathan"], "birthDate":"2009-01-01T00:00:00Z", "gender":"male", "active":true, "managingOrganization.reference":"Organization/aphp-sl"},
    {"id":"P21", "name.family":"Morin", "name.given":["Zoe"], "birthDate":"2007-11-11T00:00:00Z", "gender":"female", "active":true, "managingOrganization.reference":"Organization/aphp-sl"},
    {"id":"P22", "name.family":"Clement", "name.given":["Enzo"], "birthDate":"2011-03-03T00:00:00Z", "gender":"male", "active":true, "managingOrganization.reference":"Organization/aphp-sl"},
    {"id":"P23", "name.family":"Nicolas", "name.given":["Manon"], "birthDate":"2004-06-12T00:00:00Z", "gender":"female", "active":true, "managingOrganization.reference":"Organization/aphp-sl"},
    {"id":"P24", "name.family":"Pierre", "name.given":["Louis"], "birthDate":"2013-05-05T00:00:00Z", "gender":"male", "active":true, "managingOrganization.reference":"Organization/aphp-sl"},
    {"id":"P25", "name.family":"Hubert", "name.given":["Chloé"], "birthDate":"2006-12-31T00:00:00Z", "gender":"female", "active":true, "managingOrganization.reference":"Organization/aphp-sl"},
    {"id":"P26", "name.family":"Brunet", "name.given":["Adam"], "birthDate":"2008-08-08T00:00:00Z", "gender":"male", "active":true, "managingOrganization.reference":"Organization/aphp-sl"},
    {"id":"P27", "name.family":"Joly", "name.given":["Camille"], "birthDate":"2010-02-28T00:00:00Z", "gender":"female", "active":true, "managingOrganization.reference":"Organization/aphp-sl"},
    {"id":"P28", "name.family":"Faure", "name.given":["Raphaël"], "birthDate":"2005-06-01T00:00:00Z", "gender":"male", "active":true, "managingOrganization.reference":"Organization/aphp-sl"},
    {"id":"P29", "name.family":"Legrand", "name.given":["Clara"], "birthDate":"2014-10-20T00:00:00Z", "gender":"female", "active":true, "managingOrganization.reference":"Organization/aphp-sl"},
    {"id":"P30", "name.family":"Gautier", "name.given":["Inès"], "birthDate":"2009-04-04T00:00:00Z", "gender":"female", "active":true, "managingOrganization.reference":"Organization/aphp-sl"}
  ]'
  curl -s -X POST -H 'Content-Type: application/json' 'http://localhost:8983/solr/patientAphp/update?commit=true' --data-binary "$PATIENTS_DATA"

  # 2. Encounters (30 documents)
  ENCOUNTERS_DATA='[
    {"id":"E1", "subject.reference":"Patient/P1", "status":"finished", "class.code":"IMP", "period.start":"2023-01-01T10:00:00Z", "length":5, "serviceProvider.reference":"Organization/aphp-psl"},
    {"id":"E2", "subject.reference":"Patient/P2", "status":"finished", "class.code":"AMB", "period.start":"2023-01-02T10:00:00Z", "length":10, "serviceProvider.reference":"Organization/aphp-psl"},
    {"id":"E3", "subject.reference":"Patient/P3", "status":"finished", "class.code":"IMP", "period.start":"2023-01-03T10:00:00Z", "length":15, "serviceProvider.reference":"Organization/aphp-psl"},
    {"id":"E4", "subject.reference":"Patient/P4", "status":"finished", "class.code":"AMB", "period.start":"2023-01-04T10:00:00Z", "length":3, "serviceProvider.reference":"Organization/aphp-psl"},
    {"id":"E5", "subject.reference":"Patient/P5", "status":"finished", "class.code":"IMP", "period.start":"2023-01-05T10:00:00Z", "length":7, "serviceProvider.reference":"Organization/aphp-psl"},
    {"id":"E6", "subject.reference":"Patient/P6", "status":"planned", "class.code":"AMB", "period.start":"2023-01-06T10:00:00Z", "length":2, "serviceProvider.reference":"Organization/aphp-psl"},
    {"id":"E7", "subject.reference":"Patient/P7", "status":"finished", "class.code":"IMP", "period.start":"2023-01-07T10:00:00Z", "length":4, "serviceProvider.reference":"Organization/aphp-psl"},
    {"id":"E8", "subject.reference":"Patient/P8", "status":"finished", "class.code":"AMB", "period.start":"2023-01-08T10:00:00Z", "length":6, "serviceProvider.reference":"Organization/aphp-psl"},
    {"id":"E9", "subject.reference":"Patient/P9", "status":"finished", "class.code":"IMP", "period.start":"2023-01-09T10:00:00Z", "length":5, "serviceProvider.reference":"Organization/aphp-psl"},
    {"id":"E10", "subject.reference":"Patient/P10", "status":"finished", "class.code":"AMB", "period.start":"2023-01-10T10:00:00Z", "length":12, "serviceProvider.reference":"Organization/aphp-psl"},
    {"id":"E11", "subject.reference":"Patient/P11", "status":"finished", "class.code":"IMP", "period.start":"2023-01-11T10:00:00Z", "length":4, "serviceProvider.reference":"Organization/aphp-psl"},
    {"id":"E12", "subject.reference":"Patient/P12", "status":"finished", "class.code":"AMB", "period.start":"2023-01-12T10:00:00Z", "length":8, "serviceProvider.reference":"Organization/aphp-psl"},
    {"id":"E13", "subject.reference":"Patient/P13", "status":"finished", "class.code":"IMP", "period.start":"2023-01-13T10:00:00Z", "length":20, "serviceProvider.reference":"Organization/aphp-psl"},
    {"id":"E14", "subject.reference":"Patient/P14", "status":"finished", "class.code":"AMB", "period.start":"2023-01-14T10:00:00Z", "length":5, "serviceProvider.reference":"Organization/aphp-psl"},
    {"id":"E15", "subject.reference":"Patient/P15", "status":"finished", "class.code":"IMP", "period.start":"2023-01-15T10:00:00Z", "length":1, "serviceProvider.reference":"Organization/aphp-psl"},
    {"id":"E16", "subject.reference":"Patient/P16", "status":"finished", "class.code":"AMB", "period.start":"2023-01-16T10:00:00Z", "length":11, "serviceProvider.reference":"Organization/aphp-sl"},
    {"id":"E17", "subject.reference":"Patient/P17", "status":"finished", "class.code":"IMP", "period.start":"2023-01-17T10:00:00Z", "length":9, "serviceProvider.reference":"Organization/aphp-sl"},
    {"id":"E18", "subject.reference":"Patient/P18", "status":"finished", "class.code":"AMB", "period.start":"2023-01-18T10:00:00Z", "length":2, "serviceProvider.reference":"Organization/aphp-sl"},
    {"id":"E19", "subject.reference":"Patient/P19", "status":"finished", "class.code":"IMP", "period.start":"2023-01-19T10:00:00Z", "length":6, "serviceProvider.reference":"Organization/aphp-sl"},
    {"id":"E20", "subject.reference":"Patient/P20", "status":"finished", "class.code":"AMB", "period.start":"2023-01-20T10:00:00Z", "length":7, "serviceProvider.reference":"Organization/aphp-sl"},
    {"id":"E21", "subject.reference":"Patient/P21", "status":"finished", "class.code":"IMP", "period.start":"2023-01-21T10:00:00Z", "length":5, "serviceProvider.reference":"Organization/aphp-sl"},
    {"id":"E22", "subject.reference":"Patient/P22", "status":"finished", "class.code":"AMB", "period.start":"2023-01-22T10:00:00Z", "length":3, "serviceProvider.reference":"Organization/aphp-sl"},
    {"id":"E23", "subject.reference":"Patient/P23", "status":"finished", "class.code":"IMP", "period.start":"2023-01-23T10:00:00Z", "length":4, "serviceProvider.reference":"Organization/aphp-sl"},
    {"id":"E24", "subject.reference":"Patient/P24", "status":"finished", "class.code":"AMB", "period.start":"2023-01-24T10:00:00Z", "length":10, "serviceProvider.reference":"Organization/aphp-sl"},
    {"id":"E25", "subject.reference":"Patient/P25", "status":"finished", "class.code":"IMP", "period.start":"2023-01-25T10:00:00Z", "length":14, "serviceProvider.reference":"Organization/aphp-sl"},
    {"id":"E26", "subject.reference":"Patient/P26", "status":"finished", "class.code":"AMB", "period.start":"2023-01-26T10:00:00Z", "length":5, "serviceProvider.reference":"Organization/aphp-sl"},
    {"id":"E27", "subject.reference":"Patient/P27", "status":"finished", "class.code":"IMP", "period.start":"2023-01-27T10:00:00Z", "length":6, "serviceProvider.reference":"Organization/aphp-sl"},
    {"id":"E28", "subject.reference":"Patient/P28", "status":"finished", "class.code":"AMB", "period.start":"2023-01-28T10:00:00Z", "length":8, "serviceProvider.reference":"Organization/aphp-sl"},
    {"id":"E29", "subject.reference":"Patient/P29", "status":"finished", "class.code":"IMP", "period.start":"2023-01-29T10:00:00Z", "length":2, "serviceProvider.reference":"Organization/aphp-sl"},
    {"id":"E30", "subject.reference":"Patient/P30", "status":"finished", "class.code":"AMB", "period.start":"2023-01-30T10:00:00Z", "length":4, "serviceProvider.reference":"Organization/aphp-sl"}
  ]'
  curl -s -X POST -H 'Content-Type: application/json' 'http://localhost:8983/solr/encounterAphp/update?commit=true' --data-binary "$ENCOUNTERS_DATA"

  # 3. DocumentReference (30 documents)
  DOCUMENTS_DATA='[
    {"id":"D1", "subject.reference":"Patient/P1", "status":"current", "type.coding.code":"34133-9", "date":"2023-01-01T12:00:00Z", "description":"Consultation de routine, patient en bonne santé."},
    {"id":"D2", "subject.reference":"Patient/P2", "status":"current", "type.coding.code":"34133-9", "date":"2023-01-02T12:00:00Z", "description":"Suivi post-opératoire, pas de complications."},
    {"id":"D3", "subject.reference":"Patient/P3", "status":"current", "type.coding.code":"34133-9", "date":"2023-01-03T12:00:00Z", "description":"Rapport de radiologie: fracture du tibia."},
    {"id":"D4", "subject.reference":"Patient/P4", "status":"current", "type.coding.code":"34133-9", "date":"2023-01-04T12:00:00Z", "description":"Analyse de sang effectuée le 12/01/2026."},
    {"id":"D5", "subject.reference":"Patient/P5", "status":"current", "type.coding.code":"34133-9", "date":"2023-01-05T12:00:00Z", "description":"Prescription de paracétamol pour maux de tête."},
    {"id":"D6", "subject.reference":"Patient/P9", "status":"current", "type.coding.code":"34133-9", "date":"2023-01-09T12:00:00Z", "description":"Suspicion de cancer du colon, biopsie demandée."},
    {"id":"D7", "subject.reference":"Patient/P12", "status":"current", "type.coding.code":"34133-9", "date":"2023-01-12T12:00:00Z", "description":"Grippe saisonnière détectée."},
    {"id":"D8", "subject.reference":"Patient/P14", "status":"current", "type.coding.code":"34133-9", "date":"2023-01-14T12:00:00Z", "description":"Leucémie (type de cancer) en rémission."},
    {"id":"D9", "subject.reference":"Patient/P16", "status":"current", "type.coding.code":"34133-9", "date":"2023-01-16T12:00:00Z", "description":"Entorse à la cheville gauche."},
    {"id":"D10", "subject.reference":"Patient/P18", "status":"current", "type.coding.code":"34133-9", "date":"2023-01-18T12:00:00Z", "description":"Examen ophtalmologique: vision normale."},
    {"id":"D11", "subject.reference":"Patient/P20", "status":"current", "type.coding.code":"34133-9", "date":"2023-01-20T12:00:00Z", "description":"Consultation pédiatrique."},
    {"id":"D12", "subject.reference":"Patient/P20", "status":"current", "type.coding.code":"34133-9", "date":"2023-01-21T12:00:00Z", "description":"Vaccination rappel DTP."},
    {"id":"D13", "subject.reference":"Patient/P24", "status":"current", "type.coding.code":"34133-9", "date":"2023-01-24T12:00:00Z", "description":"Otite moyenne aiguë."},
    {"id":"D14", "subject.reference":"Patient/P24", "status":"current", "type.coding.code":"34133-9", "date":"2023-01-25T12:00:00Z", "description":"Bilan annuel de santé."},
    {"id":"D20", "subject.reference":"Patient/P11", "status":"current", "type.coding.code":"34133-9", "date":"2023-01-11T12:00:00Z", "description":"Suivi croissance enfant."},
    {"id":"D21", "subject.reference":"Patient/P24", "status":"current", "type.coding.code":"34133-9", "date":"2023-01-26T12:00:00Z", "description":"Dépistage systématique cancer du sein."},
    {"id":"D22", "subject.reference":"Patient/P15", "status":"current", "type.coding.code":"34133-9", "date":"2023-01-15T12:00:00Z", "description":"Rééducation kiné."},
    {"id":"D23", "subject.reference":"Patient/P17", "status":"current", "type.coding.code":"34133-9", "date":"2023-01-17T12:00:00Z", "description":"Visite médicale scolaire."},
    {"id":"D24", "subject.reference":"Patient/P19", "status":"current", "type.coding.code":"34133-9", "date":"2023-01-19T12:00:00Z", "description":"Allergie aux pollens."},
    {"id":"D25", "subject.reference":"Patient/P21", "status":"current", "type.coding.code":"34133-9", "date":"2023-01-21T12:00:00Z", "description":"CR exam onco du 20/18/15... pas de cancer détecté."},
    {"id":"D26", "subject.reference":"Patient/P23", "status":"current", "type.coding.code":"34133-9", "date":"2023-01-23T12:00:00Z", "description":"Douleurs abdominales."},
    {"id":"D27", "subject.reference":"Patient/P25", "status":"current", "type.coding.code":"34133-9", "date":"2023-01-25T12:00:00Z", "description":"Fatigue chronique."},
    {"id":"D28", "subject.reference":"Patient/P27", "status":"current", "type.coding.code":"34133-9", "date":"2023-01-27T12:00:00Z", "description":"Infection urinaire."},
    {"id":"D29", "subject.reference":"Patient/P21", "status":"current", "type.coding.code":"34133-9", "date":"2023-01-22T12:00:00Z", "description":"Eczéma atopique."},
    {"id":"D30", "subject.reference":"Patient/P21", "status":"current", "type.coding.code":"34133-9", "date":"2023-01-23T12:00:00Z", "description":"Rapport de sortie après hospitalisation."}
  ]'
  curl -s -X POST -H 'Content-Type: application/json' 'http://localhost:8983/solr/documentReferenceAphp/update?commit=true' --data-binary "$DOCUMENTS_DATA"

  echo "Initialization finished."
) > /var/solr/logs/init_solr.log 2>&1 &
