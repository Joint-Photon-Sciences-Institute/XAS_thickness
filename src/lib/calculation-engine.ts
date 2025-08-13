import { CalculationMode, CalculationResult, ElementComposition, EdgeData } from '@/types';
import { parseChemicalFormula } from './formula-parser';
import { parseEdgeLabels, ParsedEdge } from './edge-parser';
import { xraylibService } from './xraylib-service';

const TARGET_MU_T = {
  Transmission: 1.5,
  Fluorescence: 0.5,
};

export async function calculateThickness(
  mode: CalculationMode,
  formula: string,
  edgeString: string,
  density: number
): Promise<CalculationResult> {
  await xraylibService.load();

  const composition = parseChemicalFormula(formula);
  const parsedEdges = parseEdgeLabels(edgeString);
  
  const molecularWeight = await calculateMolecularWeight(composition);
  const massFractions = await calculateMassFractions(composition, molecularWeight);
  
  const edges: EdgeData[] = [];
  
  for (const edge of parsedEdges) {
    const edgeData = await calculateEdgeData(edge, massFractions, density, mode);
    edges.push(edgeData);
  }
  
  const recommendedThickness = mode === 'Transmission' 
    ? Math.max(...edges.map(e => e.thickness))
    : Math.min(...edges.map(e => e.thickness));
  
  const report = generateReport({
    mode,
    formula,
    density,
    molecularWeight,
    edges,
    recommendedThickness,
    report: ''
  }, massFractions);
  
  return {
    mode,
    formula,
    density,
    molecularWeight,
    edges,
    recommendedThickness,
    report
  };
}

async function calculateMolecularWeight(composition: ElementComposition): Promise<number> {
  let weight = 0;
  for (const [element, count] of composition) {
    const Z = getAtomicNumber(element);
    const atomicWeight = await xraylibService.AtomicWeight(Z);
    weight += atomicWeight * count;
  }
  return weight;
}

async function calculateMassFractions(
  composition: ElementComposition,
  molecularWeight: number
): Promise<Map<string, number>> {
  const fractions = new Map<string, number>();
  
  for (const [element, count] of composition) {
    const Z = getAtomicNumber(element);
    const atomicWeight = await xraylibService.AtomicWeight(Z);
    const elementWeight = atomicWeight * count;
    fractions.set(element, elementWeight / molecularWeight);
  }
  
  return fractions;
}

async function calculateEdgeData(
  edge: ParsedEdge,
  massFractions: Map<string, number>,
  density: number,
  mode: CalculationMode
): Promise<EdgeData> {
  const edgeEnergy = await xraylibService.EdgeEnergy(edge.atomicNumber, edge.shellConstant);
  
  // Calculate cross-section at 50 eV (0.050 keV) above the edge energy
  // This is standard practice in XAS to avoid edge anomalies and get stable absorption
  const energyAboveEdge = edgeEnergy + 0.050;
  
  let totalMassAttenuation = 0;
  for (const [element, fraction] of massFractions) {
    const Z = getAtomicNumber(element);
    const elementMassAttenuation = await xraylibService.CS_Total(Z, energyAboveEdge);
    totalMassAttenuation += elementMassAttenuation * fraction;
  }
  
  const linearAttenuation = totalMassAttenuation * density;
  
  const targetMuT = TARGET_MU_T[mode];
  const thickness = targetMuT / linearAttenuation;
  
  const muT = linearAttenuation * thickness;
  
  return {
    element: edge.element,
    shell: edge.shell,
    atomicNumber: edge.atomicNumber,
    shellConstant: edge.shellConstant,
    energy: edgeEnergy,
    massAttenuation: totalMassAttenuation,
    linearAttenuation,
    thickness: thickness * 10000,
    muT
  };
}

