import { Link, useParams } from 'react-router-dom';
import { MediaFeedCard } from '../components/MediaFeed';
import { useContent } from '../content/ContentProvider';
import { postShareUrl } from '../lib/mediaPosts';
import { useDocumentMeta } from '../lib/useDocumentMeta';
import './MediaPost.css';

function MediaPost() {
  const { slug } = useParams();
  const { content, loading } = useContent();
  const posts = content.mediaPosts || [];
  const post = posts.find((item) => item.slug === slug || item.id === slug);

  const title = post
    ? `${(post.caption || 'Media post').slice(0, 60)} · Ruphina Ojo Adesan`
    : 'Post not found · Ruphina Ojo Adesan';

  const fallbackImage =
    typeof window !== 'undefined'
      ? `${window.location.origin}${process.env.PUBLIC_URL || ''}/logo512.png`
      : undefined;

  useDocumentMeta({
    title,
    description: post?.caption || 'A media post from Evang. Dr. Ruphina Ojo Adesan.',
    url: post ? postShareUrl(post.slug) : undefined,
    image: post?.mediaType === 'image' ? post.mediaUrl : fallbackImage,
    type: 'article'
  });

  if (loading) {
    return (
      <div className="media-post-page">
        <p className="media-post-page__status">Loading…</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="media-post-page">
        <div className="media-post-page__inner">
          <h1 className="media-post-page__title">Post not found</h1>
          <p className="media-post-page__lede">
            This link may be old, or the post was removed.
          </p>
          <p className="media-post-page__nav">
            <Link to="/#media">Back to Media / Posts</Link>
            <Link to="/">Home</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="media-post-page">
      <div className="media-post-page__inner">
        <p className="media-post-page__eyebrow">Media / Posts</p>
        <h1 className="media-post-page__title">Shared post</h1>
        <MediaFeedCard post={post} />
        <p className="media-post-page__nav">
          <Link to="/#media">All posts</Link>
          <Link to="/">Home</Link>
          <Link to="/links">Links</Link>
        </p>
      </div>
    </div>
  );
}

export default MediaPost;
