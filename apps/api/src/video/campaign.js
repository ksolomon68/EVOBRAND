// Old campaigns have no video blocks and require no new database queries.
async function unavailableVideo(pool, campaign) {
  let blocks;
  try { blocks = typeof campaign.blocks_json === 'string' ? JSON.parse(campaign.blocks_json) : campaign.blocks_json; } catch { return 'Invalid campaign blocks.'; }
  if (!Array.isArray(blocks)) return null;
  for (const block of blocks.filter(b=>b.type === 'video')) {
    if (!block.videoId) return 'Choose a processed video for every Video block before sending.';
    const [[row]] = await pool.query('SELECT status FROM crm_videos WHERE id=?', [block.videoId]);
    if (row?.status !== 'ready') return 'A campaign video is unavailable or still processing.';
  }
  return null;
}
module.exports = { unavailableVideo };
