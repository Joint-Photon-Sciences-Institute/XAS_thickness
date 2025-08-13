import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';

// Mock the calculation engine
jest.mock('@/lib/calculation-engine', () => ({
  calculateThickness: jest.fn(),
}));

import { calculateThickness } from '@/lib/calculation-engine';

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the app with title and form', () => {
    render(<App />);
    
    expect(screen.getByText('XAS Thickness Calculator')).toBeInTheDocument();
    expect(screen.getByLabelText(/Measurement Mode/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Chemical Formula/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Absorption Edges/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Material Density/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Calculate Thickness/i })).toBeInTheDocument();
  });

  it('should handle form submission successfully', async () => {
    const mockResult = {
      mode: 'Transmission',
      formula: 'ZnFe2O4',
      density: 5.3,
      molecularWeight: 241.08,
      edges: [
        {
          element: 'Fe',
          shell: 'K',
          atomicNumber: 26,
          shellConstant: 0,
          energy: 7.112,
          massAttenuation: 100,
          linearAttenuation: 530,
          thickness: 18.0,
          muT: 1.5,
        },
      ],
      recommendedThickness: 18.0,
      report: '# Test Report\nRecommended thickness: 18.0 μm',
    };
    
    (calculateThickness as jest.Mock).mockResolvedValue(mockResult);

    const user = userEvent.setup();
    render(<App />);

    // Fill in the form
    await user.type(screen.getByLabelText(/Chemical Formula/), 'ZnFe2O4');
    await user.type(screen.getByLabelText(/Absorption Edges/), 'Fe K');
    await user.type(screen.getByLabelText(/Material Density/), '5.3');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /Calculate Thickness/i }));

    // Check that calculation was called
    await waitFor(() => {
      expect(calculateThickness).toHaveBeenCalledWith(
        'Transmission',
        'ZnFe2O4',
        'Fe K',
        5.3
      );
    });

    // Check that results are displayed
    await waitFor(() => {
      expect(screen.getByText(/Calculation Results/)).toBeInTheDocument();
      expect(screen.getByText(/Recommended Thickness: 18.0 μm/)).toBeInTheDocument();
    });
  });

  it('should handle calculation errors', async () => {
    (calculateThickness as jest.Mock).mockRejectedValue(
      new Error('Failed to load xraylib')
    );

    const user = userEvent.setup();
    render(<App />);

    // Fill in the form
    await user.type(screen.getByLabelText(/Chemical Formula/), 'Fe2O3');
    await user.type(screen.getByLabelText(/Absorption Edges/), 'Fe K');
    await user.type(screen.getByLabelText(/Material Density/), '5.24');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /Calculate Thickness/i }));

    // Check that error is displayed
    await waitFor(() => {
      expect(screen.getByText(/Failed to load xraylib/)).toBeInTheDocument();
    });
  });

  it('should validate form inputs', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Try to submit without filling required fields
    await user.click(screen.getByRole('button', { name: /Calculate Thickness/i }));

    // Calculation should not be called
    expect(calculateThickness).not.toHaveBeenCalled();
  });

  it('should switch between transmission and fluorescence modes', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Default should be Transmission
    const transmissionRadio = screen.getByLabelText(/Transmission/);
    expect(transmissionRadio).toBeChecked();

    // Switch to Fluorescence
    const fluorescenceRadio = screen.getByLabelText(/Fluorescence/);
    await user.click(fluorescenceRadio);
    expect(fluorescenceRadio).toBeChecked();
    expect(transmissionRadio).not.toBeChecked();
  });

  it('should show loading state during calculation', async () => {
    let resolveCalculation: (value: any) => void;
    const calculationPromise = new Promise((resolve) => {
      resolveCalculation = resolve;
    });
    
    (calculateThickness as jest.Mock).mockReturnValue(calculationPromise);

    const user = userEvent.setup();
    render(<App />);

    // Fill in the form
    await user.type(screen.getByLabelText(/Chemical Formula/), 'ZnO');
    await user.type(screen.getByLabelText(/Absorption Edges/), 'Zn K');
    await user.type(screen.getByLabelText(/Material Density/), '5.61');

    // Submit the form
    await user.click(screen.getByRole('button', { name: /Calculate Thickness/i }));

    // Check loading state
    expect(screen.getByRole('button', { name: /Calculating/i })).toBeDisabled();

    // Resolve the calculation
    resolveCalculation!({
      mode: 'Transmission',
      formula: 'ZnO',
      density: 5.61,
      molecularWeight: 81.38,
      edges: [],
      recommendedThickness: 15.0,
      report: 'Test',
    });

    // Check that loading state is gone
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Calculate Thickness/i })).not.toBeDisabled();
    });
  });

  it('should auto-fill density when formula changes', async () => {
    const user = userEvent.setup();
    render(<App />);

    const densityInput = screen.getByLabelText(/Material Density/) as HTMLInputElement;
    
    // Initially empty
    expect(densityInput.value).toBe('');

    // Type a known formula
    await user.type(screen.getByLabelText(/Chemical Formula/), 'ZnO');

    // Density should be auto-filled
    await waitFor(() => {
      expect(densityInput.value).toBe('5.61');
    });

    // Check that density info is shown
    expect(screen.getByText(/Known density for/)).toBeInTheDocument();
  });

  it('should clear previous results when submitting new calculation', async () => {
    const mockResult1 = {
      mode: 'Transmission',
      formula: 'ZnO',
      density: 5.61,
      molecularWeight: 81.38,
      edges: [],
      recommendedThickness: 15.0,
      report: 'First calculation',
    };

    const mockResult2 = {
      mode: 'Transmission',
      formula: 'Fe2O3',
      density: 5.24,
      molecularWeight: 159.7,
      edges: [],
      recommendedThickness: 20.0,
      report: 'Second calculation',
    };

    (calculateThickness as jest.Mock)
      .mockResolvedValueOnce(mockResult1)
      .mockResolvedValueOnce(mockResult2);

    const user = userEvent.setup();
    render(<App />);

    // First calculation
    await user.type(screen.getByLabelText(/Chemical Formula/), 'ZnO');
    await user.type(screen.getByLabelText(/Absorption Edges/), 'Zn K');
    await user.type(screen.getByLabelText(/Material Density/), '5.61');
    await user.click(screen.getByRole('button', { name: /Calculate Thickness/i }));

    await waitFor(() => {
      expect(screen.getByText(/First calculation/)).toBeInTheDocument();
    });

    // Clear and do second calculation
    await user.clear(screen.getByLabelText(/Chemical Formula/));
    await user.type(screen.getByLabelText(/Chemical Formula/), 'Fe2O3');
    await user.clear(screen.getByLabelText(/Absorption Edges/));
    await user.type(screen.getByLabelText(/Absorption Edges/), 'Fe K');
    await user.clear(screen.getByLabelText(/Material Density/));
    await user.type(screen.getByLabelText(/Material Density/), '5.24');
    await user.click(screen.getByRole('button', { name: /Calculate Thickness/i }));

    await waitFor(() => {
      expect(screen.queryByText(/First calculation/)).not.toBeInTheDocument();
      expect(screen.getByText(/Second calculation/)).toBeInTheDocument();
    });
  });
});