export type CalculationMode = 'Transmission' | 'Fluorescence';
export type SampleType = 'ThinFilm' | 'DiluteSample';
export type GeometryType = 'Pellet' | 'Capillary';
export type ContainerMaterial = 'None' | 'Kapton' | 'Quartz' | 'Polyimide';

export interface FormData {
  mode: CalculationMode;
  formula: string;
  edges: string;
  density: string;
}

export interface DiluteSampleFormData extends FormData {
  sampleType: SampleType;
  dilutantFormula: string;
  dilutantDensity: string;
  geometry: GeometryType;
  dimensions: {
    diameter?: number;
    thickness?: number;
    innerDiameter?: number;
    length?: number;
  };
  containerMaterial: ContainerMaterial;
  containerWallThickness?: number;
  packingFactor: number;
}

export type ElementComposition = Map<string, number>;

export interface EdgeData {
  element: string;
  shell: string;
  atomicNumber: number;
  shellConstant: number;
  energy: number;
  massAttenuation: number;
  linearAttenuation: number;
  thickness: number;
  muT: number;
}

export interface CalculationResult {
  mode: CalculationMode;
  formula: string;
  density: number;
  molecularWeight: number;
  edges: EdgeData[];
  recommendedThickness: number;
  report: string;
}

export interface DiluteSampleResult extends CalculationResult {
  sampleMass: number;
  dilutantMass: number;
  totalMass: number;
  dilutionRatio: number;
  effectiveDensity: number;
  sampleVolume: number;
  preparationInstructions: string;
}

export interface XraylibService {
  EdgeEnergy: (Z: number, shell: number) => number | Promise<number>;
  CS_Total: (Z: number, energy: number) => number | Promise<number>;
  AtomicWeight: (Z: number) => number | Promise<number>;
  isLoaded: boolean;
  load: () => Promise<void>;
}