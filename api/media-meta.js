const { createClient } = require('@supabase/supabase-js');

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

module.exports = async function handler(req, res) {
  const slug = String(req.query.slug || '')
    .trim()
    .toLowerCase();
  const siteUrl = process.env.SITE_URL || 'https://ruphinaojoadesan.com';
  const fallbackImage = `${siteUrl}/logo512.png`;

  if (!slug) {
    res.statusCode = 400;
    res.end('Missing slug');
    return;
  }

  const url = `${siteUrl}/media/${encodeURIComponent(slug)}`;
  const ua = String(req.headers['user-agent'] || '');
  const isBot =
    /(bot|crawl|slurp|spider|facebookexternalhit|facebot|twitterbot|linkedinbot|whatsapp|telegram|discordbot|embedly|quora link preview|pinterest|vkshare|slackbot)/i.test(
      ua
    );

  if (!isBot) {
    res.statusCode = 302;
    res.setHeader('Location', url);
    res.end();
    return;
  }

  const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const supabaseKey =
    process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

  let post = null;
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { data } = await supabase
        .from('site_content')
        .select('data')
        .eq('id', 1)
        .maybeSingle();
      const posts = Array.isArray(data?.data?.mediaPosts) ? data.data.mediaPosts : [];
      post = posts.find((item) => item.slug === slug || item.id === slug) || null;
    } catch {
      post = null;
    }
  }

  const title = escapeHtml(
    post?.caption
      ? `${String(post.caption).slice(0, 70)} · Ruphina Ojo Adesan`
      : 'Media post · Ruphina Ojo Adesan'
  );
  const description = escapeHtml(
    post?.caption || 'A media post from Evang. Dr. Ruphina Ojo Adesan.'
  );
  const image =
    post?.mediaType === 'image' && post?.mediaUrl ? post.mediaUrl : fallbackImage;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=120');
  res.statusCode = 200;
  res.end(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:type" content="article" />
  <meta property="og:site_name" content="Evang. Dr. Ruphina Ojo Adesan" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${escapeHtml(url)}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${escapeHtml(image)}" />
  <link rel="canonical" href="${escapeHtml(url)}" />
  <meta http-equiv="refresh" content="0;url=${escapeHtml(url)}" />
</head>
<body>
  <p>${description}</p>
  <p><a href="${escapeHtml(url)}">View post</a></p>
</body>
</html>`);
};
