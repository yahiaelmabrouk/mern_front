# TaskFlow PME — Client (Frontend)

Application monopage **React 18 + Vite** pour le suivi de tâches d'entreprise. Elle consomme l'API REST Express du dossier [`../backend`](../backend/README.md).

## Fonctionnalités

- **Mode visiteur (lecture seule)** : consultation des tâches et des commentaires sans compte.
- **Inscription / connexion** avec session JWT conservée après rechargement de la page.
- **Gestion des tâches** : création, changement de statut, suppression (titre, description, priorité, statut, échéance).
- **Commentaires** sur chaque tâche : ajout et suppression.
- **Droits** : seul l'auteur (ou un Admin) peut modifier ou supprimer ses éléments.
- **Déconnexion automatique** si le token expire (réponse `401`).

## Stack technique

| Rôle | Outil |
|---|---|
| UI | React 18 |
| Build / serveur de dev | Vite 5 |
| État global | Redux Toolkit + React-Redux |
| Requêtes HTTP | Axios (avec intercepteurs) |

## Prérequis

- **Node.js ≥ 18**
- L'API [backend](../backend/README.md) démarrée (par défaut sur `http://localhost:5000`)

## Installation

```bash
cd front
npm install
npm run dev
```

L'application est disponible sur **http://localhost:5173**.

Compte de démonstration (créé par le backend au premier lancement) : `admin@pme.tn` / `123456`.

## Variables d'environnement

| Variable | Défaut | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000/api` | URL de base de l'API, **avec `/api` à la fin**. |

En local, aucune configuration n'est nécessaire si l'API tourne sur le port 5000. Sinon, copier [`.env.example`](.env.example) en `.env` :

```env
VITE_API_URL=https://mon-taskflow-api.onrender.com/api
```

> Les variables Vite sont intégrées **au moment du build** : redémarrer `npm run dev` ou reconstruire après modification.

## Scripts

| Commande | Action |
|---|---|
| `npm run dev` | Serveur de développement avec rechargement à chaud. |
| `npm run build` | Build de production dans `dist/`. |
| `npm run preview` | Prévisualise le build de production en local. |

## Structure du projet

```
front/
├── index.html
├── public/                    Ressources statiques (favicon)
└── src/
    ├── main.jsx               Point d'entrée : <Provider store> + <App />
    ├── App.jsx                Mise en page ; formulaire de tâche ou carte d'authentification
    ├── constants.js           Statuts, priorités, libellés, formatage des dates
    ├── index.css              Styles globaux
    ├── api/
    │   └── axiosClient.js     Instance Axios + intercepteurs JWT
    ├── redux/
    │   ├── store.js           Configuration du store
    │   ├── authSlice.js       Utilisateur + token (persistés dans localStorage)
    │   └── taskSlice.js       Liste des tâches, chargement, erreurs
    └── components/
        ├── Navbar.jsx         Barre de navigation / déconnexion
        ├── AuthCard.jsx       Connexion et inscription
        ├── TaskForm.jsx       Création d'une tâche
        ├── TaskList.jsx       Liste des tâches
        ├── TaskCard.jsx       Carte d'une tâche
        ├── CommentSection.jsx Commentaires d'une tâche
        ├── FeedbackAlert.jsx  Messages de succès / d'erreur
        ├── FormField.jsx      Champ de formulaire réutilisable
        └── Badge.jsx          Pastilles de statut et de priorité
```

## Fonctionnement

### Authentification

1. `AuthCard` appelle `/auth/login` ou `/auth/register` et reçoit `{ user, token }`.
2. `authSlice.loginSuccess` stocke la session dans Redux **et** dans `localStorage` (`user`, `token`).
3. À chaque requête, l'intercepteur d'`axiosClient` ajoute `Authorization: Bearer <token>`.
4. Sur une réponse `401` avec un token présent, l'intercepteur déclenche `logout()`.

### Gestion de l'état

- **Redux** : utilisateur connecté et liste des tâches (partagés entre plusieurs composants).
- **État local (`useState`)** : commentaires d'une carte et champs de formulaire.

## Déploiement (Vercel)

1. *New Project* → importer le dépôt, dossier racine `front` (preset **Vite**).
2. Variable d'environnement : `VITE_API_URL=https://<votre-api>/api`.
3. Build : `npm run build` · Sortie : `dist`.
4. Dans le backend, définir `CLIENT_URL` avec l'URL Vercel définitive (sans `/` final) pour autoriser CORS.
