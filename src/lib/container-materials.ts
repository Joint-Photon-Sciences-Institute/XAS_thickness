import { ContainerMaterial } from '@/types';

export interface ContainerMaterialData {
  name: string;
  formula: string;
  density: number;
  defaultWallThickness: number;
  description: string;
}

export const CONTAINER_MATERIALS: Record<ContainerMaterial, ContainerMaterialData | null> = {
  'None': null,
  'Kapton': {
    name: 'Kapton',
    formula: 'C22H10N2O5',
    density: 1.42,
    defaultWallThickness: 0.025,
    description: 'Polyimide film, commonly used for X-ray windows'
  },
  'Quartz': {
    name: 'Quartz',
    formula: 'SiO2',
    density: 2.65,
    defaultWallThickness: 0.5,
    description: 'Fused silica capillary'
  },
  'Polyimide': {
    name: 'Polyimide',
    formula: 'C22H10N2O5',
    density: 1.42,
    defaultWallThickness: 0.010,
    description: 'Thin polyimide tubing'
  }
};

export interface DilutantMaterial {
  name: string;
  formula: string;
  density: number;
  description: string;
}

export const COMMON_DILUTANTS: DilutantMaterial[] = [
  {
    name: 'Boron Nitride',
    formula: 'BN',
    density: 2.1,
    description: 'Low X-ray absorption, chemically inert'
  },
  {
    name: 'Cellulose',
    formula: 'C6H10O5',
    density: 1.5,
    description: 'Very low absorption, commonly available'
  },
  {
    name: 'Graphite',
    formula: 'C',
    density: 2.26,
    description: 'Low absorption, good for high energy edges'
  },
  {
    name: 'Polyethylene',
    formula: 'C2H4',
    density: 0.95,
    description: 'Minimal absorption, easy to handle'
  },
  {
    name: 'Lithium Carbonate',
    formula: 'Li2CO3',
    density: 2.11,
    description: 'Low absorption, useful for transition metals'
  },
  {
    name: 'Starch',
    formula: 'C6H10O5',
    density: 1.5,
    description: 'Similar to cellulose, widely available'
  },
  {
    name: 'Aluminum Oxide',
    formula: 'Al2O3',
    density: 3.95,
    description: 'Moderate absorption, chemically stable'
  }
];

export function getContainerAbsorption(
  material: ContainerMaterial
): number {
  const materialData = CONTAINER_MATERIALS[material];
  if (!materialData) return 0;
  
  return 0;
}