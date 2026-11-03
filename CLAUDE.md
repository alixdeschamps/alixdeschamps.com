# Consignes pour Claude Code

- Site statique Astro 7, sans framework CSS : les styles sont dans `src/styles/style.scss` (Sass), importé par `src/layouts/Base.astro`. Contenu en français.
- Police unique : Luciole (fichiers dans `public/fonts`, `@font-face` dans `src/styles/style.scss`). Poids disponibles : 400 et 700, normal et italique.
- Contenus éditables en Markdown dans `src/content/projects/*`. Le schéma des collections est dans `src/content.config.ts`.
- Les miniatures tramées sont générées dans `public/dithers/` (ignoré par git) par `scripts/dither.mjs`, lancé automatiquement avant `npm run dev` et `npm run build`.
- Dépendances volontaires : `astro`, `sass`, `sharp` (tramage), `@astrojs/check` et `typescript` (pour `astro check` dans le build). Pas de Tailwind ni d'ESLint.
- Toujours lancer `npm run build` après une modification pour vérifier que le site compile.
- Déploiement automatique sur GitHub Pages via `.github/workflows/deploy.yml` au push sur `main`.
