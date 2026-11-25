require('dotenv').config();
const { execFileSync } = require('node:child_process');
try {
  for (const binary of [process.env.FFMPEG_PATH || 'ffmpeg', process.env.FFPROBE_PATH || 'ffprobe']) {
    execFileSync(binary, ['-version'], { timeout: 10000, stdio: 'pipe' });
  }
  const encoders = execFileSync(process.env.FFMPEG_PATH || 'ffmpeg', ['-hide_banner', '-encoders'], { timeout: 10000, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  for (const encoder of ['libx264', 'aac', 'gif', 'mjpeg']) {
    if (!new RegExp(`\\b${encoder}\\b`).test(encoders)) throw new Error(`Missing FFmpeg encoder: ${encoder}`);
  }
  console.log('FFmpeg and FFprobe are available with the required encoders.');
} catch (error) {
  console.error('Video worker setup failed: install FFmpeg/FFprobe on the host, or set FFMPEG_PATH and FFPROBE_PATH in apps/api/.env. ' + error.message);
  process.exitCode = 1;
}
