function realtimeConfigured() {
  return Boolean(process.env.NEON_REALTIME_SECRET && process.env.NEON_REALTIME_URL);
}

async function sealPublishedPosts() {
  if (!realtimeConfigured()) {
    const error = new Error('Realtime is not configured');
    error.status = 503;
    throw error;
  }

  const { createRealtime, rawSql } = await import('@neon/realtime/server');
  let dbName = 'work_portfolio';
  try {
    dbName = decodeURIComponent(new URL(process.env.DATABASE_URL).pathname.replace(/^\//, '')) || dbName;
  } catch {
    // Keep the branch database name when DATABASE_URL is not a URL.
  }

  const realtime = createRealtime({
    secret: process.env.NEON_REALTIME_SECRET,
    db: dbName
  });

  const sealed = await realtime.seal({
    query: rawSql(
      'SELECT id, title, excerpt, status, featured FROM blog_posts WHERE status = $1 ORDER BY publish_date DESC LIMIT 20',
      ['published']
    )
  });

  return {
    sealed,
    url: process.env.NEON_REALTIME_URL
  };
}

module.exports = {
  realtimeConfigured,
  sealPublishedPosts
};
