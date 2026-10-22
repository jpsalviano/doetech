/**
 * Converte data do formato DD/MM/AAAA para objeto Date
 */
export const parseDate = (dateStr: string): Date | null => {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  if (year < 1900 || year > 2100) return null;
  
  const date = new Date(year, month - 1, day);
  
  if (
    date.getDate() !== day ||
    date.getMonth() !== month - 1 ||
    date.getFullYear() !== year
  ) {
    return null;
  }
  
  return date;
};

/**
 * Verifica se a data é futura
 */
export const isFutureDate = (dateStr: string): boolean => {
  const date = parseDate(dateStr);
  if (!date) return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return date > today;
};

/**
 * Calcula idade a partir de data no formato DD/MM/AAAA
 */
export const calculateAge = (dateStr: string): number | null => {
  const birthDate = parseDate(dateStr);
  if (!birthDate) return null;
  
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Verifica se a pessoa tem pelo menos 18 anos
 */
export const isAtLeast18YearsOld = (dateStr: string): boolean => {
  const age = calculateAge(dateStr);
  return age !== null && age >= 18;
};

/**
 * Valida data com regras personalizadas
 */
export const validateDate = (
  dateStr: string,
  options: {
    allowFuture?: boolean;
    minAge?: number;
  } = {}
): { valid: boolean; error?: string } => {
  const { allowFuture = false, minAge } = options;
  
  // Verifica se a data está completa
  if (dateStr.length !== 10) {
    return { valid: false, error: 'Data incompleta' };
  }
  
  // Converte a data
  const date = parseDate(dateStr);
  if (!date) {
    return { valid: false, error: 'Data inválida' };
  }
  
  // Verifica data futura
  if (!allowFuture && isFutureDate(dateStr)) {
    return { valid: false, error: 'Data não pode ser no futuro' };
  }
  
  // Verifica idade mínima
  if (minAge !== undefined) {
    const age = calculateAge(dateStr);
    if (age === null || age < minAge) {
      return { valid: false, error: `Idade mínima: ${minAge} anos` };
    }
  }
  
  return { valid: true };
};
