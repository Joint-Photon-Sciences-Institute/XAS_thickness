import { 
  DiluteSampleFormData, 
  DiluteSampleResult, 
  ElementComposition,
  EdgeData 
} from '@/types';
import { parseChemicalFormula } from './formula-parser';
import { parseEdgeLabels } from './edge-parser';
import { xraylibService } from './xraylib-service';
import { CONTAINER_MATERIALS } from './container-materials';

const TARGET_MU_T = {
  Transmission: 1.5,
  Fluorescence: 0.5,
};

export async function calculateDiluteSample(
  formData: DiluteSampleFormData
): Promise<DiluteSampleResult> {
  await xraylibService.load();
  
  const sampleComposition = parseChemicalFormula(formData.formula);
  const dilutantComposition = parseChemicalFormula(formData.dilutantFormula);
  const parsedEdges = parseEdgeLabels(formData.edges);
  
  const sampleDensity = parseFloat(formData.density);
  const dilutantDensity = parseFloat(formData.dilutantDensity);
  
  const sampleMolecularWeight = await calculateMolecularWeight(sampleComposition);
  const dilutantMolecularWeight = await calculateMolecularWeight(dilutantComposition);
  
  const targetMuT = TARGET_MU_T[formData.mode];
  
  const sampleVolume = calculateSampleVolume(formData.geometry, formData.dimensions);
  
  const effectiveVolume = sampleVolume * formData.packingFactor;
  
  const edges: EdgeData[] = [];
  let optimalDilutionRatio = 0;
  
  for (const edge of parsedEdges) {
    const edgeEnergy = await xraylibService.EdgeEnergy(edge.atomicNumber, edge.shellConstant);
    const energyAboveEdge = edgeEnergy + 0.050;
    
    const sampleMassFractions = await calculateMassFractions(sampleComposition, sampleMolecularWeight);
    const dilutantMassFractions = await calculateMassFractions(dilutantComposition, dilutantMolecularWeight);
    
    let sampleMassAtt = 0;
    for (const [element, fraction] of sampleMassFractions) {
      const Z = getAtomicNumber(element);
      const elementMassAtt = await xraylibService.CS_Total(Z, energyAboveEdge);
      sampleMassAtt += elementMassAtt * fraction;
    }
    
    let dilutantMassAtt = 0;
    for (const [element, fraction] of dilutantMassFractions) {
      const Z = getAtomicNumber(element);
      const elementMassAtt = await xraylibService.CS_Total(Z, energyAboveEdge);
      dilutantMassAtt += elementMassAtt * fraction;
    }
    
    const pathLength = calculatePathLength(formData.geometry, formData.dimensions);
    
    const containerContribution = await calculateContainerAbsorption(
      formData.containerMaterial,
      formData.containerWallThickness || 0,
      energyAboveEdge
    );
    
    const adjustedTargetMuT = targetMuT - containerContribution;
    
    const requiredLinearAtt = adjustedTargetMuT / pathLength;
    
    const dilutionRatio = calculateOptimalDilution(
      sampleMassAtt,
      dilutantMassAtt,
      sampleDensity,
      dilutantDensity,
      requiredLinearAtt,
      formData.packingFactor
    );
    
    if (dilutionRatio > optimalDilutionRatio) {
      optimalDilutionRatio = dilutionRatio;
    }
    
    const effectiveMassAtt = (sampleMassAtt * dilutionRatio + dilutantMassAtt * (1 - dilutionRatio));
    const effectiveDensity = (sampleDensity * dilutionRatio + dilutantDensity * (1 - dilutionRatio)) * formData.packingFactor;
    const linearAtt = effectiveMassAtt * effectiveDensity;
    const muT = linearAtt * pathLength;
    
    edges.push({
      element: edge.element,
      shell: edge.shell,
      atomicNumber: edge.atomicNumber,
      shellConstant: edge.shellConstant,
      energy: edgeEnergy,
      massAttenuation: effectiveMassAtt,
      linearAttenuation: linearAtt,
      thickness: pathLength * 10000,
      muT
    });
  }
  
  const massFractionSample = optimalDilutionRatio;
  const massFractionDilutant = 1 - optimalDilutionRatio;
  
  const effectiveDensity = (sampleDensity * massFractionSample + dilutantDensity * massFractionDilutant) * formData.packingFactor;
  
  const totalMass = effectiveVolume * effectiveDensity;
  const sampleMass = totalMass * massFractionSample;
  const dilutantMass = totalMass * massFractionDilutant;
  
  const pathLength = calculatePathLength(formData.geometry, formData.dimensions);
  
  const preparationInstructions = generatePreparationInstructions(
    formData,
    sampleMass,
    dilutantMass,
    optimalDilutionRatio
  );
  
  const report = generateReport({
    mode: formData.mode,
    formula: formData.formula,
    density: sampleDensity,
    molecularWeight: sampleMolecularWeight,
    edges,
    recommendedThickness: pathLength * 10000,
    report: '',
    sampleMass,
    dilutantMass,
    totalMass,
    dilutionRatio: optimalDilutionRatio,
    effectiveDensity,
    sampleVolume,
    preparationInstructions
  }, formData);
  
  return {
    mode: formData.mode,
    formula: formData.formula,
    density: sampleDensity,
    molecularWeight: sampleMolecularWeight,
    edges,
    recommendedThickness: pathLength * 10000,
    report,
    sampleMass,
    dilutantMass,
    totalMass,
    dilutionRatio: optimalDilutionRatio,
    effectiveDensity,
    sampleVolume,
    preparationInstructions
  };
}

