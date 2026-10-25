import { writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const environment = process.argv[2];

if (environment !== 'stage' && environment !== 'production') {
  throw new Error('Expected environment to be stage or production.');
}

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const robotsContent = environment === 'stage' ? 'User-agent: *\nDisallow: /\n' : 'User-agent: *\nAllow: /\n';

await writeFile(resolve(projectRoot, 'dist/robots.txt'), robotsContent, 'utf8');
