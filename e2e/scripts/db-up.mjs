// Brings the throwaway MySQL up from scratch and blocks until it's genuinely ready to serve queries.
// Used both by the Playwright api webServer command and by the `db:up` script.
import { compose, isDbReady, isHostPortOpen } from './container.mjs';
import { prepareSchema } from './prepare-schema.mjs';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function fail(message) {
  console.error(`\n[e2e] ${message}`);
  process.exit(1);
}

prepareSchema();

// Recreate from scratch so the schema always re-initialises cleanly (no leftover data between runs).
compose(['down', '-v'], { allowFail: true });
compose(['up', '-d']);

// Delay to wait for DB to get setup.
const deadline = Date.now() + 150_000;

// 1) The server answers a query against the seeded schema (i.e. initdb has finished).
process.stdout.write('[e2e] waiting for MySQL');
while (!isDbReady()) {
  if (Date.now() > deadline) fail('MySQL did not become ready in time.');
  process.stdout.write('.');
  await sleep(1500);
}

// 2) The published host port the api will dial is actually reachable.
while (!(await isHostPortOpen())) {
  if (Date.now() > deadline) fail('MySQL host port 3307 never opened.');
  process.stdout.write('+');
  await sleep(1000);
}

console.log('\n[e2e] MySQL is ready.');
