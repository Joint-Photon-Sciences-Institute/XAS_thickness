import { ElementComposition } from '@/types';

interface MaterialDensity {
  name: string;
  density: number;
  isEstimate?: boolean;
}

const MATERIAL_DENSITIES: Record<string, MaterialDensity> = {
  // Common oxides
  'ZnO': { name: 'Zinc oxide', density: 5.61 },
  'Fe2O3': { name: 'Iron(III) oxide', density: 5.24 },
  'Fe3O4': { name: 'Magnetite', density: 5.17 },
  'FeO': { name: 'Iron(II) oxide', density: 5.95 },
  'CuO': { name: 'Copper(II) oxide', density: 6.31 },
  'Cu2O': { name: 'Copper(I) oxide', density: 6.0 },
  'TiO2': { name: 'Titanium dioxide', density: 4.23 },
  'Al2O3': { name: 'Aluminum oxide', density: 3.95 },
  'SiO2': { name: 'Silicon dioxide', density: 2.65 },
  'MgO': { name: 'Magnesium oxide', density: 3.58 },
  'CaO': { name: 'Calcium oxide', density: 3.34 },
  'NiO': { name: 'Nickel oxide', density: 6.67 },
  'CoO': { name: 'Cobalt oxide', density: 6.44 },
  'MnO': { name: 'Manganese oxide', density: 5.37 },
  'Cr2O3': { name: 'Chromium oxide', density: 5.22 },
  'V2O5': { name: 'Vanadium pentoxide', density: 3.36 },
  'WO3': { name: 'Tungsten trioxide', density: 7.16 },
  'MoO3': { name: 'Molybdenum trioxide', density: 4.69 },
  
  // Common sulfates
  'CuSO4': { name: 'Copper sulfate', density: 3.60 },
  'FeSO4': { name: 'Iron sulfate', density: 2.84 },
  'ZnSO4': { name: 'Zinc sulfate', density: 3.54 },
  'NiSO4': { name: 'Nickel sulfate', density: 3.68 },
  'CoSO4': { name: 'Cobalt sulfate', density: 3.71 },
  'MgSO4': { name: 'Magnesium sulfate', density: 2.66 },
  'CaSO4': { name: 'Calcium sulfate', density: 2.96 },
  
  // Hydrated compounds
  'CuSO4·5H2O': { name: 'Copper sulfate pentahydrate', density: 2.286 },
  'FeSO4·7H2O': { name: 'Iron sulfate heptahydrate', density: 1.898 },
  'ZnSO4·7H2O': { name: 'Zinc sulfate heptahydrate', density: 1.957 },
  'NiSO4·6H2O': { name: 'Nickel sulfate hexahydrate', density: 2.07 },
  'CoSO4·7H2O': { name: 'Cobalt sulfate heptahydrate', density: 1.948 },
  'MgSO4·7H2O': { name: 'Magnesium sulfate heptahydrate', density: 1.68 },
  
  // Other common compounds
  'Ca(OH)2': { name: 'Calcium hydroxide', density: 2.21 },
  'Mg(OH)2': { name: 'Magnesium hydroxide', density: 2.34 },
  'Al(OH)3': { name: 'Aluminum hydroxide', density: 2.42 },
  'Fe(OH)3': { name: 'Iron(III) hydroxide', density: 3.4 },
  'CaCO3': { name: 'Calcium carbonate', density: 2.71 },
  'MgCO3': { name: 'Magnesium carbonate', density: 2.96 },
  'FeCO3': { name: 'Iron carbonate', density: 3.96 },
  'ZnCO3': { name: 'Zinc carbonate', density: 4.45 },
  'CuCO3': { name: 'Copper carbonate', density: 4.0 },
  'NaCl': { name: 'Sodium chloride', density: 2.165 },
  'KCl': { name: 'Potassium chloride', density: 1.984 },
  'NH4Cl': { name: 'Ammonium chloride', density: 1.527 },
  
  // Mixed oxides
  'ZnFe2O4': { name: 'Zinc ferrite', density: 5.3 },
  'NiFe2O4': { name: 'Nickel ferrite', density: 5.38 },
  'CoFe2O4': { name: 'Cobalt ferrite', density: 5.29 },
  'MnFe2O4': { name: 'Manganese ferrite', density: 5.0 },
  'CuFe2O4': { name: 'Copper ferrite', density: 5.42 },
  'MgFe2O4': { name: 'Magnesium ferrite', density: 4.52 },
  'BaTiO3': { name: 'Barium titanate', density: 6.02 },
  'SrTiO3': { name: 'Strontium titanate', density: 5.11 },
  'PbTiO3': { name: 'Lead titanate', density: 7.83 },
  'LiNiO2': { name: 'Lithium nickel oxide', density: 4.84 },
  'LiCoO2': { name: 'Lithium cobalt oxide', density: 5.1 },
  'LiMn2O4': { name: 'Lithium manganese oxide', density: 4.28 },
};

