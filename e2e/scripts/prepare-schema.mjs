// Generates a sanitised copy of the api's schema dump for the container MySQL to auto-load on first
// boot (it gets mounted into /docker-entrypoint-initdb.d). We strip the mysqldump replication/binlog
// lines (GTID_PURGED, SQL_LOG_BIN): they assume a replication setup the throwaway container doesn't
// have and would otherwise abort initialisation. Generating from the canonical dump keeps the schema
// from drifting away from `api/spendWatcherV1.sql`.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const source = path.resolve(directory, '../../api/spendWatcherV1.sql');
const outputDir = path.resolve(directory, '../.tmp');
const outputFile = path.join(outputDir, 'schema.sql');

export function prepareSchema() {
  const raw = fs.readFileSync(source, 'utf8');
  const sanitised = raw
    .split('\n')
    .filter((line) => !/GTID_PURGED|SQL_LOG_BIN/i.test(line))
    .join('\n');

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(outputFile, sanitised);
  console.log(`[e2e] wrote sanitised schema -> ${path.relative(process.cwd(), outputFile)}`);
  return outputFile;
}

// Allow running directly: `node scripts/prepare-schema.mjs`
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  prepareSchema();
}
