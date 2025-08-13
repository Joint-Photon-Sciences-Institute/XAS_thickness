import React, { useState, useEffect } from 'react';
import { CalculationMode, FormData } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { parseChemicalFormula } from '@/lib/formula-parser';
import { lookupDensity } from '@/lib/density-lookup';
import { parseEdgeLabels } from '@/lib/edge-parser';

interface CalculationFormProps {
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
}

export function CalculationForm({ onSubmit, isLoading = false }: CalculationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    mode: 'Transmission',
    formula: '',
    edges: '',
    density: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [densityInfo, setDensityInfo] = useState<string>('');

  useEffect(() => {
    if (formData.formula) {
      try {
        const composition = parseChemicalFormula(formData.formula);
        const densityData = lookupDensity(formData.formula, composition);
        setFormData(prev => ({ ...prev, density: densityData.density.toString() }));
        setDensityInfo(densityData.isEstimate 
          ? `Estimated density for ${densityData.name}` 
          : `Known density for ${densityData.name}`
        );
      } catch (error) {
        setDensityInfo('');
      }
    }
  }, [formData.formula]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    try {
      parseChemicalFormula(formData.formula);
    } catch (error) {
      newErrors.formula = error instanceof Error ? error.message : 'Invalid formula';
    }

    try {
      parseEdgeLabels(formData.edges);
    } catch (error) {
      newErrors.edges = error instanceof Error ? error.message : 'Invalid edge specification';
    }

    const density = parseFloat(formData.density);
    if (isNaN(density) || density <= 0) {
      newErrors.density = 'Density must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>XAS Thickness Calculator</CardTitle>
        <CardDescription>
          Calculate optimal sample thickness for X-ray Absorption Spectroscopy
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label>Measurement Mode</Label>
            <RadioGroup
              value={formData.mode}
              onValueChange={(value) => handleChange('mode', value as CalculationMode)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Transmission" id="transmission" />
                <Label htmlFor="transmission" className="font-normal cursor-pointer">
                  Transmission (μt = 1.5)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Fluorescence" id="fluorescence" />
                <Label htmlFor="fluorescence" className="font-normal cursor-pointer">
                  Fluorescence (μt = 0.5)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="formula">Chemical Formula</Label>
            <Input
              id="formula"
              type="text"
              placeholder="e.g., ZnFe2O4, CuSO4·5H2O, Ca(OH)2"
              value={formData.formula}
              onChange={(e) => handleChange('formula', e.target.value)}
              error={!!errors.formula}
            />
            {errors.formula && (
              <Alert variant="destructive">
                <AlertDescription>{errors.formula}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edges">Absorption Edges</Label>
            <Input
              id="edges"
              type="text"
              placeholder="e.g., Fe K, Zn K or Cu L3"
              value={formData.edges}
              onChange={(e) => handleChange('edges', e.target.value)}
              error={!!errors.edges}
            />
            {errors.edges && (
              <Alert variant="destructive">
                <AlertDescription>{errors.edges}</AlertDescription>
              </Alert>
            )}
            <p className="text-sm text-muted-foreground">
              Comma-separated list of element and shell (e.g., Fe K, Cu L3)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="density">Material Density (g/cm³)</Label>
            <Input
              id="density"
              type="number"
              step="0.001"
              placeholder="e.g., 5.3"
              value={formData.density}
              onChange={(e) => handleChange('density', e.target.value)}
              error={!!errors.density}
            />
            {errors.density && (
              <Alert variant="destructive">
                <AlertDescription>{errors.density}</AlertDescription>
              </Alert>
            )}
            {densityInfo && (
              <p className="text-sm text-muted-foreground">{densityInfo}</p>
            )}
          </div>

          <Button type="submit" className="w-full" loading={isLoading}>
            {isLoading ? 'Calculating...' : 'Calculate Thickness'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}