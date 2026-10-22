export const BRAZILIAN_STATES = [
  'Acre',
  'Alagoas',
  'Amapá',
  'Amazonas',
  'Bahia',
  'Ceará',
  'Distrito Federal',
  'Espírito Santo',
  'Goiás',
  'Maranhão',
  'Mato Grosso',
  'Mato Grosso do Sul',
  'Minas Gerais',
  'Pará',
  'Paraíba',
  'Paraná',
  'Pernambuco',
  'Piauí',
  'Rio de Janeiro',
  'Rio Grande do Norte',
  'Rio Grande do Sul',
  'Rondônia',
  'Roraima',
  'Santa Catarina',
  'São Paulo',
  'Sergipe',
  'Tocantins',
];

export const MONTHS = [
  { label: 'Janeiro', value: 1 },
  { label: 'Fevereiro', value: 2 },
  { label: 'Março', value: 3 },
  { label: 'Abril', value: 4 },
  { label: 'Maio', value: 5 },
  { label: 'Junho', value: 6 },
  { label: 'Julho', value: 7 },
  { label: 'Agosto', value: 8 },
  { label: 'Setembro', value: 9 },
  { label: 'Outubro', value: 10 },
  { label: 'Novembro', value: 11 },
  { label: 'Dezembro', value: 12 },
];

export const EQUIPMENT_TYPES = [
  { label: 'Notebooks', value: 'Notebook' },
  { label: 'Desktops', value: 'Desktop' },
  { label: 'Smartphones', value: 'SmartPhone' },
  { label: 'Tablets', value: 'Tablet' },
  { label: 'Periféricos', value: 'Peripherals' },
];

// Um equipamento só (título dos cards), no singular.
export const EQUIPMENT_TYPE_LABEL: Record<string, string> = {
  Notebook: 'Notebook',
  Desktop: 'Desktop',
  SmartPhone: 'Smartphone',
  Tablet: 'Tablet',
  Peripherals: 'Periférico',
};

export const DONATION_STATUS = {
  IN_PROGRESS: 'InProgress',
  CANCELED: 'Canceled',
  FINISHED: 'Finished',
  PENDING: 'Pending',
  APPROVED: 'Approved',
} as const;

export const DONATION_STATUS_LABELS = [
  { label: 'Em Progresso', value: 'InProgress' },
  { label: 'Cancelado', value: 'Canceled' },
  { label: 'Finalizado', value: 'Finished' },
  { label: 'Pendente', value: 'Pending' },
  { label: 'Aprovado', value: 'Approved' },
];

export const TIME_INTERVALS = [
  { label: '0-5 dias', min: 0, max: 5 },
  { label: '6-10 dias', min: 6, max: 10 },
  { label: '11-15 dias', min: 11, max: 15 },
  { label: '16-20 dias', min: 16, max: 20 },
  { label: '21-30 dias', min: 21, max: 30 },
  { label: '31+ dias', min: 31, max: Infinity },
];

export const DASHBOARD_TITLES = {
  EQUIPMENTS_REQUESTS: 'Equipamentos e solicitações',
  BENEFICIARIES: 'Beneficiários',
  DONATION_TIME: 'Tempo médio de doação',
} as const;
