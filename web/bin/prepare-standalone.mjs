import { lstat, mkdir, readdir, symlink, unlink } from 'node:fs/promises';
import path from 'node:path';

const nodeModules = path.resolve('.next/standalone/node_modules');
const pnpmStore = path.join(nodeModules, '.pnpm');
const helperPackage = (await readdir(pnpmStore)).find((entry) =>
  entry.startsWith('@swc+helpers@'),
);

if (!helperPackage) {
  throw new Error('@swc/helpers is missing from the standalone pnpm store');
}

const scopeDirectory = path.join(nodeModules, '@swc');
const linkPath = path.join(scopeDirectory, 'helpers');
const targetPath = path.join(
  pnpmStore,
  helperPackage,
  'node_modules',
  '@swc',
  'helpers',
);

await mkdir(scopeDirectory, { recursive: true });

try {
  await lstat(linkPath);
  await unlink(linkPath);
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

await symlink(path.relative(scopeDirectory, targetPath), linkPath, 'dir');
console.log('Prepared standalone @swc/helpers dependency link');