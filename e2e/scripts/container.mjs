// Thin wrapper over whichever container engine is installed. Works with Docker (`docker compose`) or
// Podman (`podman-compose`) — the only difference the rest of the harness cares about is the compose
// command, which we detect once here. Force a specific one with E2E_COMPOSE="podman compose".
import net from 'node:net';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const E2E_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function exists(cmd) {
  return spawnSync(cmd, ['--version'], { stdio: 'ignore' }).status === 0;
}

let cachedCompose;
// Returns the compose command split into argv pieces, e.g. ['docker','compose'] or ['podman-compose'].
export function detectCompose() {
  if (cachedCompose) return cachedCompose;

  const override = process.env.E2E_COMPOSE?.trim();
  if (override) {
    cachedCompose = override.split(/\s+/);
  } else if (exists('docker')) {
    cachedCompose = ['docker', 'compose'];
  } else if (exists('podman-compose')) {
    cachedCompose = ['podman-compose'];
  } else if (exists('podman')) {
    cachedCompose = ['podman', 'compose'];
  } else {
    throw new Error('No container engine found. Install Docker, or Podman + podman-compose, to run e2e.');
  }
  return cachedCompose;
}

// Runs a compose subcommand (cwd pinned to the e2e dir so the project + relative paths resolve).
export function compose(args, { allowFail = false } = {}) {
  const cmd = detectCompose();
  const result = spawnSync(cmd[0], [...cmd.slice(1), ...args], { cwd: E2E_DIR, stdio: 'inherit' });
  if (result.status !== 0 && !allowFail) {
    throw new Error(`\`${cmd.join(' ')} ${args.join(' ')}\` failed (exit ${result.status ?? 'signal'})`);
  }
  return result.status ?? 1;
}

// True once MySQL answers a query against the seeded schema — i.e. the server is up AND initdb has
// finished. Runs the client inside the container, so it doesn't depend on host port forwarding yet.
export function isDbReady() {
  const cmd = detectCompose();
  const result = spawnSync(
    cmd[0],
    [
      ...cmd.slice(1),
      'exec',
      '-T',
      'mysql-test',
      'mysql',
      '-uroot',
      '-ppassword1',
      '-e',
      'SELECT 1 FROM user_information.account_info LIMIT 1',
    ],
    { cwd: E2E_DIR, stdio: 'ignore' },
  );
  return result.status === 0;
}

// True once the published host port the api will dial actually completes a TCP handshake.
export function isHostPortOpen(port = 3307, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host });
    const done = (ok) => {
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(2000);
    socket.once('connect', () => done(true));
    socket.once('error', () => done(false));
    socket.once('timeout', () => done(false));
  });
}
