const asset = (path) => `${process.env.PUBLIC_URL || ''}${path}`;

export const defaultContent = {
  hero: {
    eyebrow: 'Evang. Dr. · UK Clergy',
    name: 'Ruphina Ojo Adesan',
    lede: 'Author & Publisher · Wisdom Ministries UK · Sabbath fellowship and daily wellness.',
    primaryCta: 'Join Sabbath',
    secondaryCta: 'Links'
  },
  about: {
    title: 'About',
    paragraphs: [
      'Evang. Dr. Ruphina Ojo Adesan has walked in leadership all her adult life. An author and publisher, she serves with Wisdom Ministries UK, is CEO and Editor in Chief of Wisdom Magazine, and leads through the LaBoard Ojo Adesan Ambrose & Ruphina Foundation (LAARF) and Ruphina Ojo Adesan Global Ministries.',
      'Retired but not tired — she is refiring in His vineyard to His glory. Glory to God Most High.'
    ],
    verse: '“Jesus gave us power and authority to cast out all Demons and Heal all Diseases.” — Luke 9:1'
  },
  ministry: {
    title: 'Ministry & work',
    lede: 'Most of what she does is lifestyle influencing — faith lived out in word, wellness, and weekday witness.',
    items: [
      'Author & Publisher',
      'Wisdom Ministries UK',
      'Wisdom Magazine — CEO & Editor in Chief',
      'LaBoard Ojo Adesan Ambrose & Ruphina Foundation (LAARF)',
      'Ruphina Ojo Adesan Global Ministries'
    ]
  },
  publications: {
    title: 'Wisdom Magazine',
    lede: 'As CEO and Editor in Chief, she publishes Wisdom Magazine — faith, leadership, community, and victorious living for readers in the UK and beyond.',
    imageAlt:
      'Collection of Wisdom Magazine covers featuring leadership, ministry, health, and community stories'
  },
  book: {
    title: 'Wisdom for Victorious Living',
    lede: 'A Wisdom Book — her testimony of the rough, thorny road to the top in the National Health Service as a Black female Christian.',
    imageAlt: 'Copies of the book Wisdom for Victorious Living arranged for distribution'
  },
  sabbath: {
    title: 'Saturdays · Sabbath Fellowship',
    lede: 'Join the live gathering at 12 noon with Ruphina Ojo Adesan Global Ministries — streaming on Instagram, Facebook, TikTok, and YouTube.',
    liveLabel: 'Live',
    timeLabel: 'Service time · 12 noon',
    linkTreeLabel: 'Open link tree',
    note: 'She also leads a daily health challenge, inviting others into steadier, healthier living.',
    flyerAlt:
      'Wisdom Ministries UK Sabbath Fellowship invitation featuring Evang. Dr. Ruphina Ojo Adesan'
  },
  linkTree: {
    eyebrow: 'Evang. Dr. · UK Clergy',
    name: 'Ruphina Ojo Adesan',
    lede: 'Author & Publisher · Wisdom Ministries UK · Sabbath & wellness',
    footer: 'Glory to God Most High',
    avatarAlt: 'Evang. Dr. Ruphina Ojo Adesan'
  },
  socials: [
    {
      id: 'instagram',
      name: 'Instagram',
      href: 'https://www.instagram.com/ruphinaojoadesan'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      href: 'https://www.facebook.com/share/1CLtpLStJV/'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      href: 'https://www.tiktok.com/@ruphinaojoadesan'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      href: 'https://youtube.com/@folayemiadesan'
    }
  ],
  linkTreeLinks: [
    {
      id: 'website',
      name: 'Personal website',
      href: '/'
    },
    {
      id: 'publications',
      name: 'Wisdom Magazine · Author & Publisher',
      href: '/#publications'
    },
    {
      id: 'book',
      name: 'Wisdom for Victorious Living',
      href: '/#book'
    },
    {
      id: 'sabbath',
      name: 'Sabbath Fellowship · Saturdays 12 noon',
      href: '/#sabbath'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      href: 'https://www.instagram.com/ruphinaojoadesan'
    },
    {
      id: 'facebook',
      name: 'Facebook',
      href: 'https://www.facebook.com/share/1CLtpLStJV/'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      href: 'https://www.tiktok.com/@ruphinaojoadesan'
    },
    {
      id: 'youtube',
      name: 'YouTube',
      href: 'https://youtube.com/@folayemiadesan'
    }
  ],
  images: {
    portrait: asset('/brand/ruphina-portrait.png'),
    sabbathFlyer: asset('/brand/sabbath-flyer.png'),
    laarfLogo: asset('/brand/laarf-foundation.png'),
    globalMinistriesLogo: asset('/brand/global-ministries.png'),
    magazineCovers: asset('/brand/publications/wisdom-magazine-covers.png'),
    bookGallery: asset('/brand/publications/wisdom-book-gallery.png')
  },
  imageAlts: {
    laarfLogo:
      'LaBoard Ojo Adesan Ambrose & Ruphina Foundation emblem with Wisdom Magazine',
    globalMinistriesLogo: 'Ruphina Ojo Adesan Global Ministries logo'
  },
  announcementsHeading: {
    title: 'Announcements',
    lede: 'News and notices from Wisdom Ministries UK.'
  },
  announcements: [],
  programsHeading: {
    title: 'Upcoming programs',
    lede: 'Flyers and details for gatherings, services, and special events.'
  },
  programs: [],
  dailyWordsHeading: {
    title: 'Daily Words',
    lede: 'Fresh Word for the day — encouragement, scripture, and wisdom for victorious living.'
  },
  dailyWords: [],
  extraSections: []
};

