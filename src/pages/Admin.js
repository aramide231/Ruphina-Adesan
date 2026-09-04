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
  { id: 'announcements', label: 'Announcements' },
  { id: 'programs', label: 'Programs & flyers' },
  { id: 'words', label: 'Daily Words' }
];

function todayLabel() {
  try {
    return new Date().toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return '';
  }
}

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

function PhotoField({ label, imageSrc, uploading, onUpload }) {
  return (
    <div className="admin__card-block">
      <p className="admin__label">{label}</p>
      {imageSrc ? (
        <img className="admin__preview" src={imageSrc} alt={label} />
      ) : null}
      <input
        className="admin__file"
        type="file"
        accept="image/*"
        disabled={uploading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          onUpload(file);
          e.target.value = '';
        }}
      />
      {uploading ? <p className="admin__status">Uploading…</p> : null}
    </div>
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

  const addAboutParagraph = () => {
    setDraft((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        paragraphs: [...prev.about.paragraphs, 'New paragraph']
      }
    }));
  };

  const removeAboutParagraph = (index) => {
    setDraft((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        paragraphs: prev.about.paragraphs.filter((_, i) => i !== index)
      }
    }));
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

  const addSocial = () => {
    setDraft((prev) => ({
      ...prev,
      socials: [
        ...prev.socials,
        {
          id: `social-${Date.now()}`,
          name: 'New social',
          href: 'https://'
        }
      ]
    }));
  };

  const removeSocial = (index) => {
    setDraft((prev) => ({
      ...prev,
      socials: prev.socials.filter((_, i) => i !== index)
    }));
  };

  const updateListItem = (listKey, index, key, value) => {
    setDraft((prev) => {
      const list = [...(prev[listKey] || [])];
      list[index] = { ...list[index], [key]: value };
      return { ...prev, [listKey]: list };
    });
  };

  const removeListItem = (listKey, index) => {
    setDraft((prev) => ({
      ...prev,
      [listKey]: (prev[listKey] || []).filter((_, i) => i !== index)
    }));
  };

  const moveListItem = (listKey, index, direction) => {
    setDraft((prev) => {
      const next = [...(prev[listKey] || [])];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return { ...prev, [listKey]: next };
    });
  };

  const addAnnouncement = () => {
    setDraft((prev) => ({
      ...prev,
      announcements: [
        {
          id: `announcement-${Date.now()}`,
          title: 'New announcement',
          body: 'Write your announcement here.',
          date: todayLabel()
        },
        ...(prev.announcements || [])
      ]
    }));
    setTab('announcements');
  };

  const addProgram = () => {
    setDraft((prev) => ({
      ...prev,
      programs: [
        {
          id: `program-${Date.now()}`,
          title: 'Upcoming program',
          details: 'Add date, time, venue, and details.',
          date: '',
          flyer: '',
          flyerAlt: ''
        },
        ...(prev.programs || [])
      ]
    }));
    setTab('programs');
  };

  const addDailyWord = () => {
    setDraft((prev) => ({
      ...prev,
      dailyWords: [
        {
          id: `word-${Date.now()}`,
          title: 'Daily Word',
          date: todayLabel(),
          body: 'Share today’s Word here.',
          scripture: ''
        },
        ...(prev.dailyWords || [])
      ]
    }));
    setTab('words');
  };

  const handleProgramFlyerUpload = async (index, file) => {
    if (!file) return;
    const program = (draft.programs || [])[index];
    const key = `program-${program?.id || index}`;
    setUploadingKey(key);
    setStatus('');
    setError('');

    const result = await uploadImage(file, key);
    setUploadingKey('');

    if (!result.ok) {
      setError(result.error || 'Upload failed.');
      return;
    }

    updateListItem('programs', index, 'flyer', result.url);
    setStatus('Program flyer uploaded. Click Save to publish.');
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
        'Supabase is not configured. Add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY, then restart the app.'
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
    setSession(null);
    setAuthError('');
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

  const handlePhotoUpload = async (key, label, file) => {
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
    setStatus(`${label || 'Photo'} uploaded. Click Save to publish.`);
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

      <div className="admin__publish-bar">
        <p className="admin__publish-label">Publish new material</p>
        <div className="admin__publish-actions">
          <button type="button" className="admin__btn admin__btn--gold" onClick={addAnnouncement}>
            + Announcement
          </button>
          <button type="button" className="admin__btn admin__btn--gold" onClick={addProgram}>
            + Program flyer
          </button>
          <button type="button" className="admin__btn admin__btn--gold" onClick={addDailyWord}>
            + Daily Word
          </button>
        </div>
      </div>

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
              <div key={`about-${index}`} className="admin__card-block">
                <Field label={`Paragraph ${index + 1}`}>
                  <textarea
                    className="admin__textarea"
                    rows={4}
                    value={paragraph}
                    onChange={(e) => updateAboutParagraph(index, e.target.value)}
                  />
                </Field>
                <button
                  type="button"
                  className="admin__btn admin__btn--danger"
                  onClick={() => removeAboutParagraph(index)}
                  disabled={draft.about.paragraphs.length <= 1}
                >
                  Remove paragraph
                </button>
              </div>
            ))}
            <button type="button" className="admin__btn admin__btn--ghost" onClick={addAboutParagraph}>
              Add paragraph
            </button>
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
            <PhotoField
              label="LAARF logo"
              imageSrc={draft.images.laarfLogo}
              uploading={uploadingKey === 'laarfLogo'}
              onUpload={(file) => handlePhotoUpload('laarfLogo', 'LAARF logo', file)}
            />
            <PhotoField
              label="Global Ministries logo"
              imageSrc={draft.images.globalMinistriesLogo}
              uploading={uploadingKey === 'globalMinistriesLogo'}
              onUpload={(file) =>
                handlePhotoUpload('globalMinistriesLogo', 'Global Ministries logo', file)
              }
            />

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
            <PhotoField
              label="Wisdom Magazine covers"
              imageSrc={draft.images.magazineCovers}
              uploading={uploadingKey === 'magazineCovers'}
              onUpload={(file) =>
                handlePhotoUpload('magazineCovers', 'Wisdom Magazine covers', file)
              }
            />
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
            <PhotoField
              label="Book gallery"
              imageSrc={draft.images.bookGallery}
              uploading={uploadingKey === 'bookGallery'}
              onUpload={(file) => handlePhotoUpload('bookGallery', 'Book gallery', file)}
            />
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
            <PhotoField
              label="Sabbath flyer"
              imageSrc={draft.images.sabbathFlyer}
              uploading={uploadingKey === 'sabbathFlyer'}
              onUpload={(file) => handlePhotoUpload('sabbathFlyer', 'Sabbath flyer', file)}
            />

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
                <button
                  type="button"
                  className="admin__btn admin__btn--danger"
                  onClick={() => removeSocial(index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button type="button" className="admin__btn admin__btn--ghost" onClick={addSocial}>
              Add social link
            </button>
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
            <PhotoField
              label="Portrait / avatar"
              imageSrc={draft.images.portrait}
              uploading={uploadingKey === 'portrait'}
              onUpload={(file) => handlePhotoUpload('portrait', 'Portrait / avatar', file)}
            />

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

        {tab === 'announcements' ? (
          <div className="admin__stack">
            <p className="admin__hint">
              Post news and notices. Click <strong>Add announcement</strong>, write it, then Save.
            </p>
            <Field label="Section title on website">
              <input
                className="admin__input"
                value={draft.announcementsHeading.title}
                onChange={(e) =>
                  updateSection('announcementsHeading', 'title', e.target.value)
                }
              />
            </Field>
            <Field label="Section intro">
              <textarea
                className="admin__textarea"
                rows={2}
                value={draft.announcementsHeading.lede}
                onChange={(e) =>
                  updateSection('announcementsHeading', 'lede', e.target.value)
                }
              />
            </Field>
            <button type="button" className="admin__btn admin__btn--gold" onClick={addAnnouncement}>
              + Add announcement
            </button>
            {(draft.announcements || []).map((item, index) => (
              <div key={item.id} className="admin__card-block">
                <h2 className="admin__section-title">Announcement {index + 1}</h2>
                <Field label="Title">
                  <input
                    className="admin__input"
                    value={item.title}
                    onChange={(e) =>
                      updateListItem('announcements', index, 'title', e.target.value)
                    }
                  />
                </Field>
                <Field label="Date (optional)">
                  <input
                    className="admin__input"
                    value={item.date}
                    onChange={(e) =>
                      updateListItem('announcements', index, 'date', e.target.value)
                    }
                    placeholder="e.g. 4 Sep 2026"
                  />
                </Field>
                <Field label="Announcement text">
                  <textarea
                    className="admin__textarea"
                    rows={5}
                    value={item.body}
                    onChange={(e) =>
                      updateListItem('announcements', index, 'body', e.target.value)
                    }
                  />
                </Field>
                <div className="admin__inline-actions">
                  <button
                    type="button"
                    className="admin__btn admin__btn--ghost"
                    onClick={() => moveListItem('announcements', index, -1)}
                    disabled={index === 0}
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    className="admin__btn admin__btn--ghost"
                    onClick={() => moveListItem('announcements', index, 1)}
                    disabled={index === draft.announcements.length - 1}
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    className="admin__btn admin__btn--danger"
                    onClick={() => removeListItem('announcements', index)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {tab === 'programs' ? (
          <div className="admin__stack">
            <p className="admin__hint">
              Upload flyers for upcoming programs. Click <strong>Add program flyer</strong>, add
              details and a photo, then Save.
            </p>
            <Field label="Section title on website">
              <input
                className="admin__input"
                value={draft.programsHeading.title}
                onChange={(e) => updateSection('programsHeading', 'title', e.target.value)}
              />
            </Field>
            <Field label="Section intro">
              <textarea
                className="admin__textarea"
                rows={2}
                value={draft.programsHeading.lede}
                onChange={(e) => updateSection('programsHeading', 'lede', e.target.value)}
              />
            </Field>
            <button type="button" className="admin__btn admin__btn--gold" onClick={addProgram}>
              + Add program flyer
            </button>
            {(draft.programs || []).map((item, index) => (
              <div key={item.id} className="admin__card-block">
                <h2 className="admin__section-title">Program {index + 1}</h2>
                <Field label="Program title">
                  <input
                    className="admin__input"
                    value={item.title}
                    onChange={(e) => updateListItem('programs', index, 'title', e.target.value)}
                  />
                </Field>
                <Field label="Date / time">
                  <input
                    className="admin__input"
                    value={item.date}
                    onChange={(e) => updateListItem('programs', index, 'date', e.target.value)}
                    placeholder="e.g. Saturday 12 noon"
                  />
                </Field>
                <Field label="Details">
                  <textarea
                    className="admin__textarea"
                    rows={4}
                    value={item.details}
                    onChange={(e) => updateListItem('programs', index, 'details', e.target.value)}
                  />
                </Field>
                <Field label="Flyer alt text">
                  <input
                    className="admin__input"
                    value={item.flyerAlt}
                    onChange={(e) => updateListItem('programs', index, 'flyerAlt', e.target.value)}
                    placeholder="Describe the flyer"
                  />
                </Field>
                <PhotoField
                  label="Upload flyer image"
                  imageSrc={item.flyer}
                  uploading={uploadingKey === `program-${item.id}`}
                  onUpload={(file) => handleProgramFlyerUpload(index, file)}
                />
                <div className="admin__inline-actions">
                  <button
                    type="button"
                    className="admin__btn admin__btn--ghost"
                    onClick={() => moveListItem('programs', index, -1)}
                    disabled={index === 0}
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    className="admin__btn admin__btn--ghost"
                    onClick={() => moveListItem('programs', index, 1)}
                    disabled={index === draft.programs.length - 1}
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    className="admin__btn admin__btn--danger"
                    onClick={() => removeListItem('programs', index)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {tab === 'words' ? (
          <div className="admin__stack">
            <p className="admin__hint">
              Publish daily Words for the website. Click <strong>Add Daily Word</strong>, write it,
              then Save.
            </p>
            <Field label="Section title on website">
              <input
                className="admin__input"
                value={draft.dailyWordsHeading.title}
                onChange={(e) => updateSection('dailyWordsHeading', 'title', e.target.value)}
              />
            </Field>
            <Field label="Section intro">
              <textarea
                className="admin__textarea"
                rows={2}
                value={draft.dailyWordsHeading.lede}
                onChange={(e) => updateSection('dailyWordsHeading', 'lede', e.target.value)}
              />
            </Field>
            <button type="button" className="admin__btn admin__btn--gold" onClick={addDailyWord}>
              + Add Daily Word
            </button>
            {(draft.dailyWords || []).map((item, index) => (
              <div key={item.id} className="admin__card-block">
                <h2 className="admin__section-title">Word {index + 1}</h2>
                <Field label="Title">
                  <input
                    className="admin__input"
                    value={item.title}
                    onChange={(e) => updateListItem('dailyWords', index, 'title', e.target.value)}
                  />
                </Field>
                <Field label="Date">
                  <input
                    className="admin__input"
                    value={item.date}
                    onChange={(e) => updateListItem('dailyWords', index, 'date', e.target.value)}
                    placeholder="e.g. 4 Sep 2026"
                  />
                </Field>
                <Field label="The Word">
                  <textarea
                    className="admin__textarea"
                    rows={6}
                    value={item.body}
                    onChange={(e) => updateListItem('dailyWords', index, 'body', e.target.value)}
                  />
                </Field>
                <Field label="Scripture (optional)">
                  <input
                    className="admin__input"
                    value={item.scripture}
                    onChange={(e) =>
                      updateListItem('dailyWords', index, 'scripture', e.target.value)
                    }
                    placeholder="e.g. Proverbs 4:7"
                  />
                </Field>
                <div className="admin__inline-actions">
                  <button
                    type="button"
                    className="admin__btn admin__btn--ghost"
                    onClick={() => moveListItem('dailyWords', index, -1)}
                    disabled={index === 0}
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    className="admin__btn admin__btn--ghost"
                    onClick={() => moveListItem('dailyWords', index, 1)}
                    disabled={index === draft.dailyWords.length - 1}
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    className="admin__btn admin__btn--danger"
                    onClick={() => removeListItem('dailyWords', index)}
                  >
                    Remove
                  </button>
                </div>
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
