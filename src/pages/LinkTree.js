import { Link } from 'react-router-dom';
import SiteMenu from '../components/SiteMenu';
import { useContent } from '../content/ContentProvider';
import '../App.css';
import './LinkTree.css';

function LinkTree() {
  const { content } = useContent();
  const { linkTree, linkTreeLinks, images } = content;

  return (
    <div className="linktree">
      <SiteMenu />
      <div className="linktree__glow" aria-hidden="true" />

      <header className="linktree__header">
        <img
          className="linktree__avatar"
          src={images.portrait}
          alt={linkTree.avatarAlt}
        />
        <p className="linktree__eyebrow">{linkTree.eyebrow}</p>
        <h1 className="linktree__name">{linkTree.name}</h1>
        <p className="linktree__lede">{linkTree.lede}</p>
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

      <p className="linktree__footer">{linkTree.footer}</p>
    </div>
  );
}

export default LinkTree;
