#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const say = (message) => console.log(`\n▶ ${message}`);
const fail = (message) => {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
};

function run(command, cwd = root) {
  const result = spawnSync(command, { cwd, stdio: 'inherit', shell: true });
  if (result.error) console.error(result.error.message);
  return result.status === 0;
}

async function checkMongoAddress(uri) {
  const match = uri.match(/^mongodb:\/\/(?:[^@/]+@)?([^:/,]+)(?::(\d+))?/);
  if (!match) return null;
  const [, host, rawPort] = match;
  const port = Number(rawPort || 27017);
  const reachable = await new Promise((resolve) => {
    const socket = net.createConnection({ host, port, timeout: 3000 });
    socket.once('connect', () => {
      socket.end();
      resolve(true);
    });
    socket.once('error', () => resolve(false));
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
  });
  return { host, port, reachable };
}

const major = Number(process.versions.node.split('.')[0]);
if (major < 18) {
  fail(`Node.js 18+ is required (found ${process.versions.node}). Install Node 20 LTS from https://nodejs.org`);
}
say(`Node.js ${process.versions.node} OK`);

if (!process.argv.includes('--skip-install')) {
  for (const directory of ['.', 'server', 'client']) {
    say(`Installing packages in ${directory === '.' ? 'project root' : `${directory}/`}`);
    if (!run('npm install --no-audit --no-fund', path.join(root, directory))) {
      fail(`npm install failed in ${directory}/`);
    }
  }
}

const envPath = path.join(root, 'server', '.env');
if (!fs.existsSync(envPath)) {
  const examplePath = path.join(root, 'server', '.env.example');
  if (!fs.existsSync(examplePath)) fail('server/.env.example is missing');
  const example = fs.readFileSync(examplePath, 'utf8');
  const secret = crypto.randomBytes(32).toString('hex');
  const configured = /^JWT_SECRET=.*$/m.test(example)
    ? example.replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${secret}`)
    : `${example.trimEnd()}\nJWT_SECRET=${secret}\n`;
  fs.writeFileSync(envPath, configured, { flag: 'wx' });
  say('Created server/.env with a random JWT secret (edit MONGO_URI if using Atlas)');
} else {
  say('server/.env already exists — keeping it');
}

const settings = Object.fromEntries(
  fs.readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.includes('=') && !line.trim().startsWith('#'))
    .map((line) => {
      const separator = line.indexOf('=');
      return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
    })
);
const mongoUri = settings.MONGO_URI || 'mongodb://127.0.0.1:27017/isl_translator';
if (mongoUri.startsWith('mongodb+srv://')) {
  say('MongoDB Atlas configured; the seed step will verify the connection');
} else {
  const address = await checkMongoAddress(mongoUri);
  if (address && !address.reachable) {
    fail(`MongoDB is not reachable at ${address.host}:${address.port}.
Choose one option, then run "npm run setup -- --skip-install" again:
  a) Install MongoDB Community Server and start the MongoDB service
  b) Docker: docker run -d --name isl-mongo -p 27017:27017 -v isl-mongo-data:/data/db mongo:7
  c) MongoDB Atlas: put its mongodb+srv:// connection string in server/.env`);
  }
  if (address) say(`MongoDB reachable at ${address.host}:${address.port}`);
}

say('Seeding the admin account, ISL dictionary, and shared models');
if (!run('npm run seed', path.join(root, 'server'))) {
  fail('Seeding failed — check the MongoDB connection and server/.env');
}

console.log(`\n✔ Setup complete.
  Start the app: npm run dev
  Open:          http://localhost:5173
  Admin email:   ${settings.ADMIN_EMAIL || 'admin@isl.local'}
  Admin password is configured in server/.env`);
