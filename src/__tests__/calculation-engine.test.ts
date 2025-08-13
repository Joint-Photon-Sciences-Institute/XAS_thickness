import { calculateThickness } from '@/lib/calculation-engine';

// Mock the xraylib service
jest.mock('@/lib/xraylib-service', () => ({
  xraylibService: {
    isLoaded: true,
    load: jest.fn().mockResolvedValue(undefined),
    EdgeEnergy: jest.fn((Z: number, shell: number) => {
      const edgeEnergies: Record<string, number> = {
        '26_0': 7.112,  // Fe K
        '29_0': 8.979,  // Cu K
        '30_0': 9.659,  // Zn K
        '28_0': 8.333,  // Ni K
        '29_3': 0.932,  // Cu L3
      };
      return edgeEnergies[`${Z}_${shell}`] || 1.0;
    }),
    CS_Total: jest.fn((Z: number, energy: number) => {
      // Mock implementation that accounts for energy being 50 eV above edge
      return 100 * Math.exp(-0.1 * energy) / Z;
    }),
    AtomicWeight: jest.fn((Z: number) => {
      const weights: Record<number, number> = {
        1: 1.008, 8: 16.00, 16: 32.06, 26: 55.85, 
        28: 58.69, 29: 63.55, 30: 65.38,
      };
      return weights[Z] || 1.0;
    }),
  },
}));

describe('calculateThickness', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should calculate thickness for ZnFe2O4 in transmission mode', async () => {
    const result = await calculateThickness(
      'Transmission',
      'ZnFe2O4',
      'Fe K, Zn K',
      5.3
    );

    expect(result.mode).toBe('Transmission');
    expect(result.formula).toBe('ZnFe2O4');
    expect(result.density).toBe(5.3);
    expect(result.edges).toHaveLength(2);
    
    // Check Fe K edge
    const feEdge = result.edges.find(e => e.element === 'Fe');
    expect(feEdge).toBeDefined();
    expect(feEdge!.shell).toBe('K');
    expect(feEdge!.energy).toBeCloseTo(7.112, 3);
    
    // Check Zn K edge
    const znEdge = result.edges.find(e => e.element === 'Zn');
    expect(znEdge).toBeDefined();
    expect(znEdge!.shell).toBe('K');
    expect(znEdge!.energy).toBeCloseTo(9.659, 3);
    
    // Check recommended thickness (should be ~18 μm within 5%)
    expect(result.recommendedThickness).toBeGreaterThan(17.1); // 18 * 0.95
    expect(result.recommendedThickness).toBeLessThan(18.9); // 18 * 1.05
    
    // Check that transmission mode uses maximum thickness
    const maxThickness = Math.max(...result.edges.map(e => e.thickness));
    expect(result.recommendedThickness).toBe(maxThickness);
  });

  it('should calculate thickness for CuSO4 in fluorescence mode', async () => {
    const result = await calculateThickness(
      'Fluorescence',
      'CuSO4',
      'Cu K',
      3.6
    );

    expect(result.mode).toBe('Fluorescence');
    expect(result.formula).toBe('CuSO4');
    expect(result.density).toBe(3.6);
    expect(result.edges).toHaveLength(1);
    
    const cuEdge = result.edges[0];
    expect(cuEdge.element).toBe('Cu');
    expect(cuEdge.shell).toBe('K');
    expect(cuEdge.energy).toBeCloseTo(8.979, 3);
    
    // For fluorescence mode, μt should be 0.5
    expect(cuEdge.muT).toBeCloseTo(0.5, 2);
    
    // Check that fluorescence mode uses minimum thickness
    expect(result.recommendedThickness).toBe(cuEdge.thickness);
  });

  it('should handle multiple edges correctly', async () => {
    const result = await calculateThickness(
      'Transmission',
      'NiFe2O4',
      'Fe K, Ni K',
      5.38
    );

    expect(result.edges).toHaveLength(2);
    
    const feEdge = result.edges.find(e => e.element === 'Fe');
    const niEdge = result.edges.find(e => e.element === 'Ni');
    
    expect(feEdge).toBeDefined();
    expect(niEdge).toBeDefined();
    
    // Both edges should have μt ≈ 1.5 for transmission mode
    expect(feEdge!.muT).toBeCloseTo(1.5, 2);
    expect(niEdge!.muT).toBeCloseTo(1.5, 2);
  });

  it('should calculate molecular weight correctly', async () => {
    const result = await calculateThickness(
      'Transmission',
      'Fe2O3',
      'Fe K',
      5.24
    );

    // Fe2O3 molecular weight: 2 * 55.85 + 3 * 16.00 = 159.7
    expect(result.molecularWeight).toBeCloseTo(159.7, 1);
  });

  it('should generate a comprehensive report', async () => {
    const result = await calculateThickness(
      'Transmission',
      'ZnO',
      'Zn K',
      5.61
    );

    expect(result.report).toContain('XAS Thickness Calculation Report');
    expect(result.report).toContain('Transmission');
    expect(result.report).toContain('ZnO');
    expect(result.report).toContain('5.610 g/cm³');
    expect(result.report).toContain('Target μt: 1.5');
    expect(result.report).toContain('Mass Fractions');
    expect(result.report).toContain('Zn K Edge');
    expect(result.report).toContain('Recommended Sample Thickness');
    expect(result.report).toContain('xraylib');
  });

  it('should throw error for invalid formula', async () => {
    await expect(
      calculateThickness('Transmission', 'InvalidFormula', 'Fe K', 5.0)
    ).rejects.toThrow('Invalid element symbol');
  });

  it('should throw error for invalid edge', async () => {
    await expect(
      calculateThickness('Transmission', 'Fe2O3', 'Fe X', 5.0)
    ).rejects.toThrow('Unknown shell designation');
  });

  it('should handle decimal stoichiometry correctly', async () => {
    const result = await calculateThickness(
      'Transmission',
      'Fe0.5Ni0.5O',
      'Fe K',
      6.0
    );

    expect(result.edges).toHaveLength(1);
    expect(result.edges[0].element).toBe('Fe');
    expect(result.edges[0].thickness).toBeGreaterThan(0);
  });

  it('should calculate mass fractions correctly', async () => {
    const result = await calculateThickness(
      'Transmission',
      'H2O',
      'O K',
      1.0
    );

    // Check that the report contains mass fractions
    expect(result.report).toMatch(/H\s*\|\s*0\.\d{4}/);
    expect(result.report).toMatch(/O\s*\|\s*0\.\d{4}/);
  });
});