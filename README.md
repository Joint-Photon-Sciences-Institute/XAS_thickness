# XAS Thickness Calculator

A modern web application for calculating optimal sample thickness for X-ray Absorption Spectroscopy (XAS) measurements. Built with React, TypeScript, and powered by the xraylib physics library.

![XAS Thickness Calculator](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Features

- **Dual Mode Operation**: Support for both Transmission (μt = 1.5) and Fluorescence (μt = 0.5) measurement modes
- **Chemical Formula Parser**: Handles complex formulas including:
  - Simple compounds (e.g., `ZnFe2O4`)
  - Hydrated compounds (e.g., `CuSO4·5H2O`)
  - Parentheses (e.g., `Ca(OH)2`)
  - Decimal stoichiometry (e.g., `Fe0.5Ni0.5O`)
- **Comprehensive Edge Support**: All X-ray absorption edges from K to N shells
- **Automatic Density Lookup**: Built-in database of common material densities with estimation for unknowns
- **Real-time Calculations**: Instant results using client-side physics calculations
- **Detailed Reports**: Complete calculation breakdown with intermediate values
- **Dark Mode Support**: Automatic theme adaptation based on system preferences
- **Responsive Design**: Works seamlessly on desktop and mobile devices

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

### Basic Example

1. Select measurement mode (Transmission or Fluorescence)
2. Enter chemical formula: `ZnFe2O4`
3. Enter absorption edges: `Fe K, Zn K`
4. Density auto-fills to 5.3 g/cm³
5. Click "Calculate Thickness"
6. Result: Recommended thickness ≈18 μm for transmission mode

### Advanced Examples

**Hydrated Compound:**
- Formula: `CuSO4·5H2O`
- Edge: `Cu K`
- Auto-filled density: 2.286 g/cm³

**Multiple Elements:**
- Formula: `NiFe2O4`
- Edges: `Ni K, Fe K`
- Auto-filled density: 5.38 g/cm³

**L-shell Edges:**
- Formula: `Au`
- Edge: `Au L3`
- Enter density: 19.32 g/cm³

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

The calculator uses the following physics principles:

1. **Mass Attenuation Coefficient**: Retrieved from xraylib for each element at 50 eV above the edge energy
   - Cross-sections are calculated at edge energy + 0.050 keV to avoid edge anomalies
   - This is standard practice in XAS measurements
2. **Linear Attenuation Coefficient**: μ = (μ/ρ) × ρ
3. **Optimal Thickness**: t = μt_target / μ
   - Transmission mode: μt = 1.5
   - Fluorescence mode: μt = 0.5

### Architecture

```
├── src/                       # Frontend source code
│   ├── components/            # React UI components
│   │   ├── ui/               # Base shadcn/ui components
│   │   ├── CalculationForm.tsx
│   │   ├── CalculationReport.tsx
│   │   └── ErrorBoundary.tsx
│   ├── lib/                  # Core calculation logic
│   │   ├── calculation-engine.ts   # Main calculation logic
│   │   ├── formula-parser.ts       # Chemical formula parsing
│   │   ├── edge-parser.ts          # X-ray edge notation parsing
│   │   ├── density-lookup.ts       # Material density database
│   │   ├── xraylib-api.ts          # API client for xraylib server
│   │   └── xraylib-service.ts      # xraylib service interface
│   ├── types/                # TypeScript definitions
│   └── __tests__/            # Comprehensive test suite
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

## References

1. Bunker, G. (2010). *Introduction to XAFS: A Practical Guide to X-ray Absorption Fine Structure Spectroscopy*. Cambridge University Press.

2. Schoonjans, T. et al. (2011). The xraylib library for X-ray-matter interactions. Recent developments. *Spectrochimica Acta Part B*, 66(11-12), 776-784.

3. X-ray Data Booklet. Lawrence Berkeley National Laboratory. http://xdb.lbl.gov/

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [xraylib](https://github.com/tschoonj/xraylib) for X-ray physics data
- [shadcn/ui](https://ui.shadcn.com/) for the component library
- [Tailwind CSS](https://tailwindcss.com/) for styling
- React and Vite communities for excellent tools

---

Made with ❤️ for the X-ray spectroscopy community