import { useEffect } from 'react';
import './MediaLightbox.css';

function MediaLightbox({ open, src, alt, onClose }) {
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open || !src) return null;

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer">
      <button className="lightbox__backdrop" type="button" aria-label="Close photo" onClick={onClose} />
      <div className="lightbox__panel">
        <button className="lightbox__close" type="button" onClick={onClose}>
          Close
        </button>
        <img className="lightbox__image" src={src} alt={alt || 'Published photo'} />
      </div>
    </div>
  );
}

export default MediaLightbox;
