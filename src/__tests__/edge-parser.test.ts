import { parseEdgeLabels, EdgeParserError } from '@/lib/edge-parser';

describe('parseEdgeLabels', () => {
  it('should parse single edge correctly', () => {
    const result = parseEdgeLabels('Fe K');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      element: 'Fe',
      shell: 'K',
      atomicNumber: 26,
      shellConstant: 0
    });
  });

  it('should parse multiple edges correctly', () => {
    const result = parseEdgeLabels('Fe K, Cu L3, Zn K');
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({
      element: 'Fe',
      shell: 'K',
      atomicNumber: 26,
      shellConstant: 0
    });
    expect(result[1]).toEqual({
      element: 'Cu',
      shell: 'L3',
      atomicNumber: 29,
      shellConstant: 3
    });
    expect(result[2]).toEqual({
      element: 'Zn',
      shell: 'K',
      atomicNumber: 30,
      shellConstant: 0
    });
  });

  it('should handle various shell designations', () => {
    const edges = ['K', 'L1', 'L2', 'L3', 'M1', 'M2', 'M3', 'M4', 'M5'];
    edges.forEach((shell, index) => {
      const result = parseEdgeLabels(`Fe ${shell}`);
      expect(result[0].shell).toBe(shell);
      expect(result[0].shellConstant).toBe(index);
    });
  });

  it('should handle extra whitespace', () => {
    const result = parseEdgeLabels('  Fe   K  ,   Cu    L3  ');
    expect(result).toHaveLength(2);
    expect(result[0].element).toBe('Fe');
    expect(result[1].element).toBe('Cu');
  });

  it('should throw error for empty string', () => {
    expect(() => parseEdgeLabels('')).toThrow(EdgeParserError);
    expect(() => parseEdgeLabels('   ')).toThrow('Edge string cannot be empty');
  });

  it('should throw error for invalid format', () => {
    expect(() => parseEdgeLabels('FeK')).toThrow('Invalid edge format');
    expect(() => parseEdgeLabels('Fe')).toThrow('Invalid edge format');
    expect(() => parseEdgeLabels('K')).toThrow('Invalid edge format');
    expect(() => parseEdgeLabels('Fe K L3')).toThrow('Invalid edge format');
  });

  it('should throw error for unknown element', () => {
    expect(() => parseEdgeLabels('Xx K')).toThrow('Unknown element symbol: "Xx"');
    expect(() => parseEdgeLabels('Zz L3')).toThrow('Unknown element symbol: "Zz"');
  });

  it('should throw error for unknown shell', () => {
    expect(() => parseEdgeLabels('Fe X')).toThrow('Unknown shell designation: "X"');
    expect(() => parseEdgeLabels('Cu L4')).toThrow('Unknown shell designation: "L4"');
    expect(() => parseEdgeLabels('Zn K1')).toThrow('Unknown shell designation: "K1"');
  });

  it('should handle empty items in comma-separated list', () => {
    const result = parseEdgeLabels('Fe K,, Cu L3,');
    expect(result).toHaveLength(2);
    expect(result[0].element).toBe('Fe');
    expect(result[1].element).toBe('Cu');
  });

  it('should parse high atomic number elements', () => {
    const result = parseEdgeLabels('U L3, Pb M5');
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      element: 'U',
      shell: 'L3',
      atomicNumber: 92,
      shellConstant: 3
    });
    expect(result[1]).toEqual({
      element: 'Pb',
      shell: 'M5',
      atomicNumber: 82,
      shellConstant: 8
    });
  });

  it('should parse N shell edges', () => {
    const result = parseEdgeLabels('Au N1, Pt N7');
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      element: 'Au',
      shell: 'N1',
      atomicNumber: 79,
      shellConstant: 9
    });
    expect(result[1]).toEqual({
      element: 'Pt',
      shell: 'N7',
      atomicNumber: 78,
      shellConstant: 15
    });
  });
});