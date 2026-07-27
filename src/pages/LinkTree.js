import { Link } from 'react-router-dom';
import { linkTreeLinks } from '../data/links';
import './LinkTree.css';

function LinkTree() {
  return (
    <div className="linktree">
      <div className="linktree__glow" aria-hidden="true" />

      <header className="linktree__header">
        <img
          className="linktree__avatar"
          src={`${process.env.PUBLIC_URL}/brand/ruphina-portrait.png`}
          alt="Evang. Dr. Ruphina Ojo Adesan"
        />
        <p className="linktree__eyebrow">Evang. Dr. · UK Clergy</p>
        <h1 className="linktree__name">Ruphina Ojo Adesan</h1>
        <p className="linktree__lede">
          Wisdom Ministries UK · Sabbath streams · lifestyle &amp; wellness
        </p>
      </header>

      <nav className="linktree__list" aria-label="Links">
        {linkTreeLinks.map((item) => {
          const isInternal = item.href.startsWith('/');
          if (isInternal) {
            return (
              <Link key={item.id} className="linktree__item" to={item.href}>
                {item.name}
              </Link>
            );
          }
          return (
            <a
              key={item.id}
              className="linktree__item"
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.name}
            </a>
          );
        })}
      </nav>

      <p className="linktree__footer">
        Glory to God Most High
      </p>
    </div>
  );
}

export default LinkTree;
