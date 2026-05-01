// utils/ssh.js — SSH connection manager using node-ssh
import { NodeSSH } from 'node-ssh';
import path from 'path';
import os from 'os';

/**
 * Execute a shell command on a remote host via SSH.
 *
 * @param {object} connection — SSH connection config from clients.json
 * @param {string} command    — Shell command to execute
 * @param {string} cwd        — Working directory for the command
 * @returns {Promise<{stdout: string, stderr: string, code: number}>}
 */
export async function sshExec(connection, command, cwd) {
  const ssh = new NodeSSH();

  // Resolve ~ in private key path
  const keyPath = (connection.privateKeyPath || '').replace(
    /^~/,
    os.homedir()
  );

  await ssh.connect({
    host: connection.host,
    port: connection.port || 22,
    username: connection.username,
    privateKeyPath: keyPath || undefined,
    password: connection.password || undefined,
    readyTimeout: 30000,
  });

  try {
    const result = await ssh.execCommand(command, {
      cwd: cwd || connection.sitePath,
    });
    return {
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      code: result.code ?? 0,
    };
  } finally {
    ssh.dispose();
  }
}

/**
 * Test SSH connectivity and return true/false.
 */
export async function testSSHConnection(connection) {
  try {
    const result = await sshExec(connection, 'echo ok', '/tmp');
    return result.stdout.trim() === 'ok';
  } catch {
    return false;
  }
}
