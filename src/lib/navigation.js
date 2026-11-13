export const DEFAULT_NAV_ITEMS = [
  { label: 'Início', path: '/' },
  { label: 'A Atlética', path: '/atletica' },
  { label: 'Eventos', path: '/eventos' },
  { label: 'Calendário', path: '/calendario' },
  { label: 'Esportes', path: '/esportes' },
  { label: 'Loja', path: '/loja' },
  { label: 'Notícias', path: '/noticias' },
  { label: 'Momentos', path: '/momentos' },
  { label: 'Patrocinadores', path: '/patrocinadores' },
  { label: 'Contato', path: '/contato' },
];

export function getNavItems(navItems, location) {
  const configuredItems = navItems
    .filter((item) => (location ? item.location === location : true))
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (configuredItems.length > 0 || !location) return configuredItems;

  return DEFAULT_NAV_ITEMS.map((item, index) => ({
    ...item,
    id: `default-${location}-${index}`,
    location,
    order: index,
    visible: true,
    external: false,
  }));
}
