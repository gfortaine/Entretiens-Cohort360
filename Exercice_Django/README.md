# Exercice Django — API REST Patients, Médicaments & Prescriptions

[![Python 3.12](https://img.shields.io/badge/Python-3.12-blue.svg)](https://www.python.org/downloads/)
[![Django 5.2 LTS](https://img.shields.io/badge/Django-5.2%20LTS-green.svg)](https://docs.djangoproject.com/en/5.2/)
[![uv](https://img.shields.io/badge/uv-0.7+-orange.svg)](https://docs.astral.sh/uv/)
[![Tests: 29 passing](https://img.shields.io/badge/tests-29%20passing-brightgreen.svg)](medical/tests/)

> API REST pour la gestion des prescriptions médicamenteuses des patients.

## 📋 Table des matières

- [Stack technique](#stack-technique)
- [Installation rapide (uv)](#installation-rapide-uv)
- [Installation classique (pip)](#installation-classique-pip)
- [Endpoints API](#endpoints-api)
- [Tests](#tests)
- [Développement](#développement)

## Stack technique

| Composant | Version | Notes |
|-----------|---------|-------|
| Python | 3.12 | Pinned via `.python-version` |
| Django | 5.2 LTS | Support jusqu'à avril 2028 |
| DRF | 3.15+ | Django REST Framework |
| uv | 0.7+ | Gestionnaire de paquets Rust-based |
| ruff | 0.9+ | Linting & formatting |
| mypy | 1.14+ | Type checking avec django-stubs |
| pytest | 9.0+ | Testing avec pytest-django |

## Installation rapide (uv)

> **Recommandé** - Installation en moins de 30 secondes avec [uv](https://docs.astral.sh/uv/)

```bash
# 1. Installer uv (si pas déjà installé)
curl -LsSf https://astral.sh/uv/install.sh | sh

# 2. Cloner et installer
cd Exercice_Django
uv sync --all-extras

# 3. Initialiser la base de données
uv run python manage.py migrate
uv run python manage.py seed_demo --patients 100 --medications 30

# 4. Lancer le serveur
uv run python manage.py runserver
```

Ouvrir http://127.0.0.1:8000/Prescription

## Installation classique (pip)

```bash
# Créer un environnement virtuel
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Installer les dépendances
pip install -e ".[dev]"

# Initialiser la base de données
python manage.py migrate
```

3) Générer des données fictives
   (cela peut prendre plusieurs secondes)
```bash
python manage.py seed_demo --patients 2500 --medications 150 
```

# Lancer le serveur
python manage.py runserver
```

## Endpoints API

### Patients

| Méthode | Endpoint | Filtres |
|---------|----------|---------|
| GET | `/Patient` | `nom`, `prenom`, `date_naissance` (YYYY-MM-DD) |

### Médicaments

| Méthode | Endpoint | Filtres |
|---------|----------|---------|
| GET | `/Medication` | `code`, `label`, `status` (actif\|suppr) |

### Prescriptions ✨

Énoncé de l'exercice — Prescription
-----------------------------------
L'exercice prend la forme d'une Issue Git que pourrait donner une Product Owner du projet: [Issue-Prescriptions-001.md](Issue-Prescriptions-001.md)
L’objectif est de concevoir une nouvelle ressource REST « Prescription », destinée à la gestion des prescriptions médicamenteuses des patients.

Vous êtes libre de modifier le code existant et de proposer l’implémentation de votre choix.
Le code fourni devra respecter les bonnes pratiques de développement, être pleinement fonctionnel.
Les commentaires s'ils sont nécessaires doivent être clairs et pertinents.