function normalizeList(items, mapItem, fallback = []) {
  return Array.isArray(items) ? items.map(mapItem) : fallback;
}

export function mergeContent(partial) {
  if (!partial || typeof partial !== 'object') {
    return JSON.parse(JSON.stringify(defaultContent));
  }

  return {
    ...defaultContent,
    ...partial,
    hero: { ...defaultContent.hero, ...(partial.hero || {}) },
    about: {
      ...defaultContent.about,
      ...(partial.about || {}),
      paragraphs: Array.isArray(partial.about?.paragraphs)
        ? partial.about.paragraphs
        : defaultContent.about.paragraphs
    },
    ministry: {
      ...defaultContent.ministry,
      ...(partial.ministry || {}),
      items: Array.isArray(partial.ministry?.items)
        ? partial.ministry.items
        : defaultContent.ministry.items
    },
    publications: { ...defaultContent.publications, ...(partial.publications || {}) },
    book: { ...defaultContent.book, ...(partial.book || {}) },
    sabbath: { ...defaultContent.sabbath, ...(partial.sabbath || {}) },
    linkTree: { ...defaultContent.linkTree, ...(partial.linkTree || {}) },
    announcementsHeading: {
      ...defaultContent.announcementsHeading,
      ...(partial.announcementsHeading || {})
    },
    programsHeading: {
      ...defaultContent.programsHeading,
      ...(partial.programsHeading || {})
    },
    dailyWordsHeading: {
      ...defaultContent.dailyWordsHeading,
      ...(partial.dailyWordsHeading || {})
    },
    socials: Array.isArray(partial.socials) ? partial.socials : defaultContent.socials,
    linkTreeLinks: Array.isArray(partial.linkTreeLinks)
      ? partial.linkTreeLinks
      : defaultContent.linkTreeLinks,
    images: { ...defaultContent.images, ...(partial.images || {}) },
    imageAlts: { ...defaultContent.imageAlts, ...(partial.imageAlts || {}) },
    announcements: normalizeList(partial.announcements, (item) => ({
      id: item.id || `announcement-${Date.now()}`,
      title: item.title || 'New announcement',
      body: item.body || '',
      date: item.date || ''
    })),
    programs: normalizeList(partial.programs, (item) => ({
      id: item.id || `program-${Date.now()}`,
      title: item.title || 'Upcoming program',
      details: item.details || '',
      date: item.date || '',
      flyer: item.flyer || '',
      flyerAlt: item.flyerAlt || ''
    })),
    dailyWords: normalizeList(partial.dailyWords, (item) => ({
      id: item.id || `word-${Date.now()}`,
      title: item.title || 'Daily Word',
      date: item.date || '',
      body: item.body || '',
      scripture: item.scripture || ''
    })),
    extraSections: Array.isArray(partial.extraSections)
      ? partial.extraSections.map((section) => ({
          id: section.id || `extra-${Date.now()}`,
          title: section.title || 'New section',
          lede: section.lede || '',
          image: section.image || '',
          imageAlt: section.imageAlt || ''
        }))
      : defaultContent.extraSections
  };
}
