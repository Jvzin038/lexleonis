import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { getNavItems } from '@/lib/navigation';

export const DEFAULT_SETTINGS = {
  site_name: 'Atlética Lex Leonis',
  short_name: 'Lex Leonis',
  tagline: 'Força, tradição e competitividade no curso de Direito',
  description:
    'Portal oficial da Atlética Lex Leonis: eventos, ingressos, esportes, loja oficial e a vida acadêmica do curso de Direito.',
  logo_url: '',
  favicon_url: '',
  color_primary: '#6B16C5',
  color_deep: '#24083F',
  color_gold: '#F5C928',
  color_ink: '#111111',
  color_surface: '#FFFFFF',
  font_heading: 'Unbounded',
  font_body: 'Inter',
  contact_email: '',
  contact_phone: '',
  whatsapp: '',
  address: '',
  city: '',
  map_url: '',
  instagram: '',
  tiktok: '',
  youtube: '',
  facebook: '',
  x_url: '',
  footer_text: '',
  footer_note: '',
  seo_title: '',
  seo_description: '',
  announcement_text: '',
  announcement_active: false,
  maintenance_mode: false,
  maintenance_title: 'Estamos preparando algo novo',
  maintenance_message:
    'O site da Atlética Lex Leonis está temporariamente em manutenção. Voltamos em breve com novidades.',
  checkout_mode: 'preorder',
  checkout_notice: '',
};

const FONT_STACKS = {
  Unbounded: "'Unbounded', system-ui, sans-serif",
  'Archivo Black': "'Archivo Black', system-ui, sans-serif",
  Oswald: "'Oswald', system-ui, sans-serif",
  Montserrat: "'Montserrat', system-ui, sans-serif",
  Inter: "'Inter', system-ui, sans-serif",
  'Bebas Neue': "'Bebas Neue', system-ui, sans-serif",
  'Work Sans': "'Work Sans', system-ui, sans-serif",
  'Source Sans 3': "'Source Sans 3', system-ui, sans-serif",
};

export function fontStack(name, fallback = 'Inter') {
  return FONT_STACKS[name] || FONT_STACKS[fallback];
}

function applyTheme(settings) {
  const root = document.documentElement;
  root.style.setProperty('--brand-primary', settings.color_primary || DEFAULT_SETTINGS.color_primary);
  root.style.setProperty('--brand-deep', settings.color_deep || DEFAULT_SETTINGS.color_deep);
  root.style.setProperty('--brand-gold', settings.color_gold || DEFAULT_SETTINGS.color_gold);
  root.style.setProperty('--brand-ink', settings.color_ink || DEFAULT_SETTINGS.color_ink);
  root.style.setProperty('--brand-surface', settings.color_surface || DEFAULT_SETTINGS.color_surface);
  const heading = fontStack(settings.font_heading, 'Unbounded');
  root.style.setProperty('--font-heading', heading);
  root.style.setProperty('--font-display', heading);
  root.style.setProperty('--font-body', fontStack(settings.font_body, 'Inter'));

  document.title = settings.seo_title || settings.site_name || DEFAULT_SETTINGS.site_name;
  if (settings.favicon_url) {
    let link = document.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = settings.favicon_url;
  }
}

const SiteContext = createContext({
  settings: DEFAULT_SETTINGS,
  navItems: [],
  loading: true,
  refresh: async () => {},
});

export function SiteProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [navItems, setNavItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [settingsPage, navPage] = await Promise.all([
        base44.entities.SiteSettings.list({ sort: '-updated_date', limit: 1 }),
        base44.entities.NavItem.list({ sort: 'order', limit: 200 }),
      ]);
      const found = settingsPage?.items?.[0];
      if (found) setSettings({ ...DEFAULT_SETTINGS, ...found });
      setNavItems(navPage?.items || []);
    } catch (error) {
      setSettings(DEFAULT_SETTINGS);
      setNavItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    applyTheme(settings);
  }, [settings]);

  const value = useMemo(
    () => ({ settings, navItems, loading, refresh: load, setSettings }),
    [settings, navItems, loading, load],
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  return useContext(SiteContext);
}

export function useNav(location) {
  const { navItems } = useSite();
  return useMemo(() => getNavItems(navItems, location), [navItems, location]);
}