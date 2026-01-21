---

## Issue — [Django] - Gestion des prescriptions médicales

### Contexte

Nous avons besoin de gérer les **prescriptions médicamenteuses** des patients dans l’application.
Une prescription correspond à la prise d’un médicament par un patient sur une période donnée.

Aujourd’hui, cette notion n’existe pas dans le système.

---

### Objectif

Permettre de **créer, consulter et mettre à jour des prescriptions**, et de pouvoir les **rechercher facilement** via différents critères (patient, médicament, statut, dates).

---

## 📌 Règles fonctionnelles

* Une **prescription** est toujours liée :

  * à **un patient**
  * à **un médicament**
* Une prescription possède :

  * une **date de début**
  * une **date de fin**
  * un **statut**
  * un **commentaire optionnel**

---

## 📄 Données métier attendues

### Prescription

* Patient (obligatoire)
* Médicament (obligatoire)
* Date de début (obligatoire)
* Date de fin (obligatoire)
* Statut (obligatoire)

  * valeurs possibles :

    * `valide`
    * `en_attente`
    * `suppr`
* Commentaire (facultatif)

### Règles de validation

* La date de fin doit être **postérieure ou égale** à la date de début
* Le patient et le médicament doivent **exister dans le système**
* Une prescription invalide ne doit pas pouvoir être sauvegardée 

---

## Fonctionnalités attendues (API)

### 1. Consulter les prescriptions

Il doit être possible de récupérer la liste des prescriptions existantes.

La liste doit pouvoir être **filtrée** via les critères suivants :

* par patient
* par médicament
* par statut
* par période de dates (égal/inférieur/supérieur ou égal etc...):

  * date de début (intervalle)
  * date de fin (intervalle)

👉 Les filtres peuvent être combinés entre eux.

---

### 2. Créer une prescription

Il doit être possible de créer une nouvelle prescription en fournissant :

* le patient
* le médicament
* la période (date de début / date de fin)
* le statut
* un commentaire optionnel

Si les données sont invalides, la création doit être refusée avec un message explicite.

---

### 3. Mettre à jour une prescription

Il doit être possible de :

* modifier des informations d’une prescription existante

---

## Données de démonstration

Afin de permettre la validation et les tests :

* Environ **30 prescriptions fictives** doivent être disponibles
* Elles doivent couvrir :

  * plusieurs patients
  * plusieurs médicaments
  * différents statuts
  * différentes périodes de dates

---

## ✅ Critères d’acceptation

* [ ] Une prescription peut être créée avec des données valides
* [ ] Une prescription ne peut pas être créée si toutes les contraintes ne sont pas respectées
* [ ] La liste des prescriptions est accessible
* [ ] Les filtres (patient, médicament, statut, dates) fonctionnent individuellement et combinés
* [ ] Une prescription peut être mise à jour partiellement ou totalement
* [ ] Des prescriptions de démonstration sont présentes pour les tests

---

## 📝 Notes

* L’objectif est d’évaluer la capacité à :

  * comprendre un besoin fonctionnel
  * proposer une modélisation cohérente en rescpectant les bonnes pratiques de code
  * exposer une API propre, efficiente et maintenable

---