import { useEffect } from 'react';
import { useSite } from '@/lib/site';

export default function usePageMeta(title, description) {
  const { settings } = useSite();

  useEffect(() => {
    const siteName = settings.site_name || 'Atlética Lex Leonis';
    document.title = title ? `${title} • ${siteName}` : settings.seo_title || siteName;

    const text = description || settings.seo_description;
    if (text) {
      let tag = document.querySelector('meta[name="description"]');
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', 'description');
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', text);
    }
  }, [title, description, settings.site_name, settings.seo_title, settings.seo_description]);
}