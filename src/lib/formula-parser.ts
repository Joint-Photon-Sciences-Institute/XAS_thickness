import { ElementComposition } from '@/types';

export class FormulaParserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FormulaParserError';
  }
}

export function parseChemicalFormula(formula: string): ElementComposition {
  const composition = new Map<string, number>();
  
  if (!formula || formula.trim() === '') {
    throw new FormulaParserError('Formula cannot be empty');
  }

  const cleanFormula = formula.trim();
  
  const expandedFormula = expandParentheses(cleanFormula);
  
  const elementPattern = /([A-Z][a-z]?)(\d*\.?\d*)/g;
  let match;
  let hasValidElement = false;

  while ((match = elementPattern.exec(expandedFormula)) !== null) {
    const element = match[1];
    const countStr = match[2] || '1';
    const count = parseFloat(countStr);

    if (isNaN(count) || count <= 0) {
      throw new FormulaParserError(`Invalid count for element ${element}: ${countStr}`);
    }

    if (!isValidElement(element)) {
      throw new FormulaParserError(`Invalid element symbol: ${element}`);
    }

    hasValidElement = true;
    composition.set(element, (composition.get(element) || 0) + count);
  }

  if (!hasValidElement) {
    throw new FormulaParserError(`No valid elements found in formula: ${formula}`);
  }

  const leftoverChars = expandedFormula.replace(elementPattern, '');
  if (leftoverChars && !/^[\s·]*$/.test(leftoverChars)) {
    throw new FormulaParserError(`Invalid characters in formula: ${leftoverChars}`);
  }

  return composition;
}

function expandParentheses(formula: string): string {
  let expanded = formula;
  
  const hydrationPattern = /·(\d*\.?\d*)([A-Z][a-z]?\d*\.?\d*)+/g;
  expanded = expanded.replace(hydrationPattern, (match, multiplier, compound) => {
    const mult = multiplier || '1';
    return compound.replace(/([A-Z][a-z]?)(\d*\.?\d*)/g, (m: string, elem: string, count: string) => {
      const c = count || '1';
      const newCount = parseFloat(c) * parseFloat(mult);
      return elem + newCount;
    });
  });

  const parenPattern = /\(([^()]+)\)(\d*\.?\d*)/g;
  while (parenPattern.test(expanded)) {
    expanded = expanded.replace(parenPattern, (match, inner, multiplier) => {
      const mult = multiplier || '1';
      return inner.replace(/([A-Z][a-z]?)(\d*\.?\d*)/g, (m: string, elem: string, count: string) => {
        const c = count || '1';
        const newCount = parseFloat(c) * parseFloat(mult);
        return elem + newCount;
      });
    });
  }

  if (/[()]/.test(expanded)) {
    throw new FormulaParserError('Unbalanced parentheses in formula');
  }

  return expanded;
}

function isValidElement(symbol: string): boolean {
  const validElements = [
    'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne',
    'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca',
    'Sc', 'Ti', 'V', 'Cr', 'Mn', 'Fe', 'Co', 'Ni', 'Cu', 'Zn',
    'Ga', 'Ge', 'As', 'Se', 'Br', 'Kr', 'Rb', 'Sr', 'Y', 'Zr',
    'Nb', 'Mo', 'Tc', 'Ru', 'Rh', 'Pd', 'Ag', 'Cd', 'In', 'Sn',
    'Sb', 'Te', 'I', 'Xe', 'Cs', 'Ba', 'La', 'Ce', 'Pr', 'Nd',
    'Pm', 'Sm', 'Eu', 'Gd', 'Tb', 'Dy', 'Ho', 'Er', 'Tm', 'Yb',
    'Lu', 'Hf', 'Ta', 'W', 'Re', 'Os', 'Ir', 'Pt', 'Au', 'Hg',
    'Tl', 'Pb', 'Bi', 'Po', 'At', 'Rn', 'Fr', 'Ra', 'Ac', 'Th',
    'Pa', 'U', 'Np', 'Pu', 'Am', 'Cm', 'Bk', 'Cf', 'Es', 'Fm',
    'Md', 'No', 'Lr', 'Rf', 'Db', 'Sg', 'Bh', 'Hs', 'Mt', 'Ds',
    'Rg', 'Cn', 'Nh', 'Fl', 'Mc', 'Lv', 'Ts', 'Og'
  ];
  
  return validElements.includes(symbol);
}