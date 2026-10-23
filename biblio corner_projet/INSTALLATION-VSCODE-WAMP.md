# Biblio Corner — installation dans VS Code avec WAMP

## 1. Ouvrir le projet dans VS Code

1. Décompresser l’archive du projet.
2. Ouvrir le dossier décompressé dans VS Code.
3. Installer Node.js 22 ou une version LTS récente.
4. Ouvrir le terminal VS Code dans le dossier du projet.
5. Installer les dépendances :

```bash
pnpm install
```

Si `pnpm` n’est pas installé :

```bash
npm install -g pnpm
```

## 2. Créer la base avec WAMP

1. Démarrer **Apache** et **MySQL** dans WAMP.
2. Ouvrir `http://localhost/phpmyadmin`.
3. Cliquer sur **Importer**.
4. Sélectionner le fichier `database/wamp_biblio_corner.sql`.
5. L’import crée automatiquement la base `biblio_corner` et ses tables.

Le script crée les tables : `users`, `categories`, `authors`, `books`, `members`, `loans`, `returns`, `contactMessages` et `notifications`.

## 3. Configurer la connexion locale

Créer un fichier `.env` à la racine du projet. Ne pas le publier sur GitHub.

```env
DATABASE_URL=mysql://root:@127.0.0.1:3306/biblio_corner
```

Si votre installation WAMP utilise un mot de passe MySQL, remplacez la partie vide après `root:` :

```env
DATABASE_URL=mysql://root:VOTRE_MOT_DE_PASSE@127.0.0.1:3306/biblio_corner
```

Conservez aussi les autres variables nécessaires au projet Manus si vous utilisez l’authentification Manus, le stockage des couvertures ou les services intégrés. Elles ne sont pas incluses dans l’archive pour des raisons de sécurité.

## 4. Lancer le projet

```bash
pnpm dev
```

Le site sera disponible sur l’adresse locale indiquée par le terminal, généralement `http://localhost:3000`.

## 5. Vérifier la connexion

```bash
pnpm check
pnpm test
pnpm build
```

## Important

Le fichier SQL contient la **structure complète** de la base. Les livres de démonstration affichés par l’application peuvent provenir du fallback de démonstration lorsque la base est vide. Pour utiliser vos propres données, ajoutez-les depuis le dashboard ou directement dans phpMyAdmin.

## 6. Accès à Mon espace sans Manus

La page **Mon espace** utilise maintenant un accès local par code PIN et n’affiche plus le bouton de connexion Manus.

Le code PIN initial est :

```text
1234
```

Pour modifier le code, ouvrez :

```text
client/src/pages/MemberArea.tsx
```

Puis changez cette ligne :

```ts
const MEMBER_PIN = "1234";
```

Par exemple :

```ts
const MEMBER_PIN = "2026";
```

Après la modification, redémarrez le serveur avec :

```bash
pnpm dev
```

Le PIN est mémorisé uniquement pendant la session du navigateur. Le bouton de verrouillage dans Mon espace permet de demander à nouveau le code.

## URL locale du projet

L’application est configurée pour utiliser le port `3000`. Après `pnpm dev`, ouvrez uniquement :

```text
http://localhost:3000
```

Cette adresse est locale à votre ordinateur et ne contient aucun nom de service externe.

Le même PIN protège également la page **Espace équipe** (`/admin`). L’accueil et le catalogue restent publics sans code PIN.

## Accès bibliothécaire

Le compte `mikeolivercandio@gmail.com` reçoit le rôle **bibliothécaire**. Il peut ouvrir l’espace équipe et ajouter ou modifier les livres. La suppression des livres reste réservée à l’administrateur.

Pour appliquer ce droit à votre base WAMP locale, ouvrez phpMyAdmin, sélectionnez la base Biblio Corner, puis importez le fichier :

```text
database/grant-mike-librarian.sql
```

Le projet attribue aussi automatiquement ce rôle lorsque cette adresse se connecte pour la première fois.

### Connexion de Mike

Dans **Espace équipe**, Mike saisit :

```text
E-mail : mikeolivercandio@gmail.com
PIN    : 1234
```

Après validation, il est automatiquement dirigé vers **Livres**. Les menus Catégories, Auteurs, Adhérents, Emprunts, Retours, Demandes, Messages et Rapports sont masqués pour ce compte. Il peut créer et modifier un livre, mais la suppression est refusée par le serveur.

## Accès administrateur de Philogene

Le compte `philogeneclaury44@gmail.com` est administrateur. Il conserve l’accès à toutes les fonctions de **Mon espace** : tableau personnel, emprunts et profil. Le backend ne bloque plus l’administrateur sur ces procédures, contrairement au compte bibliothécaire de Mike.

Pour la base WAMP locale, vous pouvez importer :

```text
database/grant-philogene-admin.sql
```

### Connexion administrateur corrigée

Philogene peut maintenant ouvrir **Espace équipe** avec :

```text
E-mail : philogeneclaury44@gmail.com
PIN    : 1234
```

Après connexion, son rôle `admin` lui donne accès à toutes les sections. Mike utilise toujours son adresse et le même PIN, mais reste limité à la section Livres.
