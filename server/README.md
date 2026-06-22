# Nemesh Server

## Recipe Import Pipeline

Import recipes from DOCX files into Strapi using the three-stage pipeline:

```bash
# Stage 1 — Extract text from DOCX
ENABLE_RECIPE_IMPORT=true npm run import:recipes -- ./local-recipes/recipe.docx --extract

# Stage 2 — Preview the normalized JSON (after Claude Code fills it)
ENABLE_RECIPE_IMPORT=true npm run import:recipes -- ./scripts/import-recipes/output/<timestamp>/recipes.normalized.json --preview

# Stage 3 — Commit to Strapi
ENABLE_RECIPE_IMPORT=true npm run import:recipes -- ./scripts/import-recipes/output/<timestamp>/recipes.normalized.json --commit
```

`--commit` creates each recipe via the Strapi REST API and then calls
`POST /api/recipes/:documentId/process-ingredient-candidates` to create
`ingredientMatchCandidate` records for admin review. Existing candidates
are skipped automatically so it is safe to re-run.

## Ingredient Candidate Backfill

To create missing ingredient match candidates for recipes that already exist in Strapi:

```bash
ENABLE_RECIPE_IMPORT=true \
STRAPI_URL=http://localhost:1337 \
STRAPI_IMPORT_TOKEN=<token> \
npm run backfill:ingredient-candidates
```

See [docs/scripts.md](docs/scripts.md) for full documentation of all scripts.

---

# 🚀 Getting started with Strapi

Strapi comes with a full featured [Command Line Interface](https://docs.strapi.io/dev-docs/cli) (CLI) which lets you scaffold and manage your project in seconds.

### `develop`

Start your Strapi application with autoReload enabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-develop)

```
npm run develop
# or
yarn develop
```

### `start`

Start your Strapi application with autoReload disabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-start)

```
npm run start
# or
yarn start
```

### `build`

Build your admin panel. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-build)

```
npm run build
# or
yarn build
```

## ⚙️ Deployment

Strapi gives you many possible deployment options for your project including [Strapi Cloud](https://cloud.strapi.io). Browse the [deployment section of the documentation](https://docs.strapi.io/dev-docs/deployment) to find the best solution for your use case.

```
yarn strapi deploy
```

## 📚 Learn more

- [Resource center](https://strapi.io/resource-center) - Strapi resource center.
- [Strapi documentation](https://docs.strapi.io) - Official Strapi documentation.
- [Strapi tutorials](https://strapi.io/tutorials) - List of tutorials made by the core team and the community.
- [Strapi blog](https://strapi.io/blog) - Official Strapi blog containing articles made by the Strapi team and the community.
- [Changelog](https://strapi.io/changelog) - Find out about the Strapi product updates, new features and general improvements.

Feel free to check out the [Strapi GitHub repository](https://github.com/strapi/strapi). Your feedback and contributions are welcome!

## ✨ Community

- [Discord](https://discord.strapi.io) - Come chat with the Strapi community including the core team.
- [Forum](https://forum.strapi.io/) - Place to discuss, ask questions and find answers, show your Strapi project and get feedback or just talk with other Community members.
- [Awesome Strapi](https://github.com/strapi/awesome-strapi) - A curated list of awesome things related to Strapi.

---

<sub>🤫 Psst! [Strapi is hiring](https://strapi.io/careers).</sub>
