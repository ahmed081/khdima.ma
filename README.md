# Khidma.ma - Plateforme d'Emploi Marocaine

Khidma.ma est une plateforme moderne de mise en relation entre chercheurs d'emploi et employeurs au Maroc. Conçue avec une interface intuitive et des couleurs inspirées de la culture marocaine, elle facilite la recherche d'opportunités professionnelles et le recrutement de talents.

## 🌟 Fonctionnalités

- **Recherche d'emploi** : Barre de recherche centrale pour trouver rapidement des opportunités
- **Publication d'offres** : Interface simple pour les employeurs pour publier des postes
- **Authentification** : Système de connexion et d'inscription pour chercheurs d'emploi et employeurs
- **Affichage des offres** : Vue détaillée des offres d'emploi style réseau social
- **Design responsive** : Interface optimisée pour mobile et desktop
- **Bilingue** : Support pour le français (avec possibilité d'ajouter l'arabe)

## 🚀 Technologies Utilisées

- **Framework** : [Next.js 15](https://nextjs.org/) (App Router)
- **Langage** : [TypeScript](https://www.typescriptlang.org/)
- **Styling** : [Tailwind CSS v4](https://tailwindcss.com/)
- **Composants UI** : [shadcn/ui](https://ui.shadcn.com/)
- **Icônes** : [Lucide React](https://lucide.dev/)
- **Polices** : [Geist](https://vercel.com/font) (Sans & Mono)

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- **Node.js** : Version 18.17 ou supérieure
- **npm**, **yarn**, ou **pnpm** : Gestionnaire de paquets

## 🛠️ Installation

### 1. Cloner le projet

\`\`\`bash
git clone <url-du-repo>
cd khidma-ma
\`\`\`

### 2. Installer les dépendances

Choisissez votre gestionnaire de paquets préféré :

\`\`\`bash
# Avec npm
npm install

# Avec yarn
yarn install

# Avec pnpm
pnpm install
\`\`\`

### 3. Lancer le serveur de développement

\`\`\`bash
# Avec npm
npm run dev

# Avec yarn
yarn dev

# Avec pnpm
pnpm dev
\`\`\`

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur pour voir l'application.

## 📁 Structure du Projet

\`\`\`
khidma-ma/
├── app/                      # Pages et routes Next.js (App Router)
│   ├── jobs/[id]/           # Page de détail d'une offre
│   ├── login/               # Page de connexion
│   ├── register/            # Page d'inscription
│   ├── post-job/            # Page de publication d'offre
│   ├── layout.tsx           # Layout principal
│   ├── page.tsx             # Page d'accueil
│   └── globals.css          # Styles globaux et tokens de design
├── components/              # Composants React réutilisables
│   ├── ui/                  # Composants UI de shadcn
│   ├── header.tsx           # En-tête de navigation
│   ├── hero-section.tsx     # Section héro de la page d'accueil
│   ├── featured-jobs.tsx    # Liste des offres en vedette
│   ├── stats-section.tsx    # Section des statistiques
│   ├── how-it-works.tsx     # Section "Comment ça marche"
│   └── footer.tsx           # Pied de page
├── lib/                     # Utilitaires et helpers
│   └── utils.ts             # Fonctions utilitaires (cn, etc.)
├── hooks/                   # Hooks React personnalisés
├── public/                  # Fichiers statiques (images, etc.)
└── package.json             # Dépendances et scripts
\`\`\`

## 🎨 Système de Design

Le projet utilise un système de tokens de design personnalisé inspiré de la culture marocaine :

- **Couleurs principales** : Beige sable, vert doux, turquoise
- **Typographie** : Geist Sans pour le texte, Geist Mono pour le code
- **Composants** : Basés sur shadcn/ui avec personnalisation

Les tokens de design sont définis dans `app/globals.css` et peuvent être facilement modifiés.

## 📝 Scripts Disponibles

\`\`\`bash
# Développement
npm run dev          # Lancer le serveur de développement

# Production
npm run build        # Créer une version de production
npm run start        # Lancer la version de production

# Linting
npm run lint         # Vérifier le code avec ESLint
\`\`\`

## 🔧 Configuration

### Variables d'environnement

Créez un fichier `.env.local` à la racine du projet pour les variables d'environnement :

\`\`\`env
# Exemple de variables (à adapter selon vos besoins)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
DATABASE_URL=your_database_url
\`\`\`

### Personnalisation des couleurs

Les couleurs du thème peuvent être modifiées dans `app/globals.css` :

\`\`\`css
@theme inline {
  --color-sand: #f5e6d3;
  --color-sage: #8b9d83;
  --color-turquoise: #4a9b9f;
  /* ... autres couleurs */
}
\`\`\`

## 🚀 Déploiement

### Déploiement sur Vercel (Recommandé)

Le moyen le plus simple de déployer votre application Next.js est d'utiliser [Vercel](https://vercel.com) :

1. Poussez votre code sur GitHub
2. Importez votre repo sur Vercel
3. Vercel détectera automatiquement Next.js et configurera le build
4. Votre application sera déployée !

### Autres plateformes

L'application peut également être déployée sur :
- Netlify
- AWS Amplify
- Railway
- Render
- Tout service supportant Node.js

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Contacter l'équipe de développement

## 🎯 Prochaines Étapes

- [ ] Intégration d'une base de données (Supabase/Neon)
- [ ] Système d'authentification complet
- [ ] API pour la gestion des offres d'emploi
- [ ] Système de candidature en ligne
- [ ] Tableau de bord employeur
- [ ] Profils utilisateurs
- [ ] Système de notifications
- [ ] Support multilingue (Arabe)
- [ ] Filtres de recherche avancés
- [ ] Système de messagerie

---

Développé avec ❤️ pour le marché de l'emploi marocain
