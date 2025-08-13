export interface ParsedEdge {
  element: string;
  shell: string;
  atomicNumber: number;
  shellConstant: number;
}

export class EdgeParserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EdgeParserError';
  }
}

const ELEMENT_TO_Z: Record<string, number> = {
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

const SHELL_TO_CONSTANT: Record<string, number> = {
  'K': 0,    // K_SHELL
  'L1': 1,   // L1_SHELL
  'L2': 2,   // L2_SHELL
  'L3': 3,   // L3_SHELL
  'M1': 4,   // M1_SHELL
  'M2': 5,   // M2_SHELL
  'M3': 6,   // M3_SHELL
  'M4': 7,   // M4_SHELL
  'M5': 8,   // M5_SHELL
  'N1': 9,   // N1_SHELL
  'N2': 10,  // N2_SHELL
  'N3': 11,  // N3_SHELL
  'N4': 12,  // N4_SHELL
  'N5': 13,  // N5_SHELL
  'N6': 14,  // N6_SHELL
  'N7': 15,  // N7_SHELL
};

export function parseEdgeLabels(edgeString: string): ParsedEdge[] {
  if (!edgeString || edgeString.trim() === '') {
    throw new EdgeParserError('Edge string cannot be empty');
  }

  const edges = edgeString.split(',').map(e => e.trim()).filter(e => e);
  const parsedEdges: ParsedEdge[] = [];

  for (const edge of edges) {
    const parts = edge.split(/\s+/);
    
    if (parts.length !== 2) {
      throw new EdgeParserError(`Invalid edge format: "${edge}". Expected format: "Element Shell" (e.g., "Fe K", "Cu L3")`);
    }

    const [element, shell] = parts;
    
    const atomicNumber = ELEMENT_TO_Z[element];
    if (!atomicNumber) {
      throw new EdgeParserError(`Unknown element symbol: "${element}"`);
    }

    const shellConstant = SHELL_TO_CONSTANT[shell];
    if (shellConstant === undefined) {
      throw new EdgeParserError(`Unknown shell designation: "${shell}". Valid shells: ${Object.keys(SHELL_TO_CONSTANT).join(', ')}`);
    }

    parsedEdges.push({
      element,
      shell,
      atomicNumber,
      shellConstant
    });
  }

  return parsedEdges;
}