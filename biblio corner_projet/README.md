# Biblio Corner

Biblio Corner est une application web moderne de gestion de bibliothèque, conçue pour séparer clairement l’expérience publique du catalogue et les outils de gestion de l’équipe. Le projet couvre la consultation des livres, la recherche avancée, les demandes d’emprunt, l’espace adhérent, le suivi des retours et un cockpit administratif avec statistiques et rapports visuels.

## Fonctionnalités

### Espace public

- Accueil éditorial avec présentation, rayons, horaires et contact.
- Catalogue complet avec recherche par titre, auteur, catégorie, ISBN ou éditeur.
- Filtres par catégorie, auteur, année et disponibilité.
- Tri par titre, année ou nombre d’exemplaires disponibles.
- Pagination, états de chargement et état vide explicite.
- Fiche livre avec couverture typographique, métadonnées, disponibilité et demande d’emprunt.
- Formulaire de demande avec validation des coordonnées et confirmation toastée.

### Espace adhérent

- Vue d’ensemble des emprunts et demandes.
- Compteurs des emprunts en cours, demandes en attente, retours et retards.
- Historique des demandes et emprunts.
- Profil modifiable avec coordonnées et adresse.
- Accès protégé par l’authentification Manus OAuth.

### Administration

- Sidebar persistante et navigation responsive.
- Dashboard avec statistiques : livres, disponibilités, auteurs, catégories, adhérents, emprunts actifs, retards et demandes.
- Graphiques Recharts pour l’évolution des emprunts, la répartition par catégorie, les livres les plus empruntés et les nouveaux adhérents.
- CRUD des livres, catégories, auteurs et adhérents.
- Gestion des emprunts, demandes, retours et statuts.
- Règles métier : disponibilité, limite de cinq emprunts actifs, doublons de demandes, adhésion active et protection des suppressions liées à des emprunts ou livres.
- Rapports visuels accessibles depuis la navigation équipe.

## Architecture

Le projet utilise React 19, TypeScript, Tailwind CSS 4, Express, tRPC 11, Drizzle ORM et MySQL/TiDB.

```text
client/
  src/pages/              Pages publiques, catalogue, espace adhérent et administration
  src/components/         Layouts, composants UI et graphiques
  src/lib/trpc.ts         Client tRPC typé
server/
  db.ts                   Helpers et requêtes Drizzle
  routers.ts              Procédures tRPC et règles métier
  _core/                  Authentification Manus et infrastructure
 drizzle/
  schema.ts               Modèle relationnel
  migrations/             Migrations générées
shared/                    Types et constantes partagés
```

## Modèle de données

Les tables principales sont `users`, `categories`, `authors`, `books`, `members`, `loans` et `returns`. Les relations métier sont représentées par `categoryId`, `authorId`, `memberId`, `bookId`, `loanId` et `userId`. Les timestamps sont persistés comme dates UTC au niveau de l’API et affichés dans le fuseau local de l’utilisateur.

Le statut d’un livre peut être `active` ou `archived`. Les statuts de prêt couvrent `requested`, `approved`, `borrowed`, `returned`, `overdue`, `rejected` et `cancelled`. Les adhérents peuvent être `active`, `inactive` ou `suspended`.

## Installation locale

```bash
pnpm install
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
pnpm dev
```

La commande `pnpm check` vérifie le typage, `pnpm test` exécute Vitest et `pnpm build` compile le frontend et le serveur.

## Configuration

Le runtime WebDev fournit les variables suivantes : `DATABASE_URL`, `JWT_SECRET`, `VITE_APP_ID`, `OAUTH_SERVER_URL`, `VITE_OAUTH_PORTAL_URL`, `OWNER_OPEN_ID` et les variables Forge nécessaires aux services Manus. Ne jamais committer un fichier `.env` ni de secret.

L’authentification s’appuie sur Manus OAuth. Aucun mot de passe n’est stocké dans cette application. Les procédures administratives sont protégées par une procédure tRPC d’équipe qui accepte les rôles `admin` et `librarian`.

## Données de démonstration

Lorsque la base est vide, l’interface publique et le dashboard utilisent un jeu de démonstration réaliste comprenant 30 livres, 10 auteurs, 8 catégories, 20 adhérents et plusieurs demandes, emprunts, retours et retards. Les écritures CRUD restent réservées à la base connectée ; les données de démonstration servent à rendre les parcours immédiatement présentables.

## Parcours de validation

1. Ouvrir l’accueil et lancer une recherche.
2. Explorer `/catalogue`, appliquer un filtre et changer la pagination.
3. Ouvrir une fiche livre et envoyer une demande d’emprunt.
4. Ouvrir `/espace-adherent` pour vérifier le parcours de connexion et l’espace personnel.
5. Ouvrir `/admin` pour consulter les tables CRUD, les demandes et les rapports.
6. Lancer `pnpm check`, `pnpm test` puis `pnpm build` avant toute livraison.

## Extensions opérationnelles

Les couvertures de livres peuvent être envoyées depuis le formulaire CRUD équipe. Les octets sont validés côté serveur puis déposés via `storagePut` dans le stockage objet Manus ; seule l’URL `/manus-storage/...` est conservée dans la table `books`.

Le formulaire de contact persiste les messages dans `contactMessages`. L’équipe les consulte dans sa boîte de réception et les administrateurs peuvent les classer comme nouveaux, lus ou archivés. La section contact inclut également un `MapView` Google Maps avec marqueur à l’adresse de la bibliothèque et un fallback visuel pendant le chargement du proxy.

Les demandes d’emprunt et changements de statut créent des notifications persistantes dans `notifications`. La cloche du dashboard permet de consulter les événements et de les marquer comme lus. Les rapports proposent un export CSV client et une impression PDF via le navigateur.

Les rôles `admin`, `librarian` et `member` sont distincts. Les administrateurs et bibliothécaires peuvent consulter et éditer l’espace équipe, les suppressions et le classement des messages sont réservés aux administrateurs, et un adhérent qui ouvre `/admin` reçoit un état d’accès refusé explicite.
