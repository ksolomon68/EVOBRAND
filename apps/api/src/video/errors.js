function processingError(error) {
  const stage = error.stage || 'Video processing';
  const stderr = String(error.stderr || '');
  let message;
  if (error.code === 'ENOENT' && error.tool) message = `${error.tool} is not installed or is not on the worker PATH. Configure its executable path on the server.`;
  else if (error.code === 'ENOENT') message = 'The uploaded source or media directory is missing. Check shared storage and upload the video again.';
  else if (error.code === 'EACCES' || /permission denied/i.test(stderr)) message = 'The worker cannot access the executable or media storage. Check server permissions.';
  else if (error.code === 'ENOSPC' || /no space left/i.test(stderr)) message = 'Media storage is full. Free disk space before retrying.';
  else if (error.killed || error.signal === 'SIGTERM') message = 'Processing exceeded the server time limit. Try a smaller source or increase worker resources.';
  else if (error.signal === 'SIGKILL' || /cannot allocate memory|resource temporarily unavailable|pthread_create/i.test(stderr)) message = 'The server stopped processing or could not allocate resources. Check hosting CPU and memory limits.';
  else if (/error while opening encoder|could not open encoder/i.test(stderr)) message = 'The video encoder could not start. Check hosting CPU/memory limits and the FFmpeg encoder configuration before retrying.';
  else if (/unknown encoder|encoder .* not found/i.test(stderr)) message = 'FFmpeg is missing a required encoder. Check processing setup for supported codecs.';
  else if (/unknown decoder|decoder .* not found|decoding requested.*no decoder/i.test(stderr)) message = 'FFmpeg cannot decode this source codec. Install a build with HEVC/H.264 support.';
  else if (/unrecognized option|option .* not found|no such filter/i.test(stderr)) message = 'The server FFmpeg build lacks required options or filters. Update FFmpeg.';
  else if (/invalid data|moov atom not found/i.test(stderr)) message = 'The uploaded file could not be decoded. Upload the original MP4 again.';
  else if (error.validation) message = error.message;
  else message = 'The server could not complete this step. Check processing setup and the video-worker.log entry for this video, then retry.';
  return `${stage}: ${message}`.slice(0, 500);
}
module.exports = { processingError };
