# XAS Sample Calculator

A comprehensive web application for calculating optimal sample preparation parameters for X-ray Absorption Spectroscopy (XAS) measurements. Supports both thin film thickness calculations and dilute powder sample mass calculations. Built with React, TypeScript, and powered by the xraylib physics library.

![XAS Sample Calculator](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Features

### Core Capabilities
- **Two Calculator Modes**:
  - **Thin Film**: Calculate optimal thickness for films, foils, and solutions
  - **Dilute Sample**: Calculate masses for powder pellets and capillaries
- **Dual Measurement Modes**: Transmission (μt = 1.5) and Fluorescence (μt = 0.5)
- **Comprehensive Edge Support**: All X-ray absorption edges from K to N shells

### Thin Film Calculator
- Calculate optimal thickness in micrometers
- Support for pure and mixed compounds
- Automatic density lookup with override option
- Detailed calculation reports

### Dilute Sample Calculator (NEW)
- Calculate required masses of sample and dilutant
- Support for pellet and capillary geometries
- Container material absorption correction (Kapton, Quartz, Polyimide)
- Adjustable packing factor (30-95%) for powder compactness
- Common dilutants database (BN, Cellulose, Graphite, etc.)
- Step-by-step preparation instructions
- Warnings for impractical mass ranges

### Technical Features
- **Chemical Formula Parser**: Handles complex formulas including:
  - Simple compounds (e.g., `ZnFe2O4`)
  - Hydrated compounds (e.g., `CuSO4·5H2O`)
  - Parentheses (e.g., `Ca(OH)2`)
  - Decimal stoichiometry (e.g., `Fe0.5Ni0.5O`)
- **Automatic Density Lookup**: Built-in database of common material densities
- **Real-time Calculations**: Instant results using xraylib physics engine
- **Detailed Reports**: Complete calculation breakdown with all assumptions
- **Dark Mode Support**: Automatic theme adaptation
- **Responsive Design**: Works on desktop and mobile devices

## Installation

### Prerequisites

- Python 3.7+ with pip
- Node.js 18+ and npm 9+
- Modern web browser with ES2020 support

### Quick Start (≤5 minutes)

1. Clone the repository:
```bash
git clone https://github.com/yourusername/xas-thickness-calculator.git
cd xas-thickness-calculator
```

2. Install dependencies and start the application:

**Option 1 - Using npm (Recommended):**
```bash
npm install
npm start
```

**Option 2 - Using shell script (Mac/Linux):**
```bash
./start.sh
```

**Option 3 - Using batch file (Windows):**
```cmd
start.bat
```

**Option 4 - Using Python (Cross-platform):**
```bash
python start.py
```

3. The application will automatically:
   - Check and install missing dependencies
   - Start the xraylib API server on http://localhost:5001
   - Start the web application on http://localhost:5173
   - Open your browser to the web application

### Production Build

```bash
npm run build
npm run preview  # Test production build locally
```

## Usage

### Thin Film Calculator

1. Select "Thin Film" mode
2. Choose measurement mode (Transmission or Fluorescence)
3. Enter chemical formula: `ZnFe2O4`
4. Enter absorption edges: `Fe K, Zn K`
5. Density auto-fills to 5.3 g/cm³
6. Click "Calculate Thickness"
7. Result: Recommended thickness ≈18 μm for transmission mode

### Dilute Sample Calculator

1. Select "Dilute Sample" mode
2. Enter sample information:
   - Formula: `NiO`
   - Edge: `Ni K`
   - Mode: Transmission
3. Choose dilutant (e.g., Boron Nitride)
4. Select geometry:
   - Pellet: 10 mm diameter, 1 mm thick
   - Or Capillary: 1 mm ID, 10 mm length
5. Adjust packing factor (e.g., 70% for pressed pellet)
6. Click "Calculate Sample Masses"
7. Results show:
   - Sample mass needed (mg)
   - Dilutant mass needed (mg)
   - Preparation instructions

### Advanced Examples

**Hydrated Compound:**
- Formula: `CuSO4·5H2O`
- Edge: `Cu K`
- Auto-filled density: 2.286 g/cm³

**Multiple Elements:**
- Formula: `NiFe2O4`
- Edges: `Ni K, Fe K`
- Auto-filled density: 5.38 g/cm³

**Dilute Sample with Container:**
- Sample: `Fe2O3`
- Dilutant: `BN`
- Container: Kapton tape (25 μm walls)
- Geometry: 13 mm pellet

## xraylib Integration

This application uses xraylib for X-ray physics calculations. Since xraylib doesn't have a pure Python wheel compatible with WebAssembly/Pyodide, we use a **Python API server** approach.

### Manual Setup (if automatic start fails):

1. **Install Python dependencies:**
```bash
pip install flask flask-cors xraylib
# or
pip install -r requirements.txt
```

2. **Install Node.js dependencies:**
```bash
npm install
```

3. **Start both servers:**

Option A - Using npm scripts:
```bash
npm start  # Starts both servers
```

Option B - In separate terminals:
```bash
# Terminal 1: Start the xraylib API server
python xraylib_server.py

# Terminal 2: Start the React app
npm run dev
```

### How it works:
1. The Python server provides REST API endpoints for xraylib functions
2. The React app makes HTTP requests to the server for calculations
3. This approach works reliably with the actual xraylib library

### Note:
Both the Python server and React app must be running for the application to work.

## Technical Details

### Physics Calculations

#### Core Principles

The calculator uses the Beer-Lambert law for X-ray absorption:
```
I = I₀ × e^(-μt)
```

#### Thin Film Calculations

1. **Mass Attenuation Coefficient**: Retrieved from xraylib at 50 eV above edge energy
2. **Linear Attenuation Coefficient**: μ = (μ/ρ) × ρ
3. **Optimal Thickness**: t = μt_target / μ
   - Transmission mode: μt = 1.5
   - Fluorescence mode: μt = 0.5

#### Dilute Sample Calculations

1. **Mixture Absorption**: 
   ```
   (μ/ρ)_mix = w_sample × (μ/ρ)_sample + w_dilutant × (μ/ρ)_dilutant
   ```
2. **Effective Density with Packing Factor**:
   ```
   ρ_effective = packing_factor × (w_sample × ρ_sample + w_dilutant × ρ_dilutant)
   ```
3. **Mass Calculations**:
   ```
   Total_mass = Volume × ρ_effective
   Sample_mass = Total_mass × w_sample
   Dilutant_mass = Total_mass × w_dilutant
   ```

#### Packing Factor

The packing factor represents powder compactness (void fraction):
- **30-40%**: Loose powder (just poured)
- **50-60%**: Tapped powder (settled)
- **70-80%**: Pressed pellet (moderate pressure)
- **85-95%**: High pressure pellet

**Note**: These are estimates. For accurate results, measure your actual packing factor experimentally.

See `docs/DILUTE_SAMPLE_THEORY.md` for complete theoretical background and assumptions.

### Architecture

```
├── src/                       # Frontend source code
│   ├── components/            # React UI components
│   │   ├── ui/               # Base shadcn/ui components
│   │   ├── CalculationForm.tsx     # Thin film input form
│   │   ├── CalculationReport.tsx   # Thin film results
│   │   ├── DiluteSampleForm.tsx    # Dilute sample input form
│   │   ├── DiluteSampleReport.tsx  # Dilute sample results
│   │   └── ErrorBoundary.tsx
│   ├── lib/                  # Core calculation logic
│   │   ├── calculation-engine.ts   # Thin film calculations
│   │   ├── dilute-sample-engine.ts # Dilute sample calculations
│   │   ├── container-materials.ts  # Container & dilutant database
│   │   ├── formula-parser.ts       # Chemical formula parsing
│   │   ├── edge-parser.ts          # X-ray edge notation parsing
│   │   ├── density-lookup.ts       # Material density database
│   │   ├── xraylib-api.ts          # API client for xraylib server
│   │   └── xraylib-service.ts      # xraylib service interface
│   ├── types/                # TypeScript definitions
│   └── __tests__/            # Comprehensive test suite
├── docs/                     # Documentation
│   ├── DILUTE_SAMPLE_THEORY.md    # Theory and calculations
│   └── USER_GUIDE.md              # Comprehensive user guide
├── xraylib_server.py         # Python API server for xraylib
├── requirements.txt          # Python dependencies
├── start.sh                  # Unix/Mac startup script
├── start.bat                 # Windows startup script
├── start.py                  # Cross-platform Python startup script
└── package.json              # Node.js dependencies and scripts
```

### Data Sources

- **X-ray Data**: [xraylib](https://github.com/tschoonj/xraylib) - X-ray matter interaction cross sections
- **Atomic Weights**: IUPAC standard atomic weights
- **Material Densities**: CRC Handbook and literature values

## Development

### Available Scripts

```bash
npm start            # Start both frontend and API server
npm run dev          # Start frontend only
npm run dev:api      # Start API server only
npm run dev:all      # Same as npm start
npm run build        # Build for production
npm run preview      # Preview production build
npm test             # Run all tests
npm run test:watch   # Watch mode for development
npm run test:coverage # Generate coverage report
```

### Testing

Run the comprehensive test suite:

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode for development
npm run test:coverage # Generate coverage report
```

Test coverage targets: >80% for all metrics

## Deployment

### Production Deployment

**Important**: The application requires both the frontend and the Python API server to function. For production deployment:

1. **Frontend**: Can be deployed to any static hosting service
2. **API Server**: Requires a Python-capable hosting environment

### Frontend Only (Static Hosting - Netlify, Vercel, GitHub Pages)

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to your hosting service
3. Update `src/lib/xraylib-api.ts` to point to your production API server URL

### Full Stack Docker Deployment

Create a `docker-compose.yml`:

```yaml
version: '3.8'
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    ports:
      - "5001:5001"
  
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    depends_on:
      - api
```

`Dockerfile.api`:
```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY xraylib_server.py .
EXPOSE 5001
CMD ["python", "xraylib_server.py"]
```

`Dockerfile.frontend`:
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
```

## Browser Compatibility

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- Mobile browsers with ES2020 support

## Troubleshooting

### xraylib Loading Issues

If the app shows "Failed to connect to xraylib API server":
1. Make sure the Python server is running: `python xraylib_server.py`
2. Check that port 5001 is not in use by another application
3. Ensure you have installed the Python dependencies: `pip install flask flask-cors xraylib`
4. Check the Python server console for any error messages
5. Verify xraylib is properly installed: `python -c "import xraylib; print(xraylib.__version__)"`

### Formula Parsing Errors

- Ensure element symbols use proper capitalization (e.g., `Fe` not `fe` or `FE`)
- Use middle dot `·` for hydration (Alt+0183 on Windows, Option+Shift+9 on Mac)
- Balance parentheses in complex formulas

### Performance

For optimal performance:
- Use Chrome or Edge browsers
- Enable hardware acceleration
- Ensure the API server is running locally for fast calculations

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Maintain >80% test coverage
- Use Prettier for code formatting
- Update tests for new features

## Documentation

- **[User Guide](docs/USER_GUIDE.md)**: Comprehensive guide for new users with examples
- **[Theory Document](docs/DILUTE_SAMPLE_THEORY.md)**: Detailed physics, calculations, and assumptions
- **[API Documentation](docs/API.md)**: Technical API reference (coming soon)

## References

1. Bunker, G. (2010). *Introduction to XAFS: A Practical Guide to X-ray Absorption Fine Structure Spectroscopy*. Cambridge University Press.

2. Calvin, S. (2013). *XAFS for Everyone*. CRC Press.

3. Schoonjans, T. et al. (2011). The xraylib library for X-ray-matter interactions. Recent developments. *Spectrochimica Acta Part B*, 66(11-12), 776-784.

4. X-ray Data Booklet. Lawrence Berkeley National Laboratory. http://xdb.lbl.gov/

5. Koningsberger, D.C. & Prins, R. (1988). *X-ray Absorption: Principles, Applications, Techniques of EXAFS, SEXAFS and XANES*. Wiley.

6. German, R.M. (1989). *Particle Packing Characteristics*. Metal Powder Industries Federation.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [xraylib](https://github.com/tschoonj/xraylib) for X-ray physics data
- [shadcn/ui](https://ui.shadcn.com/) for the component library
- [Tailwind CSS](https://tailwindcss.com/) for styling
- React and Vite communities for excellent tools

---

Made with ❤️ for the X-ray spectroscopy community