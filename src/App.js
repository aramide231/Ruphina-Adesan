import { useEffect, useState } from 'react';
import Ballpit from './components/Ballpit';
import './App.css';

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

function App() {
  const isPhone = useIsPhone();
  const reducedMotion = usePrefersReducedMotion();
  const showBallpit = !reducedMotion;

  return (
    <div className="site">
      <section className="hero" aria-label="Welcome">
        <div className="hero__ballpit" aria-hidden="true">
          {showBallpit ? (
            <Ballpit
              className="hero__canvas"
              count={isPhone ? 22 : 80}
              gravity={0.01}
              friction={0.9975}
              wallBounce={0.95}
              followCursor={!isPhone}
              lite={isPhone}
              colors={[0xc9a227, 0xf4c95f, 0xe8d5a3, 0xf7f1e8, 0x2c5f4a]}
            />
          ) : null}
        </div>

        <div className="hero__veil" aria-hidden="true" />

        <div className="hero__content">
          <p className="hero__eyebrow">Evang. Dr. · UK Clergy</p>
          <h1 className="hero__name">Ruphina Ojo Adesan</h1>
          <p className="hero__lede">
            Wisdom Ministries UK · lifestyle faith, Sabbath fellowship, and daily wellness.
          </p>
          <div className="hero__actions">
            <a className="hero__cta" href="#sabbath">
              Join Sabbath
            </a>
          </div>
        </div>
      </section>

      <section className="about" id="about">
        <div className="about__inner">
          <h2 className="about__title">About</h2>
          <p className="about__text">
            Evang. Dr. Ruphina Ojo Adesan has walked in leadership all her adult
            life. She serves with Wisdom Ministries UK, is CEO and Editor in Chief
            of Wisdom Magazine, and leads through the LaBoard Ojo Adesan Ambrose
            &amp; Ruphina Foundation (LAARF) and Ruphina Ojo Adesan Global Ministries.
          </p>
          <p className="about__text about__text--spaced">
            Retired but not tired — she is refiring in His vineyard to His glory.
            Glory to God Most High.
          </p>
          <p className="about__verse">
            “Jesus gave us power and authority to cast out all Demons and Heal all
            Diseases.” — Luke 9:1
          </p>
        </div>
      </section>

      <section className="ministry" id="ministry">
        <div className="ministry__inner">
          <h2 className="ministry__title">Ministry &amp; work</h2>
          <p className="ministry__lede">
            Most of what she does is lifestyle influencing — faith lived out in
            word, wellness, and weekday witness.
          </p>
          <ul className="ministry__list">
            <li>Wisdom Ministries UK</li>
            <li>Wisdom Magazine — CEO &amp; Editor in Chief</li>
            <li>LaBoard Ojo Adesan Ambrose &amp; Ruphina Foundation (LAARF)</li>
            <li>Ruphina Ojo Adesan Global Ministries</li>
          </ul>

          <div className="ministry__brands">
            <figure className="ministry__brand">
              <img
                src={`${process.env.PUBLIC_URL}/brand/laarf-foundation.png`}
                alt="LaBoard Ojo Adesan Ambrose & Ruphina Foundation emblem with Wisdom Magazine"
                loading="lazy"
                decoding="async"
              />
            </figure>
            <figure className="ministry__brand">
              <img
                src={`${process.env.PUBLIC_URL}/brand/global-ministries.png`}
                alt="Ruphina Ojo Adesan Global Ministries logo"
                loading="lazy"
                decoding="async"
              />
            </figure>
          </div>
        </div>
      </section>

      <section className="sabbath" id="sabbath">
        <div className="sabbath__inner">
          <h2 className="sabbath__title">Saturdays · Sabbath Fellowship</h2>
          <p className="sabbath__lede">
            Join the live gathering at 12 noon with Ruphina Ojo Adesan Global
            Ministries — streaming on Instagram, Facebook, TikTok, and YouTube.
          </p>

          <p className="sabbath__meta">
            <span className="sabbath__live">Live</span>
            <span>Service time · 12 noon</span>
          </p>

          <figure className="sabbath__flyer">
            <img
              src={`${process.env.PUBLIC_URL}/brand/sabbath-flyer.png`}
              alt="Wisdom Ministries UK Sabbath Fellowship invitation featuring Evang. Dr. Ruphina Ojo Adesan"
              loading="lazy"
              decoding="async"
            />
          </figure>

          <p className="sabbath__note">
            She also leads a daily health challenge, inviting others into steadier,
            healthier living.
          </p>
        </div>
      </section>
    </div>
  );
}

export default App;
