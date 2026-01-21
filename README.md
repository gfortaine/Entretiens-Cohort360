# 🏥 Entretiens Cohort360 - Exercices Fullstack

[![Django 5.2 LTS](https://img.shields.io/badge/Django-5.2%20LTS-green.svg)](https://docs.djangoproject.com/en/5.2/)
[![React 19](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.57-orange.svg)](https://playwright.dev/)
[![Tests: 71 passing](https://img.shields.io/badge/tests-71%20passing-brightgreen.svg)](#tests)

> **Candidature Développeur Fullstack Senior - AP-HP/Cohort360**
> 
> Exercices techniques complétés avec stack moderne et tests e2e complets.

---

## ✅ Statut des Exercices

| Exercice | Status | Tests | Stack |
|----------|--------|-------|-------|
| **Backend Django** | ✅ Complété | 29/29 | Django 5.2 LTS, DRF, uv |
| **Frontend React** | ✅ Complété | 18/18 | React 19, TypeScript, Vite |
| **Scala/Spark** | ✅ Complété | Compile | Scala 2.12, Spark 3.5 |
| **E2E Tests** | ✅ Ajouté | 24/24 | Playwright, Page Object Model |

**Total: 71 tests passants**

---

## 🚀 Quick Start

```bash
# 1. Installer les dépendances (uv + npm)
curl -LsSf https://astral.sh/uv/install.sh | sh

# 2. Backend Django
cd Exercice_Django
uv sync --all-extras
uv run python manage.py migrate
uv run python manage.py seed_demo --patients 100 --medications 30
uv run python manage.py runserver 8000

# 3. Frontend React (nouveau terminal)
cd Exercice_Front/prescription-app
npm install
npm run dev

# 4. Ouvrir l'application
open http://127.0.0.1:3000
```

---

## 🧪 Tests

### Exécuter tous les tests

```bash
# Backend Django (29 tests)
cd Exercice_Django && uv run pytest medical/tests/ -v

# Frontend React (18 tests)
cd Exercice_Front/prescription-app && npm test

# E2E Playwright (24 tests) - serveurs doivent tourner
npm run test:e2e
```

### Scripts disponibles

```bash
npm run test:django     # Tests Django unitaires
npm run test:frontend   # Tests React/Vitest
npm run test:e2e        # Tests Playwright e2e
npm run test:e2e:ui     # Mode UI interactif
npm run test:api        # Tests API uniquement
npm run dev:django      # Lancer Django
npm run dev:frontend    # Lancer React
```

---

## 📦 Architecture

```
Entretiens-Cohort360/
├── Exercice_Django/           # Backend API REST
│   ├── config/                # Django 5.2 LTS settings
│   ├── medical/               # App principale
│   │   ├── models.py          # Patient, Medication, Prescription
│   │   ├── serializers.py     # DRF serializers
│   │   ├── views.py           # ViewSets avec filtres
│   │   └── tests/             # 29 tests unitaires
│   └── pyproject.toml         # Config uv + outils dev
│
├── Exercice_Front/            # Frontend React
│   └── prescription-app/
│       ├── src/
│       │   ├── components/    # PrescriptionForm, List, Filters
│       │   ├── hooks/         # React Query hooks
│       │   ├── api/           # Client Axios
│       │   └── test/          # 18 tests Vitest
│       └── package.json
│
├── Exercice_scala_spark/      # Traitement données
│   └── src/main/scala/        # CohortSearchEngine
│
├── tests/                     # E2E Tests Playwright
│   ├── pages/                 # Page Object Model
│   ├── api/                   # API integration tests
│   └── prescriptions/         # UI e2e tests
│
└── playwright.config.ts       # Config Playwright
```

---

## 🔧 Stack Technique

### Backend
- **Django 5.2 LTS** - Support jusqu'à avril 2028
- **Django REST Framework 3.15** - API REST
- **django-filter** - Filtres avancés
- **django-cors-headers** - CORS support
- **uv** - Package manager Rust-based (10x plus rapide que pip)
- **ruff** - Linting & formatting
- **mypy + django-stubs** - Type checking
- **pytest-django** - Testing

### Frontend
- **React 19** - Dernière version stable
- **TypeScript 5.9** - Type safety
- **Vite (rolldown-vite)** - Build ultra-rapide
- **TanStack React Query** - Data fetching & caching
- **React Hook Form + Zod** - Formulaires & validation
- **Vitest** - Testing

### E2E Testing
- **Playwright 1.57** - Multi-browser testing
- **Page Object Model** - Maintenabilité
- **Accessibility-first locators** - WCAG compliant
- **API mocking** - Tests isolés

---

## 📋 Exercice Django - API Prescription

### Endpoints implémentés

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/Prescription` | Liste avec filtres |
| GET | `/Prescription/{id}` | Détail |
| POST | `/Prescription` | Création |
| PUT/PATCH | `/Prescription/{id}` | Mise à jour |
| DELETE | `/Prescription/{id}` | Suppression |

### Filtres disponibles
- `patient=<id>` - Filtrer par patient
- `medication=<id>` - Filtrer par médicament
- `status=valide|en_attente|suppr` - Filtrer par statut
- `date_debut_from`, `date_debut_to` - Intervalle date début
- `date_fin_from`, `date_fin_to` - Intervalle date fin

### Exemple création
```bash
curl -X POST "http://127.0.0.1:8000/Prescription" \
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

---

## 📋 Exercice Frontend - React App

### Fonctionnalités
- ✅ Affichage liste des prescriptions avec données patient/médicament
- ✅ Formulaire de création avec validation Zod
- ✅ Filtres dynamiques (patient, médicament, status, dates)
- ✅ Feedback utilisateur (succès/erreur)
- ✅ Responsive design
- ✅ Gestion d'état avec React Query

---

## 📋 Exercice Scala/Spark - CohortSearchEngine

### Fonctionnalités
- ✅ Recherche de cohortes avec requêtes JSON
- ✅ Filtres sur âge, genre, pathologies
- ✅ Opérateurs AND/OR/NOT
- ✅ Connexion Solr pour données FHIR

---

## 🎯 Améliorations apportées

1. **Migration Django 5.2 LTS** - Support jusqu'en 2028
2. **Migration uv** - Remplacement pip/venv (10x plus rapide)
3. **pyproject.toml** - Configuration moderne Python
4. **Tests E2E Playwright** - 24 tests API + UI
5. **Page Object Model** - Maintenabilité des tests
6. **CORS support** - Intégration frontend/backend
7. **TypeScript strict** - Type safety complète
8. **Documentation complète** - README modernisés

---

## 📖 Branches Git

| Branche | Contenu |
|---------|---------|
| `main` | Code original des exercices |
| `feature/exercise-django-prescription` | Solution Django |
| `feature/exercise-frontend-prescription` | Solution Frontend |
| `feature/exercise-scala-spark` | Solution Scala |
| `feature/consolidated-exercises-e2e` | **Branche finale avec tout** |

---

## 👤 Auteur

**Guillaume FORTAINE**
- Candidature: Développeur Fullstack Senior - AP-HP/Cohort360
- Stack: TypeScript, React, Python, Django, Scala, Spark

---

**Merci pour votre attention ! 🎓**
