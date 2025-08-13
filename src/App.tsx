import { useState, useEffect } from 'react';
import { FormData, CalculationResult, SampleType, DiluteSampleFormData, DiluteSampleResult } from '@/types';
import { CalculationForm } from '@/components/CalculationForm';
import { CalculationReport } from '@/components/CalculationReport';
import { DiluteSampleForm } from '@/components/DiluteSampleForm';
import { DiluteSampleReport } from '@/components/DiluteSampleReport';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { calculateThickness } from '@/lib/calculation-engine';
import { calculateDiluteSample } from '@/lib/dilute-sample-engine';
import { xraylibService } from '@/lib/xraylib-service';

function App() {
  const [sampleType, setSampleType] = useState<SampleType>('ThinFilm');
  const [result, setResult] = useState<CalculationResult | DiluteSampleResult | null>(null);
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

  const handleDiluteSampleSubmit = async (formData: DiluteSampleFormData) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const calculationResult = await calculateDiluteSample(formData);
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
            <h1 className="text-3xl font-bold text-foreground">XAS Sample Calculator</h1>
            <p className="text-muted-foreground mt-2">
              Calculate optimal sample preparation for X-ray Absorption Spectroscopy measurements
            </p>
          </div>

          <Card className="mb-6">
            <CardContent className="pt-6">
              <Label className="text-base font-semibold mb-4 block">Sample Type</Label>
              <RadioGroup
                value={sampleType}
                onValueChange={(value) => {
                  setSampleType(value as SampleType);
                  setResult(null);
                  setError(null);
                }}
                className="flex flex-row space-x-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ThinFilm" id="thinfilm" />
                  <Label htmlFor="thinfilm" className="font-normal cursor-pointer">
                    Thin Film (calculate thickness)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="DiluteSample" id="dilutesample" />
                  <Label htmlFor="dilutesample" className="font-normal cursor-pointer">
                    Dilute Sample (calculate masses)
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {isXraylibLoading && (
            <Alert>
              <AlertDescription>
                Connecting to xraylib API server... Make sure the Python server is running: python xraylib_server.py
              </AlertDescription>
            </Alert>
          )}

          {sampleType === 'ThinFilm' ? (
            <CalculationForm onSubmit={handleSubmit} isLoading={isLoading || isXraylibLoading} />
          ) : (
            <DiluteSampleForm onSubmit={handleDiluteSampleSubmit} isLoading={isLoading || isXraylibLoading} />
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            sampleType === 'ThinFilm' ? (
              <CalculationReport result={result as CalculationResult} />
            ) : (
              <DiluteSampleReport result={result as DiluteSampleResult} />
            )
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;