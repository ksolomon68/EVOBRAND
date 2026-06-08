// services/wordpress.js — WP-CLI integration (local & SSH)
import { exec } from 'child_process';
import { promisify } from 'util';
import { sshExec } from '../utils/ssh.js';
import { isNewerVersion } from '../utils/helpers.js';
import { clientLogger } from '../utils/logger.js';

const execAsync = promisify(exec);

// ─── Run command locally ──────────────────────────────────────────────────────
async function localExec(command, cwd) {
  const { stdout, stderr } = await execAsync(command, { cwd });
  return { stdout: stdout || '', stderr: stderr || '' };
}

// ─── Dispatch to SSH or local ─────────────────────────────────────────────────
async function runCommand(client, command) {
  const log = clientLogger(client.name);
  const { connection, wpcli = 'wp' } = client;

  if (connection.type === 'ssh') {
    log.debug(`[SSH] ${command}`);
    return await sshExec(connection, command, connection.sitePath);
  }

  // Local execution
  log.debug(`[LOCAL] ${command}`);
  return await localExec(command, connection.sitePath);
}

// ─── Get plugin list ──────────────────────────────────────────────────────────
/**
 * Returns an array of plugin objects from WP-CLI JSON output.
 * Filters to only active/inactive plugins (excludes mu-plugins & drop-ins).
 */
export async function getPluginList(client) {
  const log = clientLogger(client.name);
  const wpBin = client.wpcli || 'wp';
  const cmd = `${wpBin} plugin list --format=json --allow-root`;

  log.info('Fetching plugin list...');
  const { stdout, stderr } = await runCommand(client, cmd);

  if (!stdout || stdout.trim() === '') {
    log.warn('No plugin data returned. WP-CLI may not be available or site path is incorrect.');
    if (stderr) log.error(`WP-CLI stderr: ${stderr}`);
    return [];
  }

  try {
    const plugins = JSON.parse(stdout);
    log.info(`Found ${plugins.length} plugins.`);
    return plugins;
  } catch (err) {
    log.error(`Failed to parse plugin list JSON: ${err.message}`);
    log.error(`Raw output: ${stdout.substring(0, 500)}`);
    return [];
  }
}

// ─── Run updates ─────────────────────────────────────────────────────────────
/**
 * Runs wp plugin update --all and returns stdout.
 */
export async function runPluginUpdates(client) {
  const log = clientLogger(client.name);
  const wpBin = client.wpcli || 'wp';
  const cmd = `${wpBin} plugin update --all --format=json --allow-root`;

  log.info('Running plugin updates...');
  const { stdout, stderr } = await runCommand(client, cmd);

  if (stderr && !stdout) {
    log.error(`Plugin update error: ${stderr}`);
    return null;
  }

  return stdout;
}

// ─── Full update cycle ────────────────────────────────────────────────────────
/**
 * Full maintenance cycle for one client:
 *  1. Snapshot plugin versions BEFORE
 *  2. Run wp plugin update --all
 *  3. Snapshot plugin versions AFTER
 *  4. Return diff of changed plugins
 *
 * @param {object} client — Client config from clients.json
 * @returns {Promise<object>} — { updatedPlugins, allPlugins, status }
 */
export async function runMaintenanceCycle(client) {
  const log = clientLogger(client.name);

  // ── Step 1: Before snapshot ───────────────────────────────────────────────
  log.info('Step 1/3 — Capturing plugin versions (before update)...');
  const pluginsBefore = await getPluginList(client);

  if (pluginsBefore.length === 0) {
    return {
      updatedPlugins: [],
      allPlugins: [],
      status: 'error',
      errorMessage: 'Could not retrieve plugin list. Check WP-CLI and site path.',
    };
  }

  // Build version map: { pluginName → version }
  const versionsBefore = Object.fromEntries(
    pluginsBefore.map((p) => [p.name, p.version])
  );

  // ── Step 2: Run updates ───────────────────────────────────────────────────
  log.info('Step 2/3 — Running WordPress plugin updates...');
  const updateOutput = await runPluginUpdates(client);

  if (updateOutput === null) {
    return {
      updatedPlugins: [],
      allPlugins: pluginsBefore,
      status: 'error',
      errorMessage: 'Plugin update command failed.',
    };
  }

  // ── Step 3: After snapshot ────────────────────────────────────────────────
  log.info('Step 3/3 — Capturing plugin versions (after update)...');
  const pluginsAfter = await getPluginList(client);

  const versionsAfter = Object.fromEntries(
    pluginsAfter.map((p) => [p.name, p.version])
  );

  // ── Diff: find plugins that actually changed ──────────────────────────────
  const updatedPlugins = [];

  for (const plugin of pluginsBefore) {
    const oldVersion = versionsBefore[plugin.name];
    const newVersion = versionsAfter[plugin.name];

    if (newVersion && isNewerVersion(oldVersion, newVersion)) {
      updatedPlugins.push({
        name: plugin.name,
        title: plugin.title || plugin.name,
        oldVersion,
        newVersion,
        status: 'Updated',
      });
    }
  }

  log.info(
    updatedPlugins.length > 0
      ? `✓ ${updatedPlugins.length} plugin(s) updated successfully.`
      : '✓ All plugins were already up to date.'
  );

  return {
    updatedPlugins,
    allPlugins: pluginsAfter,
    status: 'success',
  };
}
