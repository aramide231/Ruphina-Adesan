import { useEffect, useId, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './SiteMenu.css';

const MENU_LINKS = [
  { id: 'about', label: 'About', href: '/#about' },
  { id: 'media', label: 'Media / Posts', href: '/#media' },
  { id: 'announcements', label: 'Announcements', href: '/#announcements' },
  { id: 'programs', label: 'Programs', href: '/#programs' },
  { id: 'daily-words', label: 'Daily Words', href: '/#daily-words' },
  { id: 'publications', label: 'Wisdom Magazine', href: '/#publications' },
  { id: 'book', label: 'Wisdom Book', href: '/#book' },
  { id: 'sabbath', label: 'Sabbath Fellowship', href: '/#sabbath' },
  { id: 'links', label: 'Links', href: '/links', externalRoute: true },
  { id: 'ministry', label: 'Ministry & work', href: '/#ministry' }
];

function scrollToHash(hash) {
  const id = String(hash || '').replace(/^#/, '');
  if (!id) return;
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function SiteMenu() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    if (location.pathname !== '/') return;
    if (!location.hash) return;
    const timer = window.setTimeout(() => scrollToHash(location.hash), 80);
    return () => window.clearTimeout(timer);
  }, [location.pathname, location.hash]);

  const goTo = (item) => {
    setOpen(false);

    if (item.externalRoute) {
      navigate(item.href);
      return;
    }

    const hash = item.href.includes('#') ? `#${item.href.split('#')[1]}` : '';

    if (location.pathname === '/') {
      if (hash) {
        navigate({ pathname: '/', hash });
        window.setTimeout(() => scrollToHash(hash), 40);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    navigate(item.href);
  };

  return (
    <div className="site-menu">
      <button
        type="button"
        className={`site-menu__toggle${open ? ' site-menu__toggle--open' : ''}`}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="site-menu__bars" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>

      {open ? (
        <button
          type="button"
          className="site-menu__scrim"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <nav
        id={panelId}
        className={`site-menu__panel${open ? ' site-menu__panel--open' : ''}`}
        aria-label="Site sections"
        aria-hidden={!open}
      >
        <p className="site-menu__eyebrow">Menu</p>
        <p className="site-menu__brand">Ruphina Ojo Adesan</p>
        <ul className="site-menu__list">
          {MENU_LINKS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={
                  item.id === 'media'
                    ? 'site-menu__link site-menu__link--featured'
                    : 'site-menu__link'
                }
                onClick={() => goTo(item)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="site-menu__home"
          onClick={() => {
            setOpen(false);
            if (location.pathname === '/') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              navigate('/');
            }
          }}
        >
          Back to top
        </button>
      </nav>
    </div>
  );
}

export default SiteMenu;