const ELEMENT_DENSITIES: Record<string, number> = {
  'H': 0.00008988, 'He': 0.0001785, 'Li': 0.534, 'Be': 1.85, 'B': 2.37,
  'C': 2.267, 'N': 0.0012506, 'O': 0.001429, 'F': 0.001696, 'Ne': 0.0008999,
  'Na': 0.968, 'Mg': 1.738, 'Al': 2.698, 'Si': 2.329, 'P': 1.823,
  'S': 2.07, 'Cl': 0.003214, 'Ar': 0.0017837, 'K': 0.862, 'Ca': 1.55,
  'Sc': 2.985, 'Ti': 4.506, 'V': 6.11, 'Cr': 7.15, 'Mn': 7.21,
  'Fe': 7.874, 'Co': 8.90, 'Ni': 8.908, 'Cu': 8.96, 'Zn': 7.14,
  'Ga': 5.91, 'Ge': 5.323, 'As': 5.727, 'Se': 4.81, 'Br': 3.122,
  'Kr': 0.003733, 'Rb': 1.532, 'Sr': 2.64, 'Y': 4.472, 'Zr': 6.52,
  'Nb': 8.57, 'Mo': 10.28, 'Tc': 11.5, 'Ru': 12.37, 'Rh': 12.41,
  'Pd': 12.023, 'Ag': 10.49, 'Cd': 8.65, 'In': 7.31, 'Sn': 7.265,
  'Sb': 6.697, 'Te': 6.24, 'I': 4.933, 'Xe': 0.005887, 'Cs': 1.93,
  'Ba': 3.51, 'La': 6.162, 'Ce': 6.770, 'Pr': 6.77, 'Nd': 7.01,
  'Pm': 7.26, 'Sm': 7.52, 'Eu': 5.244, 'Gd': 7.90, 'Tb': 8.23,
  'Dy': 8.540, 'Ho': 8.79, 'Er': 9.066, 'Tm': 9.32, 'Yb': 6.90,
  'Lu': 9.84, 'Hf': 13.31, 'Ta': 16.69, 'W': 19.25, 'Re': 21.02,
  'Os': 22.59, 'Ir': 22.56, 'Pt': 21.45, 'Au': 19.32, 'Hg': 13.534,
  'Tl': 11.85, 'Pb': 11.34, 'Bi': 9.78, 'Po': 9.20, 'At': 7.0,
  'Rn': 0.00973, 'Fr': 1.87, 'Ra': 5.5, 'Ac': 10.0, 'Th': 11.7,
  'Pa': 15.37, 'U': 19.1, 'Np': 20.45, 'Pu': 19.85, 'Am': 13.67,
  'Cm': 13.51, 'Bk': 14.78, 'Cf': 15.1, 'Es': 8.84,
};

