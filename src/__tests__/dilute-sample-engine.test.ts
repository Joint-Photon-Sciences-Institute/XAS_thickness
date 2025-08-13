import { calculateDiluteSample } from '@/lib/dilute-sample-engine';
import { DiluteSampleFormData } from '@/types';

jest.mock('@/lib/xraylib-service', () => ({
  xraylibService: {
    load: jest.fn().mockResolvedValue(undefined),
    EdgeEnergy: jest.fn((Z: number, shell: number) => {
      if (Z === 26 && shell === 0) return Promise.resolve(7.112);
      if (Z === 30 && shell === 0) return Promise.resolve(9.659);
      return Promise.resolve(5.0);
    }),
    CS_Total: jest.fn((Z: number, energy: number) => {
      const mockValues: Record<string, number> = {
        '26_7.162': 330.0,
        '30_9.709': 250.0,
        '8_7.162': 10.0,
        '8_9.709': 8.0,
        '5_7.162': 1.5,
        '5_9.709': 1.2,
        '7_7.162': 5.0,
        '7_9.709': 4.0,
        '6_7.162': 3.0,
        '6_9.709': 2.5,
        '1_7.162': 0.5,
        '1_9.709': 0.4,
      };
      const key = `${Z}_${energy.toFixed(3)}`;
      return Promise.resolve(mockValues[key] || 5.0);
    }),
    AtomicWeight: jest.fn((Z: number) => {
      const weights: Record<number, number> = {
        1: 1.008, 5: 10.81, 6: 12.01, 7: 14.01, 8: 16.00,
        26: 55.85, 30: 65.38
      };
      return Promise.resolve(weights[Z] || 1.0);
    }),
    isLoaded: true
  }
}));

describe('calculateDiluteSample', () => {
  const baseFormData: DiluteSampleFormData = {
    sampleType: 'DiluteSample',
    mode: 'Transmission',
    formula: 'ZnFe2O4',
    edges: 'Fe K, Zn K',
    density: '5.3',
    dilutantFormula: 'BN',
    dilutantDensity: '2.1',
    geometry: 'Pellet',
    dimensions: {
      diameter: 10,
      thickness: 1,
      innerDiameter: undefined,
      length: undefined
    },
    containerMaterial: 'None',
    containerWallThickness: 0,
    packingFactor: 0.6
  };

  it('should calculate masses for pellet geometry', async () => {
    const result = await calculateDiluteSample(baseFormData);
    
    expect(result).toBeDefined();
    expect(result.sampleMass).toBeGreaterThan(0);
    expect(result.dilutantMass).toBeGreaterThan(0);
    expect(result.totalMass).toBeCloseTo(result.sampleMass + result.dilutantMass, 5);
    expect(result.dilutionRatio).toBeGreaterThan(0);
    expect(result.dilutionRatio).toBeLessThanOrEqual(1);
    expect(result.effectiveDensity).toBeGreaterThan(0);
    expect(result.sampleVolume).toBeGreaterThan(0);
  });

  it('should calculate masses for capillary geometry', async () => {
    const capillaryData: DiluteSampleFormData = {
      ...baseFormData,
      geometry: 'Capillary',
      dimensions: {
        diameter: undefined,
        thickness: undefined,
        innerDiameter: 1,
        length: 10
      }
    };
    
    const result = await calculateDiluteSample(capillaryData);
    
    expect(result).toBeDefined();
    expect(result.sampleMass).toBeGreaterThan(0);
    expect(result.dilutantMass).toBeGreaterThan(0);
    expect(result.totalMass).toBeCloseTo(result.sampleMass + result.dilutantMass, 5);
  });

  it('should handle different packing factors correctly', async () => {
    const loosePacking = await calculateDiluteSample({
      ...baseFormData,
      packingFactor: 0.3
    });
    
    const densePacking = await calculateDiluteSample({
      ...baseFormData,
      packingFactor: 0.9
    });
    
    expect(densePacking.totalMass).toBeGreaterThan(loosePacking.totalMass);
    expect(densePacking.effectiveDensity).toBeGreaterThan(loosePacking.effectiveDensity);
  });

  it('should adjust for container material absorption', async () => {
    const withContainer = await calculateDiluteSample({
      ...baseFormData,
      containerMaterial: 'Kapton',
      containerWallThickness: 0.025
    });
    
    expect(withContainer).toBeDefined();
    expect(withContainer.totalMass).toBeGreaterThan(0);
  });

  it('should handle fluorescence mode differently than transmission', async () => {
    const transmission = await calculateDiluteSample(baseFormData);
    
    const fluorescence = await calculateDiluteSample({
      ...baseFormData,
      mode: 'Fluorescence'
    });
    
    expect(fluorescence.dilutionRatio).not.toEqual(transmission.dilutionRatio);
  });

  it('should generate preparation instructions', async () => {
    const result = await calculateDiluteSample(baseFormData);
    
    expect(result.preparationInstructions).toBeDefined();
    expect(result.preparationInstructions).toContain('Sample Preparation Instructions');
    expect(result.preparationInstructions).toContain('Required Materials');
    expect(result.preparationInstructions).toContain('Mixing Procedure');
  });

  it('should generate detailed report', async () => {
    const result = await calculateDiluteSample(baseFormData);
    
    expect(result.report).toBeDefined();
    expect(result.report).toContain('Dilute Sample Preparation Report');
    expect(result.report).toContain('Input Parameters');
    expect(result.report).toContain('Mass Calculations');
    expect(result.report).toContain('Edge Calculations');
  });

  it('should handle different dilutants correctly', async () => {
    const withBN = await calculateDiluteSample(baseFormData);
    
    const withCellulose = await calculateDiluteSample({
      ...baseFormData,
      dilutantFormula: 'C6H10O5',
      dilutantDensity: '1.5'
    });
    
    expect(withCellulose.dilutantMass).not.toEqual(withBN.dilutantMass);
    expect(withCellulose.effectiveDensity).not.toEqual(withBN.effectiveDensity);
  });

  it('should calculate volume correctly for different geometries', async () => {
    const pelletResult = await calculateDiluteSample({
      ...baseFormData,
      geometry: 'Pellet',
      dimensions: { diameter: 10, thickness: 1 }
    });
    
    const expectedPelletVolume = Math.PI * 0.5 * 0.5 * 0.1;
    expect(pelletResult.sampleVolume).toBeCloseTo(expectedPelletVolume, 5);
    
    const capillaryResult = await calculateDiluteSample({
      ...baseFormData,
      geometry: 'Capillary',
      dimensions: { innerDiameter: 2, length: 20 }
    });
    
    const expectedCapillaryVolume = Math.PI * 0.1 * 0.1 * 2;
    expect(capillaryResult.sampleVolume).toBeCloseTo(expectedCapillaryVolume, 5);
  });

  it('should ensure dilution ratio is within valid range', async () => {
    const result = await calculateDiluteSample({
      ...baseFormData,
      formula: 'C',
      density: '2.26'
    });
    
    expect(result.dilutionRatio).toBeGreaterThanOrEqual(0.001);
    expect(result.dilutionRatio).toBeLessThanOrEqual(0.999);
  });
});