function calculateSampleVolume(geometry: string, dimensions: any): number {
  if (geometry === 'Pellet') {
    const radius = (dimensions.diameter || 10) / 2 / 10;
    const thickness = (dimensions.thickness || 1) / 10;
    return Math.PI * radius * radius * thickness;
  } else if (geometry === 'Capillary') {
    const radius = (dimensions.innerDiameter || 1) / 2 / 10;
    const length = (dimensions.length || 10) / 10;
    return Math.PI * radius * radius * length;
  }
  return 1;
}

function calculatePathLength(geometry: string, dimensions: any): number {
  if (geometry === 'Pellet') {
    return (dimensions.thickness || 1) / 10;
  } else if (geometry === 'Capillary') {
    return (dimensions.innerDiameter || 1) / 10;
  }
  return 0.1;
}

function calculateOptimalDilution(
  sampleMassAtt: number,
  dilutantMassAtt: number,
  sampleDensity: number,
  dilutantDensity: number,
  requiredLinearAtt: number,
  packingFactor: number
): number {
  const A = (sampleMassAtt * sampleDensity - dilutantMassAtt * dilutantDensity) * packingFactor;
  const B = dilutantMassAtt * dilutantDensity * packingFactor;
  const C = requiredLinearAtt;
  
  if (Math.abs(A) < 1e-10) {
    return 0.5;
  }
  
  const dilutionRatio = (C - B) / A;
  
  return Math.max(0.001, Math.min(0.999, dilutionRatio));
}

