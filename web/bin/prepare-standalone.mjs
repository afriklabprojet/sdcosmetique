import { lstat, mkdir, readFile, realpath, symlink, unlink } from 'node:fs/promises';
import path from 'node:path';

const sourceNodeModules = path.resolve('node_modules');
const nodeModules = path.resolve('.next/standalone/node_modules');
const packageJson = JSON.parse(await readFile('package.json', 'utf8'));

for (const dependency of Object.keys(packageJson.dependencies)) {
  const sourcePath = path.join(sourceNodeModules, dependency);
  const sourceTarget = await realpath(sourcePath);
  const relativeTarget = path.relative(sourceNodeModules, sourceTarget);
  const targetPath = path.join(nodeModules, relativeTarget);
  const linkPath = path.join(nodeModules, dependency);

  try {
    await lstat(targetPath);
  } catch (error) {
    if (error.code === 'ENOENT') continue;
    throw error;
  }

  await mkdir(path.dirname(linkPath), { recursive: true });

  try {
    await lstat(linkPath);
    await unlink(linkPath);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  await symlink(path.relative(path.dirname(linkPath), targetPath), linkPath, 'dir');
}

console.log('Prepared standalone production dependency links');