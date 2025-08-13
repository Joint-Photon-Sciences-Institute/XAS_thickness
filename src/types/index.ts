export type CalculationMode = 'Transmission' | 'Fluorescence';

export interface FormData {
  mode: CalculationMode;
  formula: string;
  edges: string;
  density: string;
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

export interface XraylibService {
  EdgeEnergy: (Z: number, shell: number) => number | Promise<number>;
  CS_Total: (Z: number, energy: number) => number | Promise<number>;
  AtomicWeight: (Z: number) => number | Promise<number>;
  isLoaded: boolean;
  load: () => Promise<void>;
}