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
  // Listing libx264 is insufficient on restricted hosts: verify it can start.
  execFileSync(process.env.FFMPEG_PATH || 'ffmpeg', [
    '-nostdin', '-hide_banner', '-loglevel', 'error', '-filter_threads', '1',
    '-f', 'lavfi', '-i', 'color=c=black:s=720x1280:r=24', '-t', '0.25',
    '-c:v', 'libx264', '-x264-params', 'threads=2:lookahead_threads=1',
    '-threads', '2', '-pix_fmt', 'yuv420p', '-f', 'null', '-'
  ], { timeout: 30000, stdio: 'pipe' });
  console.log('FFmpeg/FFprobe verified; H.264 encoder smoke test passed.');
} catch (error) {
  console.error('Video worker setup failed: install FFmpeg/FFprobe on the host, or set FFMPEG_PATH and FFPROBE_PATH in apps/api/.env. ' + error.message);
  process.exitCode = 1;
}
