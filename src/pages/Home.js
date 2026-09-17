import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Ballpit from '../components/Ballpit';
import MediaFeed from '../components/MediaFeed';
import { useContent } from '../content/ContentProvider';
import '../App.css';

function useIsPhone() {
  const [isPhone, setIsPhone] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 640px)').matches : false
  );

  useEffect(() => {
    const media = window.matchMedia('(max-width: 640px)');
    const onChange = () => setIsPhone(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return isPhone;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

function Home() {
  const { content } = useContent();
  const isPhone = useIsPhone();
  const reducedMotion = usePrefersReducedMotion();
  const showBallpit = !reducedMotion;
  const {
    hero,
    about,
    ministry,
    publications,
    book,
    sabbath,
    socials,
    images,
    imageAlts,
    mediaHeading,
    mediaPosts,
    announcementsHeading,
    announcements,
    programsHeading,
    programs,
    dailyWordsHeading,
    dailyWords
  } = content;

  return (
    <div className="site">
      <section className="hero" aria-label="Welcome">
        <div className="hero__ballpit" aria-hidden="true">
          {showBallpit ? (
            <Ballpit
              key={isPhone ? 'ballpit-phone' : 'ballpit-desktop'}
              className="hero__canvas"
              count={isPhone ? 28 : 100}
              gravity={0.01}
              friction={0.9975}
              wallBounce={0.95}
              followCursor={!isPhone}
              colors={[0xc9a227, 0xf4c95f, 0xe8d5a3, 0xf7f1e8, 0x2c5f4a]}
            />
          ) : null}
        </div>

        <div className="hero__veil" aria-hidden="true" />

        <div className="hero__content">
          <p className="hero__eyebrow">{hero.eyebrow}</p>
          <h1 className="hero__name">{hero.name}</h1>
          <p className="hero__lede">{hero.lede}</p>
          <div className="hero__actions">
            <a
              className="hero__cta"
              href="#sabbath"
              onClick={(event) => {
                const section = document.getElementById('sabbath');
                if (!section) return;
                event.preventDefault();
                section.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              {hero.primaryCta}
            </a>
            <Link className="hero__cta hero__cta--ghost" to="/links">
              {hero.secondaryCta}
            </Link>
          </div>
        </div>
      </section>

      <section className="about" id="about">
        <div className="about__inner">
          <h2 className="about__title">{about.title}</h2>
          {about.paragraphs.map((paragraph, index) => (
            <p
              key={`about-p-${index}`}
              className={index === 0 ? 'about__text' : 'about__text about__text--spaced'}
            >
              {paragraph}
            </p>
          ))}
          <p className="about__verse">{about.verse}</p>
        </div>
      </section>

      <section className="ministry" id="ministry">
        <div className="ministry__inner">
          <h2 className="ministry__title">{ministry.title}</h2>
          <p className="ministry__lede">{ministry.lede}</p>
          <ul className="ministry__list">
            {ministry.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <div className="ministry__brands">
            <figure className="ministry__brand">
              <img
                src={images.laarfLogo}
                alt={imageAlts.laarfLogo}
                loading="lazy"
                decoding="async"
              />
            </figure>
            <figure className="ministry__brand">
              <img
                src={images.globalMinistriesLogo}
                alt={imageAlts.globalMinistriesLogo}
                loading="lazy"
                decoding="async"
              />
            </figure>
          </div>
        </div>
      </section>

      <section className="publications" id="publications">
        <div className="publications__inner">
          <h2 className="publications__title">{publications.title}</h2>
          <p className="publications__lede">{publications.lede}</p>

          <figure className="publications__showcase">
            <img
              src={images.magazineCovers}
              alt={publications.imageAlt}
              loading="lazy"
              decoding="async"
            />
          </figure>
        </div>
      </section>

      <section className="book" id="book">
        <div className="book__inner">
          <h2 className="book__title">{book.title}</h2>
          <p className="book__lede">{book.lede}</p>

          <figure className="book__showcase">
            <img
              src={images.bookGallery}
              alt={book.imageAlt}
              loading="lazy"
              decoding="async"
            />
          </figure>
        </div>
      </section>

      {(mediaPosts || []).length > 0 ? (
        <MediaFeed heading={mediaHeading} posts={mediaPosts} />
      ) : null}

      {(announcements || []).length > 0 ? (
        <section className="feed feed--announcements" id="announcements">
          <div className="feed__inner">
            <h2 className="feed__title">{announcementsHeading.title}</h2>
            {announcementsHeading.lede ? (
              <p className="feed__lede">{announcementsHeading.lede}</p>
            ) : null}
            <div className="feed__list">
              {announcements.map((item) => (
                <article key={item.id} className="feed__item">
                  {item.date ? <p className="feed__date">{item.date}</p> : null}
                  <h3 className="feed__item-title">{item.title}</h3>
                  {item.body ? <p className="feed__body">{item.body}</p> : null}
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {(programs || []).length > 0 ? (
        <section className="feed feed--programs" id="programs">
          <div className="feed__inner">
            <h2 className="feed__title">{programsHeading.title}</h2>
            {programsHeading.lede ? <p className="feed__lede">{programsHeading.lede}</p> : null}
            <div className="feed__list">
              {programs.map((item) => (
                <article key={item.id} className="feed__item feed__item--program">
                  {item.date ? <p className="feed__date">{item.date}</p> : null}
                  <h3 className="feed__item-title">{item.title}</h3>
                  {item.details ? <p className="feed__body">{item.details}</p> : null}
                  {item.flyer ? (
                    <figure className="feed__flyer">
                      <img
                        src={item.flyer}
                        alt={item.flyerAlt || item.title}
                        loading="lazy"
                        decoding="async"
                      />
                    </figure>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {(dailyWords || []).length > 0 ? (
        <section className="feed feed--words" id="daily-words">
          <div className="feed__inner">
            <h2 className="feed__title">{dailyWordsHeading.title}</h2>
            {dailyWordsHeading.lede ? (
              <p className="feed__lede">{dailyWordsHeading.lede}</p>
            ) : null}
            <div className="feed__list">
              {dailyWords.map((item) => (
                <article key={item.id} className="feed__item feed__item--word">
                  {item.date ? <p className="feed__date">{item.date}</p> : null}
                  <h3 className="feed__item-title">{item.title}</h3>
                  {item.body ? <p className="feed__body">{item.body}</p> : null}
                  {item.scripture ? (
                    <p className="feed__scripture">{item.scripture}</p>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="sabbath" id="sabbath">
        <div className="sabbath__inner">
          <h2 className="sabbath__title">{sabbath.title}</h2>
          <p className="sabbath__lede">{sabbath.lede}</p>

          <p className="sabbath__meta">
            <span className="sabbath__live">{sabbath.liveLabel}</span>
            <span>{sabbath.timeLabel}</span>
          </p>

          <nav className="socials" aria-label="Social media">
            {socials.map((social) => (
              <a
                key={social.id}
                className="socials__link"
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {social.name}
              </a>
            ))}
          </nav>

          <p className="sabbath__linktree-wrap">
            <Link className="sabbath__linktree-btn" to="/links">
              {sabbath.linkTreeLabel}
            </Link>
          </p>

          <figure className="sabbath__flyer">
            <img
              src={images.sabbathFlyer}
              alt={sabbath.flyerAlt}
              loading="lazy"
              decoding="async"
            />
          </figure>

          <p className="sabbath__note">{sabbath.note}</p>
        </div>
      </section>
    </div>
  );
}

export default Home;
