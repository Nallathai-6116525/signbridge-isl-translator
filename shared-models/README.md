# Shared recognition models

On the computer that trained a model, run `npm run export-models`. Share the project folder including `shared-models/` (but not `node_modules`, build output, or `server/uploads/`).

On the other computer, run `npm run setup` to install dependencies and import shared models during seeding. For an already-configured project, run `npm run import-models`.

Each version folder contains its TensorFlow.js `model.json`, weight shard files, and `meta.json`.
