import React, { useState, useEffect } from 'react';
import { FormData, CalculationResult } from '@/types';
import { CalculationForm } from '@/components/CalculationForm';
import { CalculationReport } from '@/components/CalculationReport';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { calculateThickness } from '@/lib/calculation-engine';
import { xraylibService } from '@/lib/xraylib-service';

function App() {
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isXraylibLoading, setIsXraylibLoading] = useState(true);

  useEffect(() => {
    const loadXraylib = async () => {
      try {
        await xraylibService.load();
        setIsXraylibLoading(false);
      } catch (err) {
        console.error('Failed to load xraylib:', err);
        setIsXraylibLoading(false);
        setError(err instanceof Error ? err.message : 'Failed to load xraylib library');
      }
    };
    loadXraylib();
  }, []);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const calculationResult = await calculateThickness(
        formData.mode,
        formData.formula,
        formData.edges,
        parseFloat(formData.density)
      );
      setResult(calculationResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during calculation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">XAS Thickness Calculator</h1>
            <p className="text-muted-foreground mt-2">
              Calculate optimal sample thickness for X-ray Absorption Spectroscopy measurements
            </p>
          </div>

          {isXraylibLoading && (
            <Alert>
              <AlertDescription>
                Connecting to xraylib API server... Make sure the Python server is running: python xraylib_server.py
              </AlertDescription>
            </Alert>
          )}

          <CalculationForm onSubmit={handleSubmit} isLoading={isLoading || isXraylibLoading} />

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && <CalculationReport result={result} />}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;