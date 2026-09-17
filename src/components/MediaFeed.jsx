import { useState } from 'react';
import { Link } from 'react-router-dom';
import MediaLightbox from './MediaLightbox';
import { copyText, formatPostDate, postSharePath, postShareUrl } from '../lib/mediaPosts';
import './MediaFeed.css';

function MediaFeedCard({ post, compact = false }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [shareNote, setShareNote] = useState('');

  const handleShare = async () => {
    const url = postShareUrl(post.slug);
    try {
      if (navigator.share) {
        await navigator.share({
          title: post.caption?.slice(0, 80) || 'Media post',
          text: post.caption || 'See this post',
          url
        });
        setShareNote('Shared.');
      } else {
        await copyText(url);
        setShareNote('Link copied.');
      }
    } catch {
      try {
        await copyText(url);
        setShareNote('Link copied.');
      } catch {
        setShareNote('Could not copy link.');
      }
    }
    window.setTimeout(() => setShareNote(''), 2200);
  };

  return (
    <article className={`media-card ${compact ? 'media-card--compact' : ''}`} id={`media-${post.slug}`}>
      <header className="media-card__head">
        <div>
          <p className="media-card__author">Evang. Dr. Ruphina Ojo Adesan</p>
          <p className="media-card__date">{formatPostDate(post.createdAt)}</p>
        </div>
        <Link className="media-card__permalink" to={postSharePath(post.slug)}>
          Open post
        </Link>
      </header>

      {post.caption ? <p className="media-card__caption">{post.caption}</p> : null}

      {post.mediaType === 'video' ? (
        <div className="media-card__media">
          <video
            className="media-card__video"
            src={post.mediaUrl}
            controls
            playsInline
            preload="metadata"
          >
            Your browser does not support video playback.
          </video>
        </div>
      ) : (
        <button
          type="button"
          className="media-card__media media-card__media--button"
          onClick={() => setLightboxOpen(true)}
          aria-label="Open photo viewer"
        >
          <img
            className="media-card__image"
            src={post.mediaUrl}
            alt={post.caption || 'Published photo'}
            loading="lazy"
            decoding="async"
          />
        </button>
      )}

      <footer className="media-card__actions">
        <button type="button" className="media-card__action" onClick={handleShare}>
          Share link
        </button>
        <Link className="media-card__action media-card__action--ghost" to={postSharePath(post.slug)}>
          View post
        </Link>
        {shareNote ? <span className="media-card__share-note">{shareNote}</span> : null}
      </footer>

      <MediaLightbox
        open={lightboxOpen}
        src={post.mediaUrl}
        alt={post.caption || 'Published photo'}
        onClose={() => setLightboxOpen(false)}
      />
    </article>
  );
}

function MediaFeed({
  heading,
  posts,
  showHeading = true,
  emptyMessage = 'No media posts yet.'
}) {
  const list = Array.isArray(posts) ? posts : [];

  return (
    <section className="media-feed" id="media">
      <div className="media-feed__inner">
        {showHeading ? (
          <>
            <h2 className="media-feed__title">{heading?.title || 'Media / Posts'}</h2>
            {heading?.lede ? <p className="media-feed__lede">{heading.lede}</p> : null}
          </>
        ) : null}

        {list.length === 0 ? (
          <p className="media-feed__empty">{emptyMessage}</p>
        ) : (
          <div className="media-feed__list">
            {list.map((post) => (
              <MediaFeedCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export { MediaFeedCard };
export default MediaFeed;
