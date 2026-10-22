/**
 * Aplica máscara de data no formato DD/MM/AAAA
 */
export const applyDateMask = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Apply mask progressively
  if (digits.length <= 2) {
    return digits;
  } else if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  } else {
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 8)}`;
  }
};

/**
 * Aplica máscara de CPF no formato XXX.XXX.XXX-XX
 */
export const applyCPFMask = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Apply mask progressively
  if (digits.length <= 3) {
    return digits;
  } else if (digits.length <= 6) {
    return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  } else if (digits.length <= 9) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  } else {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  }
};

/**
 * Aplica máscara de CNPJ no formato XX.XXX.XXX/XXXX-XX
 */
export const applyCNPJMask = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Apply mask progressively
  if (digits.length <= 2) {
    return digits;
  } else if (digits.length <= 5) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  } else if (digits.length <= 8) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  } else if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  } else {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12, 14)}`;
  }
};

/**
 * Remove máscara da string, mantendo apenas dígitos
 */
export const removeMask = (value: string): string => {
  return value.replace(/\D/g, '');
};
