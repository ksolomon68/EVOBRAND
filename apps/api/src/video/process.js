const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const fs = require('node:fs/promises');
const path = require('node:path');
const run = promisify(execFile);
const root = path.resolve(process.env.VIDEO_STORAGE_DIR || path.join(__dirname, '../../private-videos'));
async function ffmpeg(stage, args) {
  try { return await run(process.env.FFMPEG_PATH || 'ffmpeg', ['-nostdin', '-hide_banner', '-loglevel', 'error', '-y', '-threads', '2', '-filter_threads', '1', '-filter_complex_threads', '1', ...args.slice(0, -1), '-threads', '2', args.at(-1)], { timeout: 600000, maxBuffer: 1024 * 1024 });
  } catch (error) { error.stage = stage; error.tool = 'FFmpeg'; throw error; }
}
function invalid(message) { const error = new Error(message); error.validation = true; error.stage = 'Source validation'; return error; }
async function processVideo(id, start, length) {
  const dir = path.join(root, id), source = path.join(dir, 'source.mp4');
  let stdout;
  try { ({ stdout } = await run(process.env.FFPROBE_PATH || 'ffprobe', ['-v', 'error', '-show_format', '-show_streams', '-of', 'json', source], { timeout: 30000, maxBuffer: 1024 * 1024 })); } catch (error) { error.stage = 'Source inspection'; error.tool = 'FFprobe'; throw error; }
  const info = JSON.parse(stdout), video = info.streams.find(s => s.codec_type === 'video');
  const duration = Number(info.format.duration);
  if (!video || !info.format.format_name.includes('mp4') || !Number.isFinite(duration) || duration <= 0 || duration > 1800 || video.width * video.height > 3840 * 2160) throw invalid('Use an MP4 up to 30 minutes and 4K resolution.');
  if (start >= duration) throw invalid('GIF start must be before the end of the video.');
  const clip = Math.min(length, duration - start);
  // Raster overlay: burned into every GIF frame, including Outlook's static first frame.
  const size = 80, pixels = Buffer.alloc(size * size * 3);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const triangle = x >= 29 && x <= 57 && Math.abs(y - 40) <= (57 - x) * .65;
    const color = triangle ? [255,255,255] : [0,50,88];
    pixels.set(color, (y * size + x) * 3);
  }
  const overlay = path.join(dir, 'play.ppm');
  await fs.writeFile(overlay, Buffer.concat([Buffer.from('P6\n80 80\n255\n'), pixels]));
  await ffmpeg('MP4 conversion', ['-i', source, '-map', '0:v:0', '-map', '0:a:0?', '-vf', "scale=w='trunc(iw*min(1,min(1280/iw,1280/ih))/2)*2':h='trunc(ih*min(1,min(1280/iw,1280/ih))/2)*2'", '-c:v', 'libx264', '-x264-params', 'threads=2:lookahead_threads=1', '-preset', 'fast', '-crf', '25', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', path.join(dir, 'video.mp4')]);
  await ffmpeg('JPEG thumbnail', ['-ss', String(start), '-i', source, '-i', overlay, '-filter_complex', '[0:v]scale=640:-2[v];[v][1:v]overlay=(W-w)/2:(H-h)/2', '-frames:v', '1', '-q:v', '3', path.join(dir, 'poster.jpg')]);
  let bytes;
  for (const [width, fps, colors] of [[480,10,96],[400,8,64],[320,6,48],[240,5,32]]) {
    await ffmpeg('GIF preview', ['-ss', String(start), '-t', String(clip), '-i', source, '-i', overlay, '-filter_complex', `[0:v]fps=${fps},scale=${width}:-2[v];[v][1:v]overlay=(W-w)/2:(H-h)/2,split[a][b];[a]palettegen=max_colors=${colors}[p];[b][p]paletteuse=dither=bayer`, '-loop', '0', path.join(dir, 'preview.gif')]);
    bytes = (await fs.stat(path.join(dir, 'preview.gif'))).size;
    if (bytes < 1000000) break;
  }
  await fs.unlink(overlay);
  return { duration, bytes };
}
module.exports = { root, processVideo };
