import { parseChemicalFormula, FormulaParserError } from '@/lib/formula-parser';

describe('parseChemicalFormula', () => {
  it('should parse simple compounds correctly', () => {
    const result = parseChemicalFormula('ZnFe2O4');
    expect(result.get('Zn')).toBe(1);
    expect(result.get('Fe')).toBe(2);
    expect(result.get('O')).toBe(4);
    expect(result.size).toBe(3);
  });

  it('should parse hydrated compounds correctly', () => {
    const result = parseChemicalFormula('CuSO4·5H2O');
    expect(result.get('Cu')).toBe(1);
    expect(result.get('S')).toBe(1);
    expect(result.get('O')).toBe(9); // 4 + 5
    expect(result.get('H')).toBe(10); // 5 * 2
    expect(result.size).toBe(4);
  });

  it('should parse compounds with parentheses correctly', () => {
    const result = parseChemicalFormula('Ca(OH)2');
    expect(result.get('Ca')).toBe(1);
    expect(result.get('O')).toBe(2);
    expect(result.get('H')).toBe(2);
    expect(result.size).toBe(3);
  });

  it('should parse compounds with decimal subscripts correctly', () => {
    const result = parseChemicalFormula('Fe0.5Ni0.5O');
    expect(result.get('Fe')).toBe(0.5);
    expect(result.get('Ni')).toBe(0.5);
    expect(result.get('O')).toBe(1);
    expect(result.size).toBe(3);
  });

  it('should parse complex nested parentheses', () => {
    const result = parseChemicalFormula('Mg3(PO4)2');
    expect(result.get('Mg')).toBe(3);
    expect(result.get('P')).toBe(2);
    expect(result.get('O')).toBe(8);
    expect(result.size).toBe(3);
  });

  it('should handle single elements', () => {
    const result = parseChemicalFormula('Fe');
    expect(result.get('Fe')).toBe(1);
    expect(result.size).toBe(1);
  });

  it('should handle elements with explicit 1', () => {
    const result = parseChemicalFormula('H2O1');
    expect(result.get('H')).toBe(2);
    expect(result.get('O')).toBe(1);
    expect(result.size).toBe(2);
  });

  it('should accumulate same elements', () => {
    const result = parseChemicalFormula('CaCO3');
    expect(result.get('Ca')).toBe(1);
    expect(result.get('C')).toBe(1);
    expect(result.get('O')).toBe(3);
    expect(result.size).toBe(3);
  });

  it('should throw error for empty formula', () => {
    expect(() => parseChemicalFormula('')).toThrow(FormulaParserError);
    expect(() => parseChemicalFormula('   ')).toThrow('Formula cannot be empty');
  });

  it('should throw error for invalid element symbols', () => {
    expect(() => parseChemicalFormula('Zz')).toThrow('Invalid element symbol: Zz');
    expect(() => parseChemicalFormula('X2O')).toThrow('Invalid element symbol: X');
  });

  it('should throw error for invalid characters', () => {
    expect(() => parseChemicalFormula('Fe2O3!')).toThrow('Invalid characters in formula: !');
    expect(() => parseChemicalFormula('Cu@SO4')).toThrow('Invalid characters in formula: @');
  });

  it('should throw error for unbalanced parentheses', () => {
    expect(() => parseChemicalFormula('Ca(OH')).toThrow('Unbalanced parentheses');
    expect(() => parseChemicalFormula('Ca)OH(2')).toThrow('Invalid characters in formula');
  });

  it('should throw error for invalid counts', () => {
    expect(() => parseChemicalFormula('Fe-2O3')).toThrow('Invalid characters in formula: -');
  });

  it('should parse more complex hydrated compounds', () => {
    const result = parseChemicalFormula('Al2(SO4)3·18H2O');
    expect(result.get('Al')).toBe(2);
    expect(result.get('S')).toBe(3);
    expect(result.get('O')).toBe(30); // 12 + 18
    expect(result.get('H')).toBe(36); // 18 * 2
    expect(result.size).toBe(4);
  });

  it('should handle mixed decimals and integers', () => {
    const result = parseChemicalFormula('Ca0.5Mg0.5CO3');
    expect(result.get('Ca')).toBe(0.5);
    expect(result.get('Mg')).toBe(0.5);
    expect(result.get('C')).toBe(1);
    expect(result.get('O')).toBe(3);
    expect(result.size).toBe(4);
  });
});