import { useState } from 'react';
import { Link } from 'react-router-dom';
import MediaLightbox from './MediaLightbox';
import {
  copyText,
  formatPostDate,
  postSharePath,
  postShareUrl,
  sortMediaPosts
} from '../lib/mediaPosts';
import './MediaFeed.css';

function MediaFeedCard({ post, avatarUrl, authorName = 'Evang. Dr. Ruphina Ojo Adesan' }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [shareNote, setShareNote] = useState('');

  const handleCopyLink = async () => {
    const url = postShareUrl(post.slug);
    try {
      await copyText(url);
      setShareNote('Link copied');
    } catch {
      setShareNote('Could not copy link');
    }
    window.setTimeout(() => setShareNote(''), 2800);
  };

  return (
    <article className="fb-post" id={`media-${post.slug}`}>
      <header className="fb-post__header">
        {avatarUrl ? (
          <img className="fb-post__avatar" src={avatarUrl} alt="" />
        ) : (
          <span className="fb-post__avatar fb-post__avatar--fallback" aria-hidden="true">
            RA
          </span>
        )}
        <div className="fb-post__meta">
          <p className="fb-post__author">{authorName}</p>
          <p className="fb-post__time">
            <time dateTime={post.createdAt}>
              <Link to={postSharePath(post.slug)}>{formatPostDate(post.createdAt)}</Link>
            </time>
            <span aria-hidden="true"> · </span>
            <span>Public</span>
          </p>
        </div>
      </header>

      {post.caption ? <p className="fb-post__caption">{post.caption}</p> : null}

      {post.mediaType === 'video' ? (
        <div className="fb-post__media">
          <video
            className="fb-post__video"
            src={post.mediaUrl}
            controls
            playsInline
            preload="metadata"
            controlsList="nodownload"
          >
            Your browser does not support video playback.
          </video>
        </div>
      ) : (
        <button
          type="button"
          className="fb-post__media fb-post__media--button"
          onClick={() => setLightboxOpen(true)}
          aria-label="Open photo viewer"
        >
          <img
            className="fb-post__image"
            src={post.mediaUrl}
            alt={post.caption || 'Published photo'}
            loading="lazy"
            decoding="async"
          />
        </button>
      )}

      <div className="fb-post__toolbar">
        <button type="button" className="fb-post__tool" onClick={handleCopyLink}>
          Copy link
        </button>
        <Link className="fb-post__tool" to={postSharePath(post.slug)}>
          Open post
        </Link>
        {shareNote ? <span className="fb-post__note">{shareNote}</span> : null}
      </div>

      {post.mediaType === 'image' ? (
        <MediaLightbox
          open={lightboxOpen}
          src={post.mediaUrl}
          alt={post.caption || 'Published photo'}
          onClose={() => setLightboxOpen(false)}
        />
      ) : null}
    </article>
  );
}

function MediaFeed({
  heading,
  posts,
  avatarUrl,
  authorName,
  showHeading = true,
  emptyMessage = 'No media posts yet. New pictures and videos will appear here.'
}) {
  const list = sortMediaPosts(posts);

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
              <MediaFeedCard
                key={post.id}
                post={post}
                avatarUrl={avatarUrl}
                authorName={authorName}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export { MediaFeedCard };
export default MediaFeed;
