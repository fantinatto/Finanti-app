/**
 * CV MODEL - CENTRAL EXPORT
 * 
 * Importação centralizada de todos os recursos do modelo de CV
 */

// Types
export * from './cv.types';

// Helpers & Validators
export * from './cv-helpers';

// Template (para referência)
export { CV_DATA_TEMPLATE } from './cv-data-template';

/**
 * GUIA DE USO:
 * 
 * Importar tipos:
 * import { CvData, CvPosition, CvSkill } from '@/types';
 * 
 * Importar helpers:
 * import { formatMonthDate, validateCvData } from '@/types';
 * 
 * Importar template:
 * import { CV_DATA_TEMPLATE } from '@/types';
 */
