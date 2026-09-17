export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export function createMediaSlug(caption, id) {
  const base = slugify(caption) || 'media-post';
  const shortId = String(id || Date.now()).slice(-6);
  return `${base}-${shortId}`;
}

export function formatPostDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  } catch {
    return '';
  }
}

const VIDEO_EXTENSIONS = new Set([
  'mp4',
  'webm',
  'mov',
  'm4v',
  'avi',
  'mkv',
  'ogv'
]);

export function getMediaType(fileOrMime) {
  if (!fileOrMime) return 'image';

  if (typeof fileOrMime === 'string') {
    if (fileOrMime.startsWith('video/')) return 'video';
    if (fileOrMime.startsWith('image/')) return 'image';
    const ext = fileOrMime.includes('.')
      ? fileOrMime.split('.').pop().toLowerCase()
      : '';
    return VIDEO_EXTENSIONS.has(ext) ? 'video' : 'image';
  }

  const mime = fileOrMime.type || '';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('image/')) return 'image';

  const name = fileOrMime.name || '';
  const ext = name.includes('.') ? name.split('.').pop().toLowerCase() : '';
  return VIDEO_EXTENSIONS.has(ext) ? 'video' : 'image';
}

export function sortMediaPosts(posts) {
  return [...(Array.isArray(posts) ? posts : [])].sort((a, b) => {
    const aTime = new Date(a.createdAt || 0).getTime();
    const bTime = new Date(b.createdAt || 0).getTime();
    return bTime - aTime;
  });
}

export function postSharePath(slug) {
  return `/media/${encodeURIComponent(slug)}`;
}

export function postShareUrl(slug) {
  if (typeof window === 'undefined') return postSharePath(slug);
  return `${window.location.origin}${postSharePath(slug)}`;
}

export async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'absolute';
  area.style.left = '-9999px';
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(area);
  return ok;
}

export const MAX_IMAGE_BYTES = 12 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 80 * 1024 * 1024;

export function validateMediaFile(file) {
  if (!file) return { ok: false, error: 'Choose a picture or video to publish.' };

  const type = getMediaType(file);
  const max = type === 'video' ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES;
  if (file.size > max) {
    const limitMb = Math.round(max / (1024 * 1024));
    return {
      ok: false,
      error: `That ${type} is too large. Please keep ${type}s under ${limitMb}MB.`
    };
  }

  return { ok: true, type };
}
