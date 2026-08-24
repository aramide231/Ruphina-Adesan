import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useContent } from '../content/ContentProvider';
import { defaultContent, mergeContent } from '../data/defaultContent';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import './Admin.css';

const TABS = [
  { id: 'about', label: 'About' },
  { id: 'sabbath', label: 'Sabbath' },
  { id: 'links', label: 'Links' },
  { id: 'photos', label: 'Photos' }
];

const PHOTO_FIELDS = [
  { key: 'portrait', label: 'Portrait / avatar' },
  { key: 'sabbathFlyer', label: 'Sabbath flyer' },
  { key: 'laarfLogo', label: 'LAARF logo' },
  { key: 'globalMinistriesLogo', label: 'Global Ministries logo' },
  { key: 'magazineCovers', label: 'Wisdom Magazine covers' },
  { key: 'bookGallery', label: 'Book gallery' }
];

function cloneContent(value) {
  return mergeContent(JSON.parse(JSON.stringify(value)));
}

function Field({ label, children }) {
  return (
    <label className="admin__field">
      <span className="admin__label">{label}</span>
      {children}
    </label>
  );
}

function Admin() {
  const { content, loading, saving, saveContent, uploadImage, refresh } = useContent();
  const [session, setSession] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [draft, setDraft] = useState(() => cloneContent(defaultContent));
  const [tab, setTab] = useState('about');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [uploadingKey, setUploadingKey] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthChecking(false);
      return undefined;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setAuthChecking(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      setDraft(cloneContent(content));
    }
  }, [content, loading]);

  const updateSection = (section, key, value) => {
    setDraft((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

  const updateAboutParagraph = (index, value) => {
    setDraft((prev) => {
      const paragraphs = [...prev.about.paragraphs];
      paragraphs[index] = value;
      return {
        ...prev,
        about: { ...prev.about, paragraphs }
      };
    });
  };

  const updateMinistryItem = (index, value) => {
    setDraft((prev) => {
      const items = [...prev.ministry.items];
      items[index] = value;
      return {
        ...prev,
        ministry: { ...prev.ministry, items }
      };
    });
  };

  const addMinistryItem = () => {
    setDraft((prev) => ({
      ...prev,
      ministry: {
        ...prev.ministry,
        items: [...prev.ministry.items, 'New ministry item']
      }
    }));
  };

  const removeMinistryItem = (index) => {
    setDraft((prev) => ({
      ...prev,
      ministry: {
        ...prev.ministry,
        items: prev.ministry.items.filter((_, i) => i !== index)
      }
    }));
  };

  const updateSocial = (index, key, value) => {
    setDraft((prev) => {
      const socials = prev.socials.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      );
      return { ...prev, socials };
    });
  };

  const updateLink = (index, key, value) => {
    setDraft((prev) => {
      const linkTreeLinks = prev.linkTreeLinks.map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      );
      return { ...prev, linkTreeLinks };
    });
  };

  const addLink = () => {
    setDraft((prev) => ({
      ...prev,
      linkTreeLinks: [
        ...prev.linkTreeLinks,
        {
          id: `link-${Date.now()}`,
          name: 'New link',
          href: 'https://'
        }
      ]
    }));
  };

  const removeLink = (index) => {
    setDraft((prev) => ({
      ...prev,
      linkTreeLinks: prev.linkTreeLinks.filter((_, i) => i !== index)
    }));
  };

  const moveLink = (index, direction) => {
    setDraft((prev) => {
      const next = [...prev.linkTreeLinks];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return { ...prev, linkTreeLinks: next };
    });
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setAuthError('');
    setAuthBusy(true);

    if (!isSupabaseConfigured || !supabase) {
      setAuthError(
        'Supabase is not configured. Add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY, then redeploy.'
      );
      setAuthBusy(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (signInError) {
      setAuthError(signInError.message);
    }

    setAuthBusy(false);
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setStatus('');
    setError('');
  };

  const handleSave = async () => {
    setStatus('');
    setError('');
    const result = await saveContent(draft);
    if (result.ok) {
      setStatus('Saved. The public site will show these updates.');
      await refresh();
    } else {
      setError(result.error || 'Could not save.');
    }
  };

  const handlePhotoUpload = async (key, file) => {
    if (!file) return;
    setUploadingKey(key);
    setStatus('');
    setError('');

    const result = await uploadImage(file, key);
    setUploadingKey('');

    if (!result.ok) {
      setError(result.error || 'Upload failed.');
      return;
    }

    setDraft((prev) => ({
      ...prev,
      images: {
        ...prev.images,
        [key]: result.url
      }
    }));
    setStatus(`${PHOTO_FIELDS.find((f) => f.key === key)?.label || 'Photo'} uploaded. Click Save to publish.`);
  };

  if (authChecking || loading) {
    return (
      <div className="admin admin--login">
        <p className="admin__status">Loading…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="admin admin--login">
        <div className="admin__login">
          <div className="admin__login-mark" aria-hidden="true">
            RA
          </div>
          <p className="admin__eyebrow">Admin</p>
          <h1 className="admin__title">Welcome back</h1>
          <p className="admin__hint">
            Please log in with the email and password provided.
          </p>
          <form className="admin__form" onSubmit={handleLogin}>
            <Field label="Email">
              <input
                className="admin__input"
                type="email"
                autoComplete="username"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Field>
            <Field label="Password">
              <input
                className="admin__input"
                type="password"
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field>
            {authError ? <p className="admin__error">{authError}</p> : null}
            <button className="admin__btn admin__btn--gold" type="submit" disabled={authBusy}>
              {authBusy ? 'Signing in…' : 'Log in'}
            </button>
          </form>
          <p className="admin__footer-link">
            <Link to="/">Back to website</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin">
      <header className="admin__top">
        <div>
          <p className="admin__eyebrow">Admin</p>
          <h1 className="admin__title">Edit site content</h1>
        </div>
        <div className="admin__top-actions">
          <button className="admin__btn admin__btn--ghost" type="button" onClick={handleLogout}>
            Log out
          </button>
          <button
            className="admin__btn"
            type="button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </header>

      {status ? <p className="admin__success">{status}</p> : null}
      {error ? <p className="admin__error">{error}</p> : null}

      <nav className="admin__tabs" aria-label="Editor sections">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={
              tab === item.id ? 'admin__tab admin__tab--active' : 'admin__tab'
            }
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="admin__panel">
        {tab === 'about' ? (
          <div className="admin__stack">
            <h2 className="admin__section-title">Hero</h2>
            <Field label="Eyebrow">
              <input
                className="admin__input"
                value={draft.hero.eyebrow}
                onChange={(e) => updateSection('hero', 'eyebrow', e.target.value)}
              />
            </Field>
            <Field label="Name">
              <input
                className="admin__input"
                value={draft.hero.name}
                onChange={(e) => updateSection('hero', 'name', e.target.value)}
              />
            </Field>
            <Field label="Intro">
              <textarea
                className="admin__textarea"
                rows={3}
                value={draft.hero.lede}
                onChange={(e) => updateSection('hero', 'lede', e.target.value)}
              />
            </Field>
            <Field label="Primary button label">
              <input
                className="admin__input"
                value={draft.hero.primaryCta}
                onChange={(e) => updateSection('hero', 'primaryCta', e.target.value)}
              />
            </Field>
            <Field label="Links button label">
              <input
                className="admin__input"
                value={draft.hero.secondaryCta}
                onChange={(e) => updateSection('hero', 'secondaryCta', e.target.value)}
              />
            </Field>

            <h2 className="admin__section-title">About</h2>
            <Field label="Section title">
              <input
                className="admin__input"
                value={draft.about.title}
                onChange={(e) => updateSection('about', 'title', e.target.value)}
              />
            </Field>
            {draft.about.paragraphs.map((paragraph, index) => (
              <Field key={`about-${index}`} label={`Paragraph ${index + 1}`}>
                <textarea
                  className="admin__textarea"
                  rows={4}
                  value={paragraph}
                  onChange={(e) => updateAboutParagraph(index, e.target.value)}
                />
              </Field>
            ))}
            <Field label="Verse">
              <textarea
                className="admin__textarea"
                rows={2}
                value={draft.about.verse}
                onChange={(e) => updateSection('about', 'verse', e.target.value)}
              />
            </Field>

            <h2 className="admin__section-title">Ministry</h2>
            <Field label="Section title">
              <input
                className="admin__input"
                value={draft.ministry.title}
                onChange={(e) => updateSection('ministry', 'title', e.target.value)}
              />
            </Field>
            <Field label="Intro">
              <textarea
                className="admin__textarea"
                rows={3}
                value={draft.ministry.lede}
                onChange={(e) => updateSection('ministry', 'lede', e.target.value)}
              />
            </Field>
            {draft.ministry.items.map((item, index) => (
              <div key={`ministry-${index}`} className="admin__row">
                <Field label={`Item ${index + 1}`}>
                  <input
                    className="admin__input"
                    value={item}
                    onChange={(e) => updateMinistryItem(index, e.target.value)}
                  />
                </Field>
                <button
                  type="button"
                  className="admin__btn admin__btn--danger"
                  onClick={() => removeMinistryItem(index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button type="button" className="admin__btn admin__btn--ghost" onClick={addMinistryItem}>
              Add ministry item
            </button>

            <h2 className="admin__section-title">Publications</h2>
            <Field label="Magazine title">
              <input
                className="admin__input"
                value={draft.publications.title}
                onChange={(e) => updateSection('publications', 'title', e.target.value)}
              />
            </Field>
            <Field label="Magazine blurb">
              <textarea
                className="admin__textarea"
                rows={3}
                value={draft.publications.lede}
                onChange={(e) => updateSection('publications', 'lede', e.target.value)}
              />
            </Field>
            <Field label="Book title">
              <input
                className="admin__input"
                value={draft.book.title}
                onChange={(e) => updateSection('book', 'title', e.target.value)}
              />
            </Field>
            <Field label="Book blurb">
              <textarea
                className="admin__textarea"
                rows={3}
                value={draft.book.lede}
                onChange={(e) => updateSection('book', 'lede', e.target.value)}
              />
            </Field>
          </div>
        ) : null}

        {tab === 'sabbath' ? (
          <div className="admin__stack">
            <Field label="Title">
              <input
                className="admin__input"
                value={draft.sabbath.title}
                onChange={(e) => updateSection('sabbath', 'title', e.target.value)}
              />
            </Field>
            <Field label="Intro">
              <textarea
                className="admin__textarea"
                rows={4}
                value={draft.sabbath.lede}
                onChange={(e) => updateSection('sabbath', 'lede', e.target.value)}
              />
            </Field>
            <Field label="Live label">
              <input
                className="admin__input"
                value={draft.sabbath.liveLabel}
                onChange={(e) => updateSection('sabbath', 'liveLabel', e.target.value)}
              />
            </Field>
            <Field label="Time label">
              <input
                className="admin__input"
                value={draft.sabbath.timeLabel}
                onChange={(e) => updateSection('sabbath', 'timeLabel', e.target.value)}
              />
            </Field>
            <Field label="Link tree button">
              <input
                className="admin__input"
                value={draft.sabbath.linkTreeLabel}
                onChange={(e) => updateSection('sabbath', 'linkTreeLabel', e.target.value)}
              />
            </Field>
            <Field label="Note">
              <textarea
                className="admin__textarea"
                rows={3}
                value={draft.sabbath.note}
                onChange={(e) => updateSection('sabbath', 'note', e.target.value)}
              />
            </Field>

            <h2 className="admin__section-title">Social URLs</h2>
            {draft.socials.map((social, index) => (
              <div key={social.id} className="admin__card-block">
                <Field label="Name">
                  <input
                    className="admin__input"
                    value={social.name}
                    onChange={(e) => updateSocial(index, 'name', e.target.value)}
                  />
                </Field>
                <Field label="URL">
                  <input
                    className="admin__input"
                    value={social.href}
                    onChange={(e) => updateSocial(index, 'href', e.target.value)}
                  />
                </Field>
              </div>
            ))}
          </div>
        ) : null}

        {tab === 'links' ? (
          <div className="admin__stack">
            <h2 className="admin__section-title">Link tree header</h2>
            <Field label="Eyebrow">
              <input
                className="admin__input"
                value={draft.linkTree.eyebrow}
                onChange={(e) => updateSection('linkTree', 'eyebrow', e.target.value)}
              />
            </Field>
            <Field label="Name">
              <input
                className="admin__input"
                value={draft.linkTree.name}
                onChange={(e) => updateSection('linkTree', 'name', e.target.value)}
              />
            </Field>
            <Field label="Intro">
              <textarea
                className="admin__textarea"
                rows={2}
                value={draft.linkTree.lede}
                onChange={(e) => updateSection('linkTree', 'lede', e.target.value)}
              />
            </Field>
            <Field label="Footer">
              <input
                className="admin__input"
                value={draft.linkTree.footer}
                onChange={(e) => updateSection('linkTree', 'footer', e.target.value)}
              />
            </Field>

            <h2 className="admin__section-title">Buttons</h2>
            {draft.linkTreeLinks.map((item, index) => (
              <div key={item.id} className="admin__card-block">
                <Field label="Label">
                  <input
                    className="admin__input"
                    value={item.name}
                    onChange={(e) => updateLink(index, 'name', e.target.value)}
                  />
                </Field>
                <Field label="URL (use / for site pages, https:// for external)">
                  <input
                    className="admin__input"
                    value={item.href}
                    onChange={(e) => updateLink(index, 'href', e.target.value)}
                  />
                </Field>
                <div className="admin__inline-actions">
                  <button
                    type="button"
                    className="admin__btn admin__btn--ghost"
                    onClick={() => moveLink(index, -1)}
                    disabled={index === 0}
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    className="admin__btn admin__btn--ghost"
                    onClick={() => moveLink(index, 1)}
                    disabled={index === draft.linkTreeLinks.length - 1}
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    className="admin__btn admin__btn--danger"
                    onClick={() => removeLink(index)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button type="button" className="admin__btn admin__btn--ghost" onClick={addLink}>
              Add link
            </button>
          </div>
        ) : null}

        {tab === 'photos' ? (
          <div className="admin__stack">
            <p className="admin__hint">
              Upload a new photo, then click Save at the top so the website uses it.
            </p>
            {PHOTO_FIELDS.map((field) => (
              <div key={field.key} className="admin__card-block">
                <p className="admin__label">{field.label}</p>
                {draft.images[field.key] ? (
                  <img
                    className="admin__preview"
                    src={draft.images[field.key]}
                    alt={field.label}
                  />
                ) : null}
                <input
                  className="admin__file"
                  type="file"
                  accept="image/*"
                  disabled={uploadingKey === field.key}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    handlePhotoUpload(field.key, file);
                    e.target.value = '';
                  }}
                />
                {uploadingKey === field.key ? (
                  <p className="admin__status">Uploading…</p>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <div className="admin__sticky-save">
        <button className="admin__btn" type="button" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        <Link className="admin__text-link" to="/">
          View website
        </Link>
      </div>
    </div>
  );
}

export default Admin;
