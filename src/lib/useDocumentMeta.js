import { useEffect } from 'react';

function setMeta(attr, key, value) {
  if (!value) return;
  let element = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', value);
}

export function useDocumentMeta({ title, description, url, image, type = 'article' }) {
  useEffect(() => {
    const previousTitle = document.title;
    if (title) document.title = title;

    if (description) {
      setMeta('name', 'description', description);
      setMeta('property', 'og:description', description);
      setMeta('name', 'twitter:description', description);
    }

    if (title) {
      setMeta('property', 'og:title', title);
      setMeta('name', 'twitter:title', title);
    }

    if (url) {
      setMeta('property', 'og:url', url);
    }

    if (image) {
      setMeta('property', 'og:image', image);
      setMeta('property', 'og:image:secure_url', image);
      setMeta('name', 'twitter:image', image);
    }

    setMeta('property', 'og:type', type);
    setMeta('name', 'twitter:card', 'summary_large_image');

    return () => {
      document.title = previousTitle;
    };
  }, [title, description, url, image, type]);
}
