export const ROLE_DEFINITIONS = [
  {
    key: 'admin_geral',
    label: 'Administrador geral',
    description: 'Acesso total ao painel, conteúdo, financeiro e usuários.',
    permissions: ['*'],
  },
  {
    key: 'esportes',
    label: 'Diretoria de esportes',
    description: 'Modalidades, atletas, partidas, resultados e tabelas.',
    permissions: ['dashboard', 'esportes', 'momentos'],
  },
  {
    key: 'eventos',
    label: 'Diretoria de eventos',
    description: 'Eventos, lotes de ingressos, inscrições, participantes, portaria e emissão.',
    permissions: ['dashboard', 'eventos', 'inscricoes', 'ingressos', 'checkin', 'mensagens'],
  },
  {
    key: 'financeiro',
    label: 'Diretoria financeira',
    description: 'Relatórios de vendas, confirmação de pagamentos, pedidos e reembolsos.',
    permissions: ['dashboard', 'financeiro', 'inscricoes', 'ingressos', 'pedidos'],
  },
  {
    key: 'comunicacao',
    label: 'Comunicação e marketing',
    description: 'Notícias, galeria, páginas, patrocinadores e personalização do site.',
    permissions: ['dashboard', 'noticias', 'momentos', 'paginas', 'midia', 'patrocinadores', 'personalizar'],
  },
  {
    key: 'checkin',
    label: 'Operador de portaria',
    description: 'Somente a leitura de QR Code, validação de ingressos e portaria ao vivo.',
    permissions: ['checkin'],
  },
];

export const PERMISSION_DEFINITIONS = [
  { key: 'dashboard', label: 'Painel e indicadores' },
  { key: 'personalizar', label: 'Personalizar site' },
  { key: 'paginas', label: 'Páginas e menus' },
  { key: 'eventos', label: 'Eventos' },
  { key: 'inscricoes', label: 'Inscrições' },
  { key: 'ingressos', label: 'Ingressos e pedidos' },
  { key: 'checkin', label: 'Controle de entrada' },
  { key: 'noticias', label: 'Notícias e comunicados' },
  { key: 'momentos', label: 'Galeria de momentos' },
  { key: 'esportes', label: 'Esportes' },
  { key: 'loja', label: 'Loja e produtos' },
  { key: 'pedidos', label: 'Pedidos da loja' },
  { key: 'patrocinadores', label: 'Patrocinadores' },
  { key: 'diretoria', label: 'Diretoria' },
  { key: 'midia', label: 'Biblioteca de mídia' },
  { key: 'financeiro', label: 'Relatórios financeiros' },
  { key: 'mensagens', label: 'Mensagens de contato' },
  { key: 'usuarios', label: 'Usuários e permissões' },
  { key: 'config', label: 'Configurações gerais' },
];

export const PERMISSION_KEYS = PERMISSION_DEFINITIONS.map((item) => item.key);
export const ROLE_KEYS = ROLE_DEFINITIONS.map((item) => item.key);

export function permissionsFromRoles(roles) {
  const list = Array.isArray(roles) ? roles : [];
  if (list.includes('admin_geral')) return ['*'];
  const set = new Set();
  list.forEach((roleKey) => {
    const role = ROLE_DEFINITIONS.find((item) => item.key === roleKey);
    role?.permissions.forEach((permission) => set.add(permission));
  });
  return Array.from(set);
}

export function hasPermission(permissions, permission) {
  if (!permission) return true;
  if (!Array.isArray(permissions)) return false;
  return permissions.includes('*') || permissions.includes(permission);
}