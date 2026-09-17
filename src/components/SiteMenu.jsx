import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import './SiteMenu.css';

const MENU_LINKS = [
  { id: 'home', label: 'Home', href: '/', home: true },
  { id: 'media', label: 'Media / Posts', href: '/#media', featured: true },
  { id: 'about', label: 'About', href: '/#about' },
  { id: 'ministry', label: 'Ministry & work', href: '/#ministry' },
  { id: 'publications', label: 'Wisdom Magazine', href: '/#publications' },
  { id: 'book', label: 'Wisdom Book', href: '/#book' },
  { id: 'announcements', label: 'Announcements', href: '/#announcements' },
  { id: 'programs', label: 'Programs & flyers', href: '/#programs' },
  { id: 'daily-words', label: 'Daily Words', href: '/#daily-words' },
  { id: 'sabbath', label: 'Sabbath Fellowship', href: '/#sabbath' },
  { id: 'links', label: 'All Links', href: '/links', externalRoute: true }
];

function scrollToHash(hash) {
  const id = String(hash || '').replace(/^#/, '');
  if (!id) return;
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function useIsPhoneMenu() {
  const [show, setShow] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 900px)').matches : true
  );

  useEffect(() => {
    const media = window.matchMedia('(max-width: 900px)');
    const onChange = () => setShow(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return show;
}

function SiteMenu() {
  const showMenu = useIsPhoneMenu();
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.startsWith('/admin');

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
    const timer = window.setTimeout(() => scrollToHash(location.hash), 120);
    return () => window.clearTimeout(timer);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!showMenu || isAdmin) {
      document.documentElement.classList.remove('has-phone-menu');
      return undefined;
    }
    document.documentElement.classList.add('has-phone-menu');
    return () => document.documentElement.classList.remove('has-phone-menu');
  }, [showMenu, isAdmin]);

  const goHome = () => {
    setOpen(false);
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const goTo = (item) => {
    setOpen(false);

    if (item.home) {
      goHome();
      return;
    }

    if (item.externalRoute) {
      navigate(item.href);
      return;
    }

    const hash = item.href.includes('#') ? `#${item.href.split('#')[1]}` : '';

    if (location.pathname === '/') {
      if (hash) {
        navigate({ pathname: '/', hash });
        window.setTimeout(() => scrollToHash(hash), 50);
      }
      return;
    }

    navigate(item.href);
  };

  if (!showMenu || isAdmin || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div className="site-menu site-menu--visible" data-phone-menu="true">
      <header className="site-menu__header">
        <button type="button" className="site-menu__brand-btn" onClick={goHome}>
          <span className="site-menu__brand-mark" aria-hidden="true">
            RA
          </span>
          <span className="site-menu__brand-text">
            <span className="site-menu__brand-eyebrow">Evang. Dr.</span>
            <span className="site-menu__brand-name">Ruphina Ojo Adesan</span>
          </span>
        </button>

        <button
          type="button"
          className={`site-menu__hamburger${open ? ' site-menu__hamburger--open' : ''}`}
          aria-expanded={open}
          aria-controls={panelId}
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="site-menu__hamburger-lines" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </header>

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
        className={`site-menu__drawer${open ? ' site-menu__drawer--open' : ''}`}
        aria-label="Phone menu"
        aria-hidden={!open}
      >
        <div className="site-menu__drawer-head">
          <p className="site-menu__eyebrow">Menu</p>
          <button
            type="button"
            className="site-menu__drawer-close"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
        </div>
        <p className="site-menu__drawer-title">Where do you want to go?</p>

        <ul className="site-menu__list">
          {MENU_LINKS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={
                  item.featured
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
      </nav>
    </div>,
    document.body
  );
}

export default SiteMenu;
