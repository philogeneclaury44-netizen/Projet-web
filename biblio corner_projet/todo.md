# Checklist Biblio Corner

## Fonctionnalités livrées

- [x] Modèle relationnel livres, catégories, auteurs, adhérents, emprunts, retours, messages et notifications.
- [x] Migrations Drizzle vérifiées et appliquées à la base connectée.
- [x] Catalogue public avancé avec recherche, filtres, tri et pagination.
- [x] Fiche livre et demande d’emprunt avec validations métier.
- [x] Espace adhérent avec profil, demandes et emprunts.
- [x] Dashboard équipe avec statistiques, activités et graphiques.
- [x] CRUD des livres, catégories, auteurs et adhérents.
- [x] Gestion des statuts d’emprunt, retours, disponibilité et notifications métier.
- [x] Données de démonstration : 30 livres, 10 auteurs, 8 catégories, 20 adhérents et historique de prêts.
- [x] Upload sécurisé des couvertures vers le stockage objet Manus, avec aperçu et URL persistée.
- [x] Centre de notifications persistantes créé automatiquement sur les demandes, retours, validations et retards, avec marquage lu.
- [x] Boîte de réception des messages contact persistés et classables.
- [x] Formulaire contact persistant avec carte MapView, marqueur et fallback visuel.
- [x] Exports CSV et impression PDF des rapports.
- [x] Permissions affinées : consultation/édition équipe pour administrateurs et bibliothécaires, suppressions et classement de messages réservés aux administrateurs.
- [x] État FORBIDDEN explicite côté UX pour un adhérent qui ouvre l’administration.
- [x] README d’installation, d’architecture et d’utilisation.
- [x] Tests Vitest, vérification TypeScript et build de production.

## Vérification finale

- [x] `pnpm check` sans erreur.
- [x] `pnpm test` : 4 tests réussis.
- [x] `pnpm build` réussi.
- [x] Preview desktop et mobile vérifié pour accueil, catalogue, espace adhérent, dashboard, rapports, messages et contact.

## Permissions adhérent

- [x] `member.dashboard` est protégé par une procédure réservée aux adhérents.
- [x] Les emprunts sont filtrés par le `memberId` lié à l’utilisateur connecté.
- [x] Le profil modifiable est limité au membre lié à l’utilisateur connecté.
- [x] Les rôles administrateur et bibliothécaire ne peuvent pas utiliser les procédures de Mon espace.
