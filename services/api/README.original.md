Exercice Django — API REST Patients & Médicaments (+ Prescription à implémenter)

Présentation
------------
Base de projet Django + Django REST Framework pour lister des Patients et des Médicaments.

But de l'exercice candidat: ajouter une nouvelle ressource « Prescription » avec une API REST (lecture + création + mise
à jour) et des possibilités de filtrage.


Installation des Prérequis
---------
Le projet utilise Python 3.10 et Django 4.0.
Avant tout, vous devez vous placer dans le répertoire `Exercice_Django`.

### Python et pip

- **Vérifier l'installation:**

```bash
python3 --version
pip3 --version
```

### Installation de Python et pip

**Sur Ubuntu/Debian:**

```bash
sudo apt update 
sudo apt install python3 python3-pip python3-venv
```

Installation
------------

1) Créer un environnement virtuel et installer les dépendances

```bash
python3 -m venv .venv
````

```bash
source .venv/bin/activate  #(Windows: .venv\\Scripts\\activate)
```

```bash
pip install -r requirements.txt
```

2) Initialiser la base de données

```bash
python manage.py makemigrations
```

```bash
python manage.py migrate
```

3) Générer des données fictives

```bash
python manage.py seed_demo --patients 100 --medications 30
```

5) Lancer le serveur de développement

```bash
python manage.py runserver
```

Ouvrir http://127.0.0.1:8000/Patient et http://127.0.0.1:8000/Medication

Endpoints
---------

- GET /Patient
    - Filtres: nom | last_name, prenom | first_name, date_naissance | birth_date (YYYY-MM-DD)
- GET /Medication
    - Filtres: code, label, status (actif | suppr)

- À implémenter par le candidat: /Prescription (voir Énoncé ci‑dessous)

Exemples (curl)
---------------

- curl -s "http://127.0.0.1:8000/Patient"
- curl -s "http://127.0.0.1:8000/Patient?nom=Martin"
- curl -s "http://127.0.0.1:8000/Medication?status=actif"

Énoncé de l'exercice — Prescription
-----------------------------------
Objectif: créer une nouvelle ressource REST « Prescription » pour les prescriptions médicamenteuses des patient:
-> 1 prescription est liée à 1 Patient et 1 Médicament.

1) Modèle de données à créer (medical/models.py)

- id technique auto‑incrément (par défaut Django `id`)
- patient: ForeignKey vers le modèle `Patient` (required)
- medication: ForeignKey vers le modèle `Medication` (required)
- start_date: Date (required)
- end_date: Date (required)
- status: valeur parmi l'enum ["valide", "en_attente", "suppr"]
- comment: champ texte libre (ex. `TextField`, nullable/blank autorisé)

Contraintes/validations attendues:

- `end_date` >= `start_date`
- `patient` et `medication` obligatoires et existants

2) API à exposer

- Route liste/lecture: `GET /Prescription`
    - Doit supporter des filtres via query params:
        - `patient=<id>` (exact)
        - `medication=<id>` (exact)
        - `status=valide|en_attente|suppr`
        - Filtres de dates (format YYYY-MM-DD):
            - `date_debut_from`, `date_debut_to`
            - `date_fin_from`, `date_fin_to`
- Route création: `POST /Prescription`
    - Corps JSON minimal attendu:
      ```json
      {
        "patient": 1,
        "medication": 1,
        "date_debut": "2025-03-01",
        "date_fin": "2025-04-01",
        "status": "valide",
        "comment": "..."
      }
      ```
- Route mise à jour: `PUT /Prescription/<id>` ou `PATCH /Prescription/<id>`

3) Données de test / démo

- Vérifier le modèle et l’API en ajoutant ~30 prescriptions fictives.

4) Exemples (curl)

- Lister toutes les prescriptions:
  ```bash
  curl -s "http://127.0.0.1:8000/Prescription"
  ```
- Filtrer par patient et statut:
  ```bash
  curl -s "http://127.0.0.1:8000/Prescription?patient=1&status=valide"
  ```
- Filtrer par intervalle de dates de début:
  ```bash
  curl -s "http://127.0.0.1:8000/Prescription?date_debut_from=2025-01-01&date_debut_to=2025-12-31"
  ```
- Créer une prescription:
  ```bash
  curl -s -X POST "http://127.0.0.1:8000/Prescription" \
       -H 'Content-Type: application/json' \
       -d '{
             "patient": 1,
             "medication": 1,
             "date_debut": "2025-03-01",
             "date_fin": "2025-04-01",
             "status": "valide",
             "comment": "Posologie standard"
           }'
  ```
- Mettre à jour une prescription:
  ```bash
  curl -s -X PATCH "http://127.0.0.1:8000/Prescription/1" \
       -H 'Content-Type: application/json' \
       -d '{ "status": "en_attente" }'
  ```

5) Critères d’acceptation

- Le modèle `Prescription` et les migrations existent
- Les routes `GET /Prescription`, `POST /Prescription`, `PUT|PATCH /Prescription/<id>` fonctionnent
- Les filtres demandés renvoient les résultats attendus
- 30 prescriptions fictives ont été ajoutées et testées

Bonus (facultatif):

- test unitaire
- Commande `seed_prescriptions`

Où coder ?
----------
Vous ajouterez le code dans le dossier `medical/` en respectant le fonctionnement du projet Django existant.
