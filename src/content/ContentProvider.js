import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { defaultContent, mergeContent } from '../data/defaultContent';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const ContentContext = createContext({
  content: defaultContent,
  loading: true,
  saving: false,
  error: null,
  refresh: async () => {},
  saveContent: async () => ({ ok: false, error: 'Not ready' }),
  uploadImage: async () => ({ ok: false, error: 'Not ready' })
});

export function ContentProvider({ children }) {
  const [content, setContent] = useState(defaultContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured || !supabase) {
      setContent(defaultContent);
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from('site_content')
      .select('data')
      .eq('id', 1)
      .maybeSingle();

    if (fetchError) {
      setError(fetchError.message);
      setContent(defaultContent);
    } else if (data?.data) {
      setContent(mergeContent(data.data));
    } else {
      setContent(defaultContent);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const saveContent = useCallback(async (nextContent) => {
    const merged = mergeContent(nextContent);
    setSaving(true);
    setError(null);

    if (!isSupabaseConfigured || !supabase) {
      setSaving(false);
      return {
        ok: false,
        error: 'Supabase is not configured. Add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.'
      };
    }

    const { error: upsertError } = await supabase.from('site_content').upsert({
      id: 1,
      data: merged,
      updated_at: new Date().toISOString()
    });

    setSaving(false);

    if (upsertError) {
      setError(upsertError.message);
      return { ok: false, error: upsertError.message };
    }

    setContent(merged);
    return { ok: true };
  }, []);

  const uploadImage = useCallback(async (file, key) => {
    if (!file) {
      return { ok: false, error: 'No file selected.' };
    }

    if (!isSupabaseConfigured || !supabase) {
      return {
        ok: false,
        error: 'Supabase is not configured. Add REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.'
      };
    }

    const extension = file.name.includes('.')
      ? file.name.split('.').pop().toLowerCase()
      : 'jpg';
    const path = `${key}-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from('site-media')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || undefined
      });

    if (uploadError) {
      return { ok: false, error: uploadError.message };
    }

    const { data } = supabase.storage.from('site-media').getPublicUrl(path);
    const publicUrl = data?.publicUrl;

    if (!publicUrl) {
      return { ok: false, error: 'Upload succeeded but no public URL was returned.' };
    }

    return { ok: true, url: publicUrl };
  }, []);

  const value = useMemo(
    () => ({
      content,
      loading,
      saving,
      error,
      refresh,
      saveContent,
      uploadImage
    }),
    [content, loading, saving, error, refresh, saveContent, uploadImage]
  );

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  return useContext(ContentContext);
}