async function calculateContainerAbsorption(
  material: string,
  wallThickness: number,
  energy: number
): Promise<number> {
  if (material === 'None' || wallThickness <= 0) {
    return 0;
  }
  
  const containerData = CONTAINER_MATERIALS[material as keyof typeof CONTAINER_MATERIALS];
  if (!containerData) return 0;
  
  const composition = parseChemicalFormula(containerData.formula);
  const molecularWeight = await calculateMolecularWeight(composition);
  const massFractions = await calculateMassFractions(composition, molecularWeight);
  
  let totalMassAtt = 0;
  for (const [element, fraction] of massFractions) {
    const Z = getAtomicNumber(element);
    const elementMassAtt = await xraylibService.CS_Total(Z, energy);
    totalMassAtt += elementMassAtt * fraction;
  }
  
  const linearAtt = totalMassAtt * containerData.density;
  
  return linearAtt * wallThickness * 2 / 10;
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

function generatePreparationInstructions(
  formData: DiluteSampleFormData,
  sampleMass: number,
  dilutantMass: number,
  dilutionRatio: number
): string {
  const geometryName = formData.geometry === 'Pellet' ? 'pellet' : 'capillary';
  const totalMass = sampleMass + dilutantMass;
  
  let instructions = `## Sample Preparation Instructions

### Required Materials:
- **Sample (${formData.formula})**: ${(sampleMass * 1000).toFixed(2)} mg
- **Dilutant (${formData.dilutantFormula})**: ${(dilutantMass * 1000).toFixed(2)} mg
- **Total mixture mass**: ${(totalMass * 1000).toFixed(2)} mg

### Dilution Ratio:
- Sample: ${(dilutionRatio * 100).toFixed(1)}%
- Dilutant: ${((1 - dilutionRatio) * 100).toFixed(1)}%

### Mixing Procedure:
1. Weigh out the exact masses of sample and dilutant
2. Grind both materials to a fine powder (< 10 μm particle size recommended)
3. Mix thoroughly in a mortar and pestle or ball mill for at least 10 minutes
4. Ensure homogeneous mixing - no visible clumps or color variations

### ${geometryName === 'pellet' ? 'Pellet' : 'Capillary'} Preparation:
`;

  if (geometryName === 'pellet') {
    instructions += `1. Transfer the mixed powder to a ${formData.dimensions.diameter} mm diameter die
2. Apply pressure gradually to achieve packing factor of ${(formData.packingFactor * 100).toFixed(0)}%
3. Press to final thickness of ${formData.dimensions.thickness} mm
4. Carefully remove pellet from die`;
  } else {
    instructions += `1. Load the mixed powder into a ${formData.dimensions.innerDiameter} mm ID capillary
2. Tap gently to achieve packing factor of ${(formData.packingFactor * 100).toFixed(0)}%
3. Fill to a length of ${formData.dimensions.length} mm
4. Seal both ends with appropriate material (wax, clay, or tape)`;
  }

  if (formData.containerMaterial !== 'None') {
    instructions += `

### Container Information:
- Material: ${formData.containerMaterial}
- Wall thickness: ${formData.containerWallThickness} mm`;
  }

  instructions += `

### Important Notes:
- Ensure all materials are dry before mixing
- Use appropriate safety equipment when handling powders
- Consider preparing slightly extra material (~10%) to account for losses
- Store prepared sample in a desiccator if not using immediately`;

  return instructions;
}

function generateReport(
  result: DiluteSampleResult,
  formData: DiluteSampleFormData
): string {
  const targetMuT = TARGET_MU_T[result.mode];
  
  let report = `# Dilute Sample Preparation Report

## Input Parameters
- **Mode:** ${result.mode}
- **Sample Formula:** ${result.formula}
- **Sample Density:** ${result.density.toFixed(3)} g/cm³
- **Dilutant Formula:** ${formData.dilutantFormula}
- **Dilutant Density:** ${formData.dilutantDensity} g/cm³
- **Geometry:** ${formData.geometry}
- **Packing Factor:** ${(formData.packingFactor * 100).toFixed(0)}%
- **Target μt:** ${targetMuT}

## Geometry Details
`;

  if (formData.geometry === 'Pellet') {
    report += `- **Diameter:** ${formData.dimensions.diameter} mm
- **Thickness:** ${formData.dimensions.thickness} mm`;
  } else {
    report += `- **Inner Diameter:** ${formData.dimensions.innerDiameter} mm
- **Length:** ${formData.dimensions.length} mm`;
  }

  report += `
- **Sample Volume:** ${(result.sampleVolume * 1000).toFixed(3)} cm³
- **Effective Volume (with packing):** ${(result.sampleVolume * formData.packingFactor * 1000).toFixed(3)} cm³

## Mass Calculations
- **Sample Mass:** ${(result.sampleMass * 1000).toFixed(2)} mg
- **Dilutant Mass:** ${(result.dilutantMass * 1000).toFixed(2)} mg
- **Total Mass:** ${(result.totalMass * 1000).toFixed(2)} mg
- **Dilution Ratio:** ${(result.dilutionRatio * 100).toFixed(1)}% sample / ${((1 - result.dilutionRatio) * 100).toFixed(1)}% dilutant
- **Effective Density:** ${result.effectiveDensity.toFixed(3)} g/cm³

## Edge Calculations`;

  for (const edge of result.edges) {
    report += `
### ${edge.element} ${edge.shell} Edge
- **Edge Energy:** ${edge.energy.toFixed(3)} keV
- **Effective Mass Attenuation:** ${edge.massAttenuation.toFixed(3)} cm²/g
- **Linear Attenuation:** ${edge.linearAttenuation.toFixed(3)} cm⁻¹
- **Path Length:** ${edge.thickness.toFixed(1)} μm
- **Resulting μt:** ${edge.muT.toFixed(3)}`;
  }

  if (formData.containerMaterial !== 'None') {
    report += `

## Container Contribution
- **Material:** ${formData.containerMaterial}
- **Wall Thickness:** ${formData.containerWallThickness} mm
- **Note:** Container absorption has been accounted for in the calculations`;
  }

  report += `

${result.preparationInstructions}

---
*Data source: xraylib - X-ray matter interaction cross sections for X-ray fluorescence applications*
`;

  return report;
}