# Spider Solitaire - PWA & TWA

Une application de jeu Spider Solitaire développée pour tester et démontrer le fonctionnement des **Progressive Web Apps (PWA)** et des **Trusted Web Activities (TWA)**, permettant de transformer une PWA en application mobile Android native.
Aussi sans pub pour ma grand mère ;)

## 🎯 Objectif du projet

Ce projet illustre comment :
- Créer une PWA avec React et Vite
- Déployer automatiquement sur GitHub Pages
- Convertir la PWA en application Android (APK/AAB) via TWA
- Établir une relation de confiance entre le site web et l'application mobile

---

## 🛠️ Technologies utilisées

### Génération du projet
Le projet a été initialement généré avec **Lovable** (anciennement GPT Engineer), un outil de génération de code qui crée une stack Vite + React complète avec shadcn/ui.

### React
Framework JavaScript pour construire l'interface utilisateur avec des composants réutilisables. L'application utilise :
- **React 18** avec hooks
- **React Router** pour la navigation
- **Radix UI** pour les composants accessibles
- **Tailwind CSS** pour le styling

### Vite
Build tool moderne qui offre :
- Démarrage du serveur de développement
- Hot Module Replacement
- Build optimisé pour la production avec Rollup
- Configuration simple pour le déploiement

### PWA (Progressive Web App)
- **vite-plugin-pwa** pour générer automatiquement le service worker
- **Manifest Web App** ([manifest.webmanifest](public/manifest.json)) pour les métadonnées
- Support offline et installation sur l'écran d'accueil

---

## 🚀 Lancer le projet en local

### Prérequis
- **Node.js** (version 20 ou supérieure)
- **npm** ou **yarn**

### Installation

```bash
# Cloner le repository
git clone https://github.com/nicolasfavier/spade-solitaire.git
cd spade-solitaire

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

L'application sera accessible à : **http://localhost:8080**

### Commandes disponibles

```bash
npm run dev          # Démarre le serveur de développement
npm run build        # Build de production
npm run preview      # Preview du build de production
npm run lint         # Vérifier le code avec ESLint
```

---

## 📦 Déploiement sur GitHub Pages

Pour déployer une application React Vite sur GitHub Pages, il faut :
1. Créer un **repository public** sur GitHub
2. Configurer Vite avec le bon chemin de base
3. Adapter React Router pour le sous-chemin
4. Créer un workflow GitHub Actions pour automatiser le déploiement

### 1. Configuration Vite

Le fichier [`vite.config.ts`](vite.config.ts) est configuré pour GitHub Pages :

```typescript
base: mode === 'production' ? '/spade-solitaire/' : '/'
```

Cela permet d'avoir les bons chemins d'assets en production tout en gardant `/` en local.

### 2. Configuration React Router

Le [`App.tsx`](src/App.tsx) utilise le `basename` dynamique :

```typescript
<BrowserRouter basename={import.meta.env.BASE_URL}>
```

Le `basename` s'adapte automatiquement selon l'environnement grâce à `import.meta.env.BASE_URL` qui récupère la valeur de `base` définie dans `vite.config.ts`.

### 3. GitHub Actions - Déploiement automatique

Le déploiement se fait automatiquement via GitHub Actions. Tout est déjà configuré, il suffit de créer le fichier [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) :

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]  # Déploiement automatique à chaque push sur main
  workflow_dispatch:     # Permet de lancer manuellement si besoin

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'  # Vite génère le build dans le dossier dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Ce workflow** :
1. S'exécute à chaque push sur `main`
2. Installe Node.js 20 et les dépendances npm
3. Build le projet avec `npm run build` (Vite génère dans `./dist`)
4. Upload les fichiers buildés
5. Déploie automatiquement sur GitHub Pages

### 4. Activation de GitHub Pages

Dans les paramètres du repository GitHub :
1. Aller dans **Settings** > **Pages**
2. Dans **Source**, sélectionner **GitHub Actions**
3. Le déploiement se fera automatiquement à chaque push

**URL de production** : https://nicolasfavier.github.io/spade-solitaire/

---

## 📱 Création d'une TWA (Trusted Web Activity)

### Qu'est-ce qu'une TWA ?

Une **TWA** permet d'empaqueter votre PWA dans une application Android native sans bannière de navigateur, offrant une expérience totalement intégrée.

### Étapes de création

#### 1. Initialiser le projet TWA avec Bubblewrap

```bash
npm install -g @bubblewrap/cli

bubblewrap init --manifest=https://nicolasfavier.github.io/spade-solitaire/manifest.webmanifest
```

Cette commande génère le fichier [`twa-manifest.json`](twa-manifest.json) contenant tous les paramètres de l'application Android.

#### 2. Créer un Keystore (si nécessaire)

⚠️ **Important** : Ne jamais commit le keystore dans Git !

```bash
keytool -genkey -v -keystore my-release-key.keystore \
  -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

Ajoutez `*.keystore` dans votre `.gitignore`.

#### 3. Build de l'application Android

```bash
bubblewrap build
```

Cela génère un fichier **AAB** (Android App Bundle) prêt pour le Google Play Store.

#### 4. Installation de l'application Android

```bash
bubblewrap install
```

---

## 🔐 Établir la relation de confiance (Asset Links)

Pour supprimer la bannière "Ouvert dans Chrome" et établir une relation de confiance :

### 1. Fichier assetlinks.json

Le fichier [`public/.well-known/assetlinks.json`](public/.well-known/assetlinks.json) contient :

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "io.nicolasfavier.spider",
    "sha256_cert_fingerprints": [
      "D4:A4:A1:9C:E3:EF:CC:E0:00:EA:7B:6A:1D:79:1F:7B:8A:BE:3A:C8:49:0A:8C:C9:9B:01:17:84:0E:AB:1F:E9"
    ]
  }
}]
```

### 2. Obtenir l'empreinte SHA-256

```bash
keytool -list -v -keystore my-release-key.keystore -alias my-key-alias
```

### 3. Déploiement du fichier assetlinks.json

Le fichier doit être accessible à **la racine de votre domaine GitHub Pages** :
```
https://nicolasfavier.github.io/.well-known/assetlinks.json
```

#### Astuce GitHub Pages

Pour avoir le fichier à la racine de votre domaine GitHub Pages (et non dans un sous-dossier) :

1. **Créez un repository spécial** nommé `<votre-username>.github.io`
   - Exemple : `nicolasfavier.github.io`
   - Ce repository devient automatiquement accessible à `https://nicolasfavier.github.io/`

2. **Copiez le dossier `.well-known`** de votre projet dans ce repository
   ```bash
   # Dans votre repository username.github.io
   mkdir -p .well-known
   cp ../spade-solitaire/public/.well-known/assetlinks.json .well-known/
   ```

3. **Commitez et pushez**
   ```bash
   git add .well-known/assetlinks.json
   git commit -m "Add assetlinks.json for TWA verification"
   git push
   ```

Le fichier sera alors accessible à : `https://nicolasfavier.github.io/.well-known/assetlinks.json`

> **Note** : Même si votre PWA est hébergée sur `https://nicolasfavier.github.io/spade-solitaire/`, le fichier `assetlinks.json` doit être à la racine du domaine pour la vérification Android.

### 4. Vérification

Testez votre configuration avec l'outil Google :
https://developers.google.com/digital-asset-links/tools/generator

---

## 📝 Ressources utiles

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Bubblewrap CLI](https://github.com/GoogleChromeLabs/bubblewrap)
- [Digital Asset Links](https://developers.google.com/digital-asset-links)

---

## 📄 Licence

MIT 