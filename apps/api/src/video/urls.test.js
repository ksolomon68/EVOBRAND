const { test } = require('node:test');
const assert = require('node:assert/strict');
const { videoOrigin, videoUrls } = require('./urls');
test('video links use the active site instead of the legacy CRM domain', () => {
  const saved = process.env.VIDEO_PUBLIC_ORIGIN;
  const savedSite = process.env.SITE_URL;
  try {
    delete process.env.VIDEO_PUBLIC_ORIGIN;
    process.env.SITE_URL = 'https://evobrandconcepts.com';
    assert.equal(videoOrigin(), 'https://evobrand.net');
    assert.deepEqual(videoUrls('abc'), {
      landingUrl:'https://evobrand.net/api/videos/watch/abc',
      gifUrl:'https://evobrand.net/api/videos/media/abc/preview.gif',
      posterUrl:'https://evobrand.net/api/videos/media/abc/poster.jpg'
    });
    process.env.VIDEO_PUBLIC_ORIGIN = 'https://video.example.com/';
    assert.equal(videoOrigin(), 'https://video.example.com');
    process.env.VIDEO_PUBLIC_ORIGIN = 'http://localhost:5000';
    assert.equal(videoOrigin(), 'http://localhost:5000');
    for (const invalid of ['https://example.com/api', 'javascript:alert(1)', 'https://user:password@example.com', 'http://example.com']) {
      process.env.VIDEO_PUBLIC_ORIGIN = invalid;
      assert.throws(videoOrigin);
    }
  } finally {
    if (saved === undefined) delete process.env.VIDEO_PUBLIC_ORIGIN; else process.env.VIDEO_PUBLIC_ORIGIN=saved;
    if (savedSite === undefined) delete process.env.SITE_URL; else process.env.SITE_URL=savedSite;
  }
});