function getAtomicNumber(element: string): number {
  const Z_TABLE: Record<string, number> = {
    'H': 1, 'He': 2, 'Li': 3, 'Be': 4, 'B': 5, 'C': 6, 'N': 7, 'O': 8, 'F': 9, 'Ne': 10,
    'Na': 11, 'Mg': 12, 'Al': 13, 'Si': 14, 'P': 15, 'S': 16, 'Cl': 17, 'Ar': 18, 'K': 19, 'Ca': 20,
    'Sc': 21, 'Ti': 22, 'V': 23, 'Cr': 24, 'Mn': 25, 'Fe': 26, 'Co': 27, 'Ni': 28, 'Cu': 29, 'Zn': 30,
    'Ga': 31, 'Ge': 32, 'As': 33, 'Se': 34, 'Br': 35, 'Kr': 36, 'Rb': 37, 'Sr': 38, 'Y': 39, 'Zr': 40,
    'Nb': 41, 'Mo': 42, 'Tc': 43, 'Ru': 44, 'Rh': 45, 'Pd': 46, 'Ag': 47, 'Cd': 48, 'In': 49, 'Sn': 50,
    'Sb': 51, 'Te': 52, 'I': 53, 'Xe': 54, 'Cs': 55, 'Ba': 56, 'La': 57, 'Ce': 58, 'Pr': 59, 'Nd': 60,
    'Pm': 61, 'Sm': 62, 'Eu': 63, 'Gd': 64, 'Tb': 65, 'Dy': 66, 'Ho': 67, 'Er': 68, 'Tm': 69, 'Yb': 70,
    'Lu': 71, 'Hf': 72, 'Ta': 73, 'W': 74, 'Re': 75, 'Os': 76, 'Ir': 77, 'Pt': 78, 'Au': 79, 'Hg': 80,
    'Tl': 81, 'Pb': 82, 'Bi': 83, 'Po': 84, 'At': 85, 'Rn': 86, 'Fr': 87, 'Ra': 88, 'Ac': 89, 'Th': 90,
    'Pa': 91, 'U': 92, 'Np': 93, 'Pu': 94, 'Am': 95, 'Cm': 96, 'Bk': 97, 'Cf': 98, 'Es': 99, 'Fm': 100,
  };
  return Z_TABLE[element] || 1;
}

function generateReport(
  result: CalculationResult,
  massFractions: Map<string, number>
): string {
  const targetMuT = TARGET_MU_T[result.mode];
  
  let report = `# XAS Thickness Calculation Report

## Input Parameters
- **Mode:** ${result.mode}
- **Chemical Formula:** ${result.formula}
- **Density:** ${result.density.toFixed(3)} g/cm³
- **Target μt:** ${targetMuT}
- **Molecular Weight:** ${result.molecularWeight.toFixed(3)} g/mol

## Mass Fractions
| Element | Mass Fraction |
|---------|---------------|
`;

  for (const [element, fraction] of massFractions) {
    report += `| ${element} | ${fraction.toFixed(4)} |\n`;
  }

  report += `\n## Edge Calculations`;

  for (const edge of result.edges) {
    report += `
### ${edge.element} ${edge.shell} Edge
- **Edge Energy:** ${edge.energy.toFixed(3)} keV
- **Mass Attenuation Coefficient (μ/ρ) at ${(edge.energy + 0.050).toFixed(3)} keV:** ${edge.massAttenuation.toFixed(3)} cm²/g
- **Linear Attenuation Coefficient (μ):** ${edge.linearAttenuation.toFixed(3)} cm⁻¹
- **Required Thickness:** ${edge.thickness.toFixed(1)} μm
- **Resulting μt:** ${edge.muT.toFixed(3)}
`;
  }

  report += `
## Recommendation
**Recommended Sample Thickness: ${result.recommendedThickness.toFixed(1)} μm**

This thickness is calculated as the ${result.mode === 'Transmission' ? 'maximum' : 'minimum'} of all edge thicknesses to ensure optimal signal for ${result.mode.toLowerCase()} mode measurements.

---
*Data source: xraylib - X-ray matter interaction cross sections for X-ray fluorescence applications*
`;

  return report;
}