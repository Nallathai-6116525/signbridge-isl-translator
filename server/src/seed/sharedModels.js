import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../config/env.js';
import { ModelVersion } from '../models/index.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));
export const SHARED_DIR = path.resolve(dirname, '../../../shared-models');
const UPLOAD_MODELS = path.join(env.uploadDir, 'models');
const VERSION_RX = /^v\d+\.\d+\.\d+$/;

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}
const versionParts = (version) => version.slice(1).split('.').map(Number);
const compareVersions = (a, b) => {
  const [x, y] = [versionParts(a), versionParts(b)];
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
};
const safeName = (name) => path.basename(name).replace(/[^a-zA-Z0-9._-]/g, '_');

function validateModelJson(modelJson) {
  if (!modelJson?.modelTopology || !Array.isArray(modelJson.weightsManifest)) return null;
  const paths = [];
  for (const group of modelJson.weightsManifest) {
    if (!group || typeof group !== 'object' || !Array.isArray(group.paths) ||
        group.paths.some((name) => typeof name !== 'string')) return null;
    const safePaths = group.paths.map(safeName);
    if (safePaths.some((name) => !name || name === '.' || name === '..' || !name.endsWith('.bin'))) return null;
    group.paths = safePaths;
    paths.push(...safePaths);
  }
  return [...new Set(paths)];
}

async function copyModelFiles(fromDir, toDir) {
  await fs.mkdir(toDir, { recursive: true });
  const entries = await fs.readdir(fromDir, { withFileTypes: true });
  const files = entries.filter((entry) =>
    entry.isFile() && (entry.name === 'model.json' || entry.name.endsWith('.bin'))
  );
  for (const entry of files) {
    await fs.copyFile(path.join(fromDir, entry.name), path.join(toDir, entry.name));
  }
  return files.map((entry) => entry.name);
}

/** Import shared models into MongoDB and the server upload directory. */
export async function importSharedModels({ log = console.log, createdBy } = {}) {
  if (!(await exists(SHARED_DIR))) {
    log('[models] No shared-models/ folder — nothing to import');
    return { imported: 0 };
  }

  const entries = (await fs.readdir(SHARED_DIR, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && VERSION_RX.test(entry.name))
    .sort((a, b) => compareVersions(a.name, b.name));
  if (!entries.length) {
    log('[models] No version folders in shared-models/ — nothing to import');
    return { imported: 0 };
  }

  let imported = 0;
  let preferredActive;

  for (const { name: version } of entries) {
    const dir = path.join(SHARED_DIR, version);
    let metaContent;
    let modelContent;
    try {
      [metaContent, modelContent] = await Promise.all([
        fs.readFile(path.join(dir, 'meta.json'), 'utf8'),
        fs.readFile(path.join(dir, 'model.json'), 'utf8'),
      ]);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      log(`[models] ${version}: skipped (model.json and meta.json are required)`);
      continue;
    }

    let meta;
    let modelJson;
    try {
      meta = JSON.parse(metaContent);
      modelJson = JSON.parse(modelContent);
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error;
      log(`[models] ${version}: skipped (meta.json or model.json is not valid JSON)`);
      continue;
    }

    const classLabels = meta?.classLabels;
    if (!Array.isArray(classLabels) || classLabels.length < 2 ||
        classLabels.some((label) => typeof label !== 'string' || !label.trim())) {
      log(`[models] ${version}: skipped (meta.json needs at least two valid classLabels)`);
      continue;
    }

    const shardPaths = validateModelJson(modelJson);
    if (!shardPaths) {
      log(`[models] ${version}: skipped (model.json is not a valid TensorFlow.js layers model)`);
      continue;
    }

    const missing = [];
    for (const shard of shardPaths) {
      if (!(await exists(path.join(dir, shard)))) missing.push(shard);
    }
    if (missing.length) {
      log(`[models] ${version}: skipped (missing weight files: ${missing.join(', ')})`);
      continue;
    }

    if (meta.isActive === true) preferredActive = version;
    if (await ModelVersion.exists({ version })) {
      log(`[models] ${version}: already in database`);
      continue;
    }

    const destination = path.join(UPLOAD_MODELS, version);
    await fs.mkdir(destination, { recursive: true });
    for (const shard of shardPaths) {
      await fs.copyFile(path.join(dir, shard), path.join(destination, shard));
    }
    await fs.writeFile(path.join(destination, 'model.json'), JSON.stringify(modelJson));

    const accuracy = Number(meta.valAccuracy ?? 0);
    const trainedSamples = Number(meta.trainedSamples ?? 0);
    const releasedAt = meta.releasedAt ? new Date(meta.releasedAt) : new Date();
    await ModelVersion.create({
      version,
      modelUrl: `/uploads/models/${version}/model.json`,
      classLabels,
      numClasses: classLabels.length,
      valAccuracy: Number.isFinite(accuracy) && accuracy >= 0 && accuracy <= 1 ? accuracy : 0,
      trainedSamples: Number.isFinite(trainedSamples) && trainedSamples >= 0 ? trainedSamples : 0,
      source: meta.source === 'python' ? 'python' : 'browser',
      notes: typeof meta.notes === 'string' ? meta.notes.slice(0, 500) : 'Imported from shared-models/',
      isActive: false,
      releasedAt: Number.isNaN(releasedAt.getTime()) ? new Date() : releasedAt,
      createdBy,
    });
    imported += 1;
    log(`[models] ${version}: imported (${classLabels.length} signs: ${classLabels.join(', ')})`);
  }

  if (!(await ModelVersion.exists({ isActive: true }))) {
    const models = await ModelVersion.find().select('version').lean();
    const preferred = models.find((model) => model.version === preferredActive);
    const target = preferred || models.sort((a, b) => compareVersions(b.version, a.version))[0];
    if (target) {
      await ModelVersion.updateOne({ _id: target._id }, { isActive: true });
      log(`[models] ${target.version} set as the active model`);
    }
  }

  return { imported };
}

/** Export MongoDB models and their weight files into shared-models/. */
export async function exportSharedModels({ log = console.log } = {}) {
  const models = await ModelVersion.find().sort({ releasedAt: 1 }).lean();
  if (!models.length) {
    log('[models] No models in the database. Train and publish one in Admin → Model Studio first.');
    return { exported: 0 };
  }

  let exported = 0;
  for (const model of models) {
    if (!VERSION_RX.test(model.version)) {
      log(`[models] Invalid version "${model.version}" in database — skipped`);
      continue;
    }
    const fromDir = path.join(UPLOAD_MODELS, model.version);
    if (!(await exists(path.join(fromDir, 'model.json')))) {
      log(`[models] ${model.version}: model files not found in ${fromDir} — skipped`);
      continue;
    }
    const toDir = path.join(SHARED_DIR, model.version);
    const files = await copyModelFiles(fromDir, toDir);
    const meta = {
      version: model.version,
      classLabels: model.classLabels,
      valAccuracy: model.valAccuracy,
      trainedSamples: model.trainedSamples,
      source: model.source,
      notes: model.notes,
      isActive: model.isActive,
      releasedAt: model.releasedAt,
    };
    await fs.writeFile(path.join(toDir, 'meta.json'), JSON.stringify(meta, null, 2));
    exported += 1;
    log(`[models] ${model.version}${model.isActive ? ' (active)' : ''} → shared-models/${model.version}/ [${files.join(', ')}, meta.json]`);
  }
  log(`[models] Exported ${exported} model(s). Share the project folder including shared-models/, then run "npm run seed" on the other computer.`);
  return { exported };
}
