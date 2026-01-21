# Exercice Technique : Data Engineer Senior (Scala/Spark/Solr)

Ce projet est une base de travail pour un test technique visant à évaluer la capacité d'un candidat à manipuler des
données FHIR simplifiées avec scala Spark.
Il reprend une version très simplifiée d'une des stack du projet, celle du moteur de requêtes pour la création de
cohortes.
Les technos utilisées sont :

- Scala 2.12
- Spark 3.3
- Solr 8.11
  Le standard Fhir évoqué est R4, pour plus d'informations, consulter la page
  officielle: https://www.hl7.org/fhir/R4/index.html.

Le but de ce moteur est isoler des patients distinct à partir d'un ensemble de critères de recherche liés entre eux.
Dans cet exercice il sera question d'obtenir un comptage distinct de patient à partir d'une requête type sur plusieurs
ressources FHIR.

Le candidat a à disposition un mode d'emploi d'installation des prérequis (bases SolR, données fictives, script
d'initialisation et de lancement de l'application.

L'exercice consiste à coder la fonction scala de ce moteur de requêtes.

## Installation des Prérequis

Pour réaliser cet exercice, vous devez installer Docker, Java et SBT. Voici les instructions détaillées pour chaque
outil.
Avant tout , vous devez vous placer dans le dossier `Exercice_scala_spark`.

### 1. Docker et Docker Compose

Indispensable pour lancer l'instance Solr et les services associés.

#### Sur Windows ou Mac :

- Téléchargez et installez **Docker Desktop** : [docs.docker.com/get-docker/](https://docs.docker.com/get-docker/)
- Assurez-vous que Docker est lancé.

#### Sur Linux (Ubuntu/Debian) :

```bash
# Installation de Docker
sudo apt-get update
sudo apt-get install ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Ajouter votre utilisateur au groupe docker pour éviter d'utiliser sudo
sudo usermod -aG docker $USER
# (Note : Il faudra se déconnecter/reconnecter pour que cela soit pris en compte)
```

**Vérification** :

```bash
docker --version
docker compose version
```

---

### 2. Java (JDK 11 ou 17)

Spark 3.3 et Scala 2.12 nécessitent un JDK compatible. La méthode la plus simple est d'utiliser **SDKMAN!**.

#### Installer SDKMAN! (Linux/Mac) :

```bash
curl -s "https://get.sdkman.io" | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"
```

#### Installer Java via SDKMAN! :

```bash
sdk install java 17.0.10-tem
sdk use java 17.0.10-tem
```

**Vérification** : `java -version` (doit afficher 11.x ou 17.x).

---

### 3. SBT (Scala Build Tool) 1.9.x

L'outil de build pour compiler et lancer le projet.

#### Sur Linux (Debian/Ubuntu) :

```bash
echo "deb https://repo.scala-sbt.org/scalasbt/debian all main" | sudo tee /etc/apt/sources.list.d/sbt.list
echo "deb https://repo.scala-sbt.org/scalasbt/debian /" | sudo tee /etc/apt/sources.list.d/sbt_old.list
curl -sL "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x2EE0EA64E40A89B84B2DF73499E82A75642AC823" | sudo apt-key add
sudo apt-get update
sudo apt-get install sbt
```

#### Via SDKMAN! :

```bash
sdk install sbt
```

**Vérification** : `sbt sbtVersion` (doit être >= 1.9.0).

---

## Setup de l'environnement

**Lancer l'instance Solr** :

   ```bash
   docker compose up -d
   ```

*Note : Le script `init_solr.sh` s'exécute automatiquement au premier lancement (via le
volume `/docker-entrypoint-initdb.d/`) pour créer les collections, définir le schéma et indexer les données de test.*

**Réinitialiser l'environnement** :
Si vous souhaitez supprimer toutes les données Solr et repartir de zéro, vous devez supprimer les volumes associés :

   ```bash
   docker compose down -v
   docker compose up -d
   ```

**Vérifier l'état de Solr** :
Ouvrez [http://localhost:8983](http://localhost:8983) dans votre navigateur. Les
collections `patientAphp`, `encounterAphp`, `documentReferenceAphp` et `organizationAphp` doivent être présentes.

**Créer le fichier de variable d'environnement** :

Un fichier `.env` est déjà fourni dans le dossier `Exercice_scala_spark`.

```bash
mv .env.example .env
```

sinon mettre par défaut la configuration suivante:

```
CRITERIA_PATH=src/main/resources/query.json
SOLR_URL=http://localhost:8983/solr
SOLR_ZK_HOST=localhost:9983
```

---

## Objectif de l'exercice

Le candidat doit compléter la classe `CohortSearchEngine.scala` pour implémenter la méthode `runSearch` capable de
traiter une requête json en entrée de manière dynamique (s'adaptant aux critères de la requête).

- La requête est fournie dans le fichier `query.json`
- Tous les critères sont liès entre eux par des relations `AND`.

Par exemple:
la requête suivante :

```json
{
  "Criteria": [
    {
      "Resource": "Patient",
      "Include": "true",
      "searchParams": "gender=male&active=true"
    },
    {
      "Resource": "Encounter",
      "Include": "true",
      "searchParams": "length=ge5"
    }
  ]
}
```

=> Equivaut fonctionnellement à rechercher tous les patients actifs et ayant le sexe masculin et ayant au moins une
visite de plus de 5 jours.

### Les règles de gestion sont :

#### ETAPE 1: Gérer la partie Criteria

Trouver le nombre de patient correspondant à l'ensemble des critères:
Pour vous aider voici 3 points importants:

1. **Chargement dynamique** : Parcourir la liste `Criteria` du JSON. Chaque critère indique une `Resource` (ex: "
   Patient" -> collection `patientAphp`).
2. **Filtrage Solr** : Traduire les `searchParams` (format FHIR simplifié) en filtres natifs Solr (`fq`).
    - Exemple : `birthDate=ge2005-01-01` devient `birthDate:[2005-01-01T00:00:00Z TO *]`.
    - Exemple : `length=lt12` devient `length:[* TO 11]`.
3. **Logique d'Inclusion/Exclusion** :
    - Si `Include` est `"true"`, on conserve les patients qui possèdent au moins une ressource correspondant aux
      critères (Intersection).
    - Si `Include` est `"false"`, on **exclut** les patients qui possèdent au moins une ressource correspondant aux
      critères (Exclusion / Anti-join).

#### ETAPE 2: Gérer la partie Perimeter

**Gestion des périmètres** : La requête contient des `Perimeters`
-> Il faut exclure tous les patients n'ayant pas au moins eu une
visite (ressource Fhir: Encounter) dans une des organizations de santé.

## Mentions et Points d'évaluations:

- Cet exercice est optionnel, il vaut mieux ne pas le faire si vous n'avez pas de temps que de rendre un devoir non
  complet.
- La base code est fournie, mais vous pouvez la modifier selon vos besoins.
- Il est attendu du candidat de fournir un code fonctionnel respectant les bonnes pratiques, lisible, testé, et
  efficient.
- Une partie importante de l'évaluation se portera sur la logique mise en place pour le moteur de recherche.

---

## Lancement du job

1. **Compiler le projet** :
   ```bash
   sbt compile
   ```

2. **Lancer les tests** (pour vérifier que le setup est OK) :
   ```bash
   sbt test
   ```

3. **Lancer l'application** :
   ```bash
   sbt run
   ```

---
