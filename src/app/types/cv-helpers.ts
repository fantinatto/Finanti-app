/**
 * CV DATA VALIDATORS & HELPERS
 * 
 * Funções auxiliares para validação e manipulação de dados de CV
 */

import { CvData, CvPosition, CvEducation, CvCertification } from './cv.types';

// ========================================
// VALIDATORS
// ========================================

/**
 * Valida se uma data está no formato YYYY-MM
 */
export function isValidMonthDate(date: string): boolean {
  if (!date) return false;
  const regex = /^\d{4}-\d{2}$/;
  if (!regex.test(date)) return false;
  
  const [year, month] = date.split('-').map(Number);
  return year >= 1900 && year <= 2100 && month >= 1 && month <= 12;
}

/**
 * Valida se uma data está no formato YYYY-MM-DD
 */
export function isValidFullDate(date: string): boolean {
  if (!date) return false;
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) return false;
  
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
}

/**
 * Valida estrutura mínima do CV
 */
export function validateCvData(data: CvData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Hero é obrigatório
  if (!data.hero) {
    errors.push('Campo "hero" é obrigatório');
  } else {
    if (!data.hero.name) errors.push('hero.name é obrigatório');
    if (!data.hero.headline) errors.push('hero.headline é obrigatório');
  }

  // Valida datas em positions
  if (data.positions) {
    data.positions.forEach((pos, idx) => {
      if (pos.startDate && !isValidMonthDate(pos.startDate)) {
        errors.push(`positions[${idx}].startDate formato inválido (use YYYY-MM)`);
      }
      if (pos.endDate && !isValidMonthDate(pos.endDate)) {
        errors.push(`positions[${idx}].endDate formato inválido (use YYYY-MM)`);
      }
    });
  }

  // Valida datas em education
  if (data.education) {
    data.education.forEach((edu, idx) => {
      if (edu.startDate && !isValidMonthDate(edu.startDate)) {
        errors.push(`education[${idx}].startDate formato inválido (use YYYY-MM)`);
      }
      if (edu.endDate && !isValidMonthDate(edu.endDate)) {
        errors.push(`education[${idx}].endDate formato inválido (use YYYY-MM)`);
      }
    });
  }

  // Valida email
  if (data.contact?.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.contact.email)) {
      errors.push('contact.email formato inválido');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// ========================================
// DATE FORMATTERS
// ========================================

/**
 * Formata data YYYY-MM para formato legível
 * @example '2024-03' => 'Mar 2024'
 */
export function formatMonthDate(date: string, locale: 'pt' | 'en' = 'pt'): string {
  if (!date || !isValidMonthDate(date)) return date;

  const [year, month] = date.split('-');
  const monthIndex = parseInt(month, 10) - 1;

  const monthsPt = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const months = locale === 'pt' ? monthsPt : monthsEn;
  return `${months[monthIndex]} ${year}`;
}

/**
 * Formata período de datas
 * @example ('2020-01', '2023-12') => 'Jan 2020 - Dez 2023'
 * @example ('2020-01', null) => 'Jan 2020 - Atual'
 */
export function formatDateRange(
  startDate: string,
  endDate?: string,
  locale: 'pt' | 'en' = 'pt'
): string {
  const start = formatMonthDate(startDate, locale);
  const end = endDate ? formatMonthDate(endDate, locale) : (locale === 'pt' ? 'Atual' : 'Present');
  return `${start} - ${end}`;
}

/**
 * Calcula duração entre datas em meses
 */
export function calculateDurationInMonths(startDate: string, endDate?: string): number {
  if (!isValidMonthDate(startDate)) return 0;

  const [startYear, startMonth] = startDate.split('-').map(Number);
  
  let endYear: number, endMonth: number;
  if (endDate && isValidMonthDate(endDate)) {
    [endYear, endMonth] = endDate.split('-').map(Number);
  } else {
    const now = new Date();
    endYear = now.getFullYear();
    endMonth = now.getMonth() + 1;
  }

  return (endYear - startYear) * 12 + (endMonth - startMonth) + 1;
}

/**
 * Formata duração em texto legível
 * @example 14 => '1 ano e 2 meses'
 */
export function formatDuration(months: number, locale: 'pt' | 'en' = 'pt'): string {
  if (months < 1) return locale === 'pt' ? 'Menos de 1 mês' : 'Less than 1 month';

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (locale === 'pt') {
    let result = '';
    if (years > 0) result += `${years} ${years === 1 ? 'ano' : 'anos'}`;
    if (years > 0 && remainingMonths > 0) result += ' e ';
    if (remainingMonths > 0) result += `${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}`;
    return result;
  } else {
    let result = '';
    if (years > 0) result += `${years} ${years === 1 ? 'year' : 'years'}`;
    if (years > 0 && remainingMonths > 0) result += ' and ';
    if (remainingMonths > 0) result += `${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;
    return result;
  }
}

// ========================================
// DATA CALCULATORS
// ========================================

/**
 * Calcula anos totais de experiência profissional
 */
export function calculateTotalExperience(positions: CvPosition[]): number {
  let totalMonths = 0;

  positions.forEach(pos => {
    const months = calculateDurationInMonths(pos.startDate, pos.endDate);
    totalMonths += months;
  });

  return Math.floor(totalMonths / 12);
}

/**
 * Agrupa skills por categoria e conta endorsements
 */
export function getTopSkills(data: CvData, limit: number = 10) {
  if (!data.skills) return [];

  return [...data.skills]
    .sort((a, b) => (b.endorsements || 0) - (a.endorsements || 0))
    .slice(0, limit);
}

/**
 * Lista todas as tecnologias mencionadas em positions
 */
export function getAllTechnologies(positions: CvPosition[]): string[] {
  const techSet = new Set<string>();

  positions.forEach(pos => {
    pos.skills?.forEach(skill => techSet.add(skill));
  });

  return Array.from(techSet).sort();
}

// ========================================
// DATA EXTRACTORS
// ========================================

/**
 * Extrai cargo mais recente
 */
export function getCurrentPosition(data: CvData): CvPosition | null {
  if (!data.positions || data.positions.length === 0) return null;

  // Procura por posição sem endDate
  const current = data.positions.find(pos => !pos.endDate);
  if (current) return current;

  // Caso não haja, retorna a mais recente
  return data.positions.reduce((latest, pos) => {
    if (!latest.startDate) return pos;
    if (!pos.startDate) return latest;
    return pos.startDate > latest.startDate ? pos : latest;
  });
}

/**
 * Extrai formação mais alta
 */
export function getHighestEducation(data: CvData): CvEducation | null {
  if (!data.education || data.education.length === 0) return null;

  const degreeRank: Record<string, number> = {
    'Doutorado': 5,
    'Mestrado': 4,
    'Pós-graduação': 3,
    'Bacharelado': 2,
    'Técnico': 1
  };

  return data.education.reduce((highest, edu) => {
    const currentRank = degreeRank[edu.degree] || 0;
    const highestRank = degreeRank[highest.degree] || 0;
    return currentRank > highestRank ? edu : highest;
  });
}

/**
 * Conta certificações ativas (não expiradas)
 */
export function getActiveCertifications(data: CvData): CvCertification[] {
  if (!data.certifications) return [];

  const now = new Date();
  
  return data.certifications.filter(cert => {
    if (!cert.expirationDate) return true; // Sem expiração = sempre ativa
    
    const expDate = new Date(cert.expirationDate);
    return expDate > now;
  });
}

// ========================================
// SEO & METADATA HELPERS
// ========================================

/**
 * Gera meta description para SEO
 */
export function generateMetaDescription(data: CvData): string {
  const { hero, positions } = data;
  
  let description = hero?.headline || '';
  
  if (positions && positions.length > 0) {
    const currentPos = getCurrentPosition(data);
    if (currentPos) {
      description += ` | ${currentPos.title} @ ${currentPos.company}`;
    }
  }

  const years = positions ? calculateTotalExperience(positions) : 0;
  if (years > 0) {
    description += ` | ${years}+ anos de experiência`;
  }

  return description.slice(0, 160); // Limite do Google
}

/**
 * Gera array de keywords para SEO
 */
export function generateKeywords(data: CvData): string[] {
  const keywords = new Set<string>();

  // Nome
  if (data.hero?.name) {
    keywords.add(data.hero.name);
  }

  // Skills
  data.skills?.forEach(skill => keywords.add(skill.name));

  // Tecnologias das positions
  if (data.positions) {
    getAllTechnologies(data.positions).forEach(tech => keywords.add(tech));
  }

  // Empresas
  data.positions?.forEach(pos => keywords.add(pos.company));

  return Array.from(keywords).slice(0, 20); // Top 20
}

// ========================================
// EXPORT UTILITIES
// ========================================

/**
 * Prepara dados para exportação em JSON
 */
export function exportToJSON(data: CvData): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Valida e sanitiza dados antes de salvar
 */
export function sanitizeCvData(data: CvData): CvData {
  // Remove campos vazios/nulos
  const sanitized = JSON.parse(JSON.stringify(data, (key, value) => {
    if (value === null || value === undefined || value === '') return undefined;
    if (Array.isArray(value) && value.length === 0) return undefined;
    if (typeof value === 'object' && Object.keys(value).length === 0) return undefined;
    return value;
  }));

  return sanitized;
}
