# 🏢 Hinov Suivi - ERP Modulaire & Multi-Services

Application d'entreprise multi-plateforme en architecture **Monorepo** (gérée avec **Turborepo** et **pnpm**), connectée à **Supabase**, dotée d'un **système de contrôle d'accès avancé permettant d'activer ou désactiver des modules par utilisateur via des boutons toggle (interrupteurs)**.

---

## 🚀 Fonctionnalités Clés

1. **Architecture Monorepo Unifiée :**
   - `packages/core` : Logique métier partagée, typage TypeScript strict, calculs financiers en temps réel, client Supabase et vérificateur d'accès.
   - `apps/web` : Application Web React basée sur le template Materially épuré + MUI + Lucide Icons.
   - `apps/desktop` : Application Desktop Electron avec menu natif et intégration sécurisée IPC.
   - `apps/mobile` : Application Mobile React Native avec Expo et navigation modulaire.

2. **Système de Permissions Granulaires par Interrupteur (Toggles) :**
   - Les administrateurs (`ADMIN`) ont accès à une matrice interactive en temps réel.
   - Chaque module peut être activé ou désactivé individuellement pour chaque collaborateur.
   - L'interface s'adapte dynamiquement : le menu latéral, les raccourcis et les widgets du tableau de bord affichent uniquement les modules autorisés.

3. **Services Métiers Intégrés :**
   - 🛠️ **Maintenance & Pannes :** Gestion des sites, suivi des équipements défaillants, attribution des techniciens et clôture des interventions.
   - 📦 **Stocks & Consommables :** Suivi de l'inventaire, alertes automatiques en cas de seuil critique bas, calcul de la valeur du stock immobilisé et potentiel de marge.
   - 💰 **Dépenses & Journal de Caisse :** Journal de trésorerie avec calcul du solde en temps réel $\text{Solde} = \sum(\text{Entrées}) - \sum(\text{Sorties})$.
   - 📄 **Prestations & Commandes :** Gestion des devis, facturation, simulateur et calcul de rentabilité/marge nette.

---

## 📁 Structure du Monorepo

```
hinov-suivi/
├── apps/
│   ├── web/                     # React 19 + Vite + MUI (Template Materially nettoyé)
│   ├── desktop/                 # Electron Desktop Wrapper
│   └── mobile/                  # React Native + Expo
├── packages/
│   └── core/                    # Logique métier, calculs financiers, Supabase & types
├── supabase/
│   ├── schema.sql               # Schéma PostgreSQL DDL complet avec RLS & triggers
│   └── seed.sql                 # Données de démonstration prêtes à l'emploi
├── turbo.json                   # Pipeline Turborepo
├── pnpm-workspace.yaml          # Workspaces pnpm
├── .env.example                 # Variables d'environnement
└── README.md                    # Documentation complète
```

---

## 🛠️ Installation & Démarrage Rapide

### Prérequis
- [Node.js](https://nodejs.org/) (version 18 ou supérieure recommandée)
- [pnpm](https://pnpm.io/) (version 9 ou supérieure) : `npm install -g pnpm`

### 1. Cloner et installer les dépendances
```bash
# Installer toutes les dépendances du monorepo
pnpm install
```

### 2. Configuration Supabase (Optionnel)
Créez un fichier `.env` à la racine ou dans `apps/web/.env` :
```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon-publique
```
> **Note :** L'application intègre un mode persistant local réactif. Si vous n'avez pas encore créé de projet Supabase, l'ERP fonctionne immédiatement avec le jeu de données de test complet.

### 3. Exécuter les migrations SQL dans Supabase (Si connecté)
Dans l'éditeur SQL de votre tableau de bord Supabase :
1. Exécutez le script [`supabase/schema.sql`](supabase/schema.sql)
2. Exécutez le script d'initialisation [`supabase/seed.sql`](supabase/seed.sql)

---

## 💻 Commandes de Lancement

| Commande | Action |
| :--- | :--- |
| `pnpm dev` | Lance l'ensemble des applications du monorepo en parallèle avec Turborepo |
| `pnpm dev:web` | Démarre l'application Web React sur `http://localhost:3000` |
| `pnpm dev:desktop` | Démarre l'application Desktop Electron |
| `pnpm dev:mobile` | Démarre le serveur de développement mobile Expo |
| `pnpm build` | Compile l'ensemble des packages et applications |

---

## 👥 Profils de Démonstration Disponibles

Un sélecteur rapide de profil est intégré en haut à droite dans la barre de navigation pour tester instantanément l'impact des toggles de permissions :

1. **👑 Alexandre Kouamé (Directeur Général - ADMIN) :**
   - Accès universel complet à tous les modules et au panneau de gestion des toggles.
2. **🔧 Koffi Paul (Chef Service Maintenance - USER) :**
   - Accès aux modules *Maintenance* et *Stocks*.
3. **📦 Awa Diop (Gestionnaire de Stock - USER) :**
   - Accès au module *Stocks & Consommables*.
4. **💼 Jean-Marc Bamba (Comptable & Trésorier - USER) :**
   - Accès aux modules *Dépenses & Caisse* et *Prestations & Commandes*.

---

## 🔒 Sécurité et Base de Données

- **Table `profiles` :** Utilisateurs liés à `auth.users` avec rôle `ADMIN` ou `USER`.
- **Table `modules` :** Définition des modules de l'ERP (`MAINTENANCE`, `STOCKS`, `CAISSE_DEPENSES`, `PRESTATIONS`).
- **Table `user_modules` :** Association unique `(user_id, module_id)` avec indicateur booléen `is_enabled` piloté par les interrupteurs.
- **Row-Level Security (RLS) :** Politiques PostgreSQL actives pour protéger les lectures et écritures.