export function lookupDensity(formula: string, composition: ElementComposition): MaterialDensity {
  const normalizedFormula = formula.replace(/\s+/g, '');
  
  if (MATERIAL_DENSITIES[normalizedFormula]) {
    return MATERIAL_DENSITIES[normalizedFormula];
  }
  
  let totalWeight = 0;
  let weightedDensity = 0;
  let allElementsHaveDensity = true;
  
  for (const [element, count] of composition) {
    const atomicWeight = getAtomicWeight(element);
    const elementDensity = ELEMENT_DENSITIES[element];
    
    if (!elementDensity) {
      allElementsHaveDensity = false;
      break;
    }
    
    const weight = atomicWeight * count;
    totalWeight += weight;
    weightedDensity += weight * elementDensity;
  }
  
  if (allElementsHaveDensity && totalWeight > 0) {
    const estimatedDensity = weightedDensity / totalWeight;
    return {
      name: `${formula} (estimated)`,
      density: Math.round(estimatedDensity * 1000) / 1000,
      isEstimate: true
    };
  }
  
  return {
    name: formula,
    density: 3.0,
    isEstimate: true
  };
}

function getAtomicWeight(element: string): number {
  const atomicWeights: Record<string, number> = {
    'H': 1.008, 'He': 4.003, 'Li': 6.94, 'Be': 9.012, 'B': 10.81,
    'C': 12.01, 'N': 14.01, 'O': 16.00, 'F': 19.00, 'Ne': 20.18,
    'Na': 22.99, 'Mg': 24.31, 'Al': 26.98, 'Si': 28.09, 'P': 30.97,
    'S': 32.06, 'Cl': 35.45, 'Ar': 39.95, 'K': 39.10, 'Ca': 40.08,
    'Sc': 44.96, 'Ti': 47.87, 'V': 50.94, 'Cr': 52.00, 'Mn': 54.94,
    'Fe': 55.85, 'Co': 58.93, 'Ni': 58.69, 'Cu': 63.55, 'Zn': 65.38,
    'Ga': 69.72, 'Ge': 72.63, 'As': 74.92, 'Se': 78.97, 'Br': 79.90,
    'Kr': 83.80, 'Rb': 85.47, 'Sr': 87.62, 'Y': 88.91, 'Zr': 91.22,
    'Nb': 92.91, 'Mo': 95.95, 'Tc': 98.00, 'Ru': 101.1, 'Rh': 102.9,
    'Pd': 106.4, 'Ag': 107.9, 'Cd': 112.4, 'In': 114.8, 'Sn': 118.7,
    'Sb': 121.8, 'Te': 127.6, 'I': 126.9, 'Xe': 131.3, 'Cs': 132.9,
    'Ba': 137.3, 'La': 138.9, 'Ce': 140.1, 'Pr': 140.9, 'Nd': 144.2,
    'Pm': 145.0, 'Sm': 150.4, 'Eu': 152.0, 'Gd': 157.3, 'Tb': 158.9,
    'Dy': 162.5, 'Ho': 164.9, 'Er': 167.3, 'Tm': 168.9, 'Yb': 173.0,
    'Lu': 175.0, 'Hf': 178.5, 'Ta': 180.9, 'W': 183.8, 'Re': 186.2,
    'Os': 190.2, 'Ir': 192.2, 'Pt': 195.1, 'Au': 197.0, 'Hg': 200.6,
    'Tl': 204.4, 'Pb': 207.2, 'Bi': 209.0, 'Po': 209.0, 'At': 210.0,
    'Rn': 222.0, 'Fr': 223.0, 'Ra': 226.0, 'Ac': 227.0, 'Th': 232.0,
    'Pa': 231.0, 'U': 238.0, 'Np': 237.0, 'Pu': 244.0, 'Am': 243.0,
    'Cm': 247.0, 'Bk': 247.0, 'Cf': 251.0, 'Es': 252.0,
  };
  
  return atomicWeights[element] || 1.0;
}