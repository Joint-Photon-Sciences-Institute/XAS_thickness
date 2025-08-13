import React, { useState, useEffect } from 'react';
import { 
  CalculationMode, 
  DiluteSampleFormData, 
  GeometryType, 
  ContainerMaterial 
} from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { parseChemicalFormula } from '@/lib/formula-parser';
import { lookupDensity } from '@/lib/density-lookup';
import { parseEdgeLabels } from '@/lib/edge-parser';
import { COMMON_DILUTANTS, CONTAINER_MATERIALS } from '@/lib/container-materials';

interface DiluteSampleFormProps {
  onSubmit: (data: DiluteSampleFormData) => void;
  isLoading?: boolean;
}

export function DiluteSampleForm({ onSubmit, isLoading = false }: DiluteSampleFormProps) {
  const [formData, setFormData] = useState<DiluteSampleFormData>({
    sampleType: 'DiluteSample',
    mode: 'Transmission',
    formula: '',
    edges: '',
    density: '',
    dilutantFormula: 'BN',
    dilutantDensity: '2.1',
    geometry: 'Pellet',
    dimensions: {
      diameter: 10,
      thickness: 1,
      innerDiameter: 1,
      length: 10
    },
    containerMaterial: 'None',
    containerWallThickness: 0.025,
    packingFactor: 0.6
  });

  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [sampleDensityInfo, setSampleDensityInfo] = useState<string>('');
  const [dilutantDensityInfo, setDilutantDensityInfo] = useState<string>('');

  useEffect(() => {
    if (formData.formula) {
      try {
        const composition = parseChemicalFormula(formData.formula);
        const densityData = lookupDensity(formData.formula, composition);
        setFormData(prev => ({ ...prev, density: densityData.density.toString() }));
        setSampleDensityInfo(densityData.isEstimate 
          ? `Estimated density for ${densityData.name}` 
          : `Known density for ${densityData.name}`
        );
      } catch (error) {
        setSampleDensityInfo('');
      }
    }
  }, [formData.formula]);

  useEffect(() => {
    if (formData.dilutantFormula) {
      try {
        const composition = parseChemicalFormula(formData.dilutantFormula);
        const densityData = lookupDensity(formData.dilutantFormula, composition);
        setFormData(prev => ({ ...prev, dilutantDensity: densityData.density.toString() }));
        setDilutantDensityInfo(densityData.isEstimate 
          ? `Estimated density for ${densityData.name}` 
          : `Known density for ${densityData.name}`
        );
      } catch (error) {
        setDilutantDensityInfo('');
      }
    }
  }, [formData.dilutantFormula]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<string, string>> = {};

    try {
      parseChemicalFormula(formData.formula);
    } catch (error) {
      newErrors.formula = error instanceof Error ? error.message : 'Invalid formula';
    }

    try {
      parseChemicalFormula(formData.dilutantFormula);
    } catch (error) {
      newErrors.dilutantFormula = error instanceof Error ? error.message : 'Invalid dilutant formula';
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

    const dilutantDensity = parseFloat(formData.dilutantDensity);
    if (isNaN(dilutantDensity) || dilutantDensity <= 0) {
      newErrors.dilutantDensity = 'Dilutant density must be a positive number';
    }

    if (formData.packingFactor < 0.1 || formData.packingFactor > 1) {
      newErrors.packingFactor = 'Packing factor must be between 0.1 and 1.0';
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

  const handleChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleDilutantSelect = (dilutant: any) => {
    setFormData(prev => ({
      ...prev,
      dilutantFormula: dilutant.formula,
      dilutantDensity: dilutant.density.toString()
    }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Dilute Sample Calculator</CardTitle>
        <CardDescription>
          Calculate optimal masses for dilute powder samples (pellets or capillaries)
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="formula">Sample Formula</Label>
              <Input
                id="formula"
                type="text"
                placeholder="e.g., ZnFe2O4"
                value={formData.formula}
                onChange={(e) => handleChange('formula', e.target.value)}
                error={!!errors.formula}
              />
              {errors.formula && (
                <Alert variant="destructive">
                  <AlertDescription>{errors.formula}</AlertDescription>
                </Alert>
              )}
              {sampleDensityInfo && (
                <p className="text-sm text-muted-foreground">{sampleDensityInfo}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="density">Sample Density (g/cm³)</Label>
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
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edges">Absorption Edges</Label>
            <Input
              id="edges"
              type="text"
              placeholder="e.g., Fe K, Zn K"
              value={formData.edges}
              onChange={(e) => handleChange('edges', e.target.value)}
              error={!!errors.edges}
            />
            {errors.edges && (
              <Alert variant="destructive">
                <AlertDescription>{errors.edges}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-4">
            <Label>Dilutant Material</Label>
            <div className="grid grid-cols-2 gap-2">
              {COMMON_DILUTANTS.slice(0, 4).map((dilutant) => (
                <Button
                  key={dilutant.formula}
                  type="button"
                  variant={formData.dilutantFormula === dilutant.formula ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleDilutantSelect(dilutant)}
                  className="justify-start"
                >
                  {dilutant.name} ({dilutant.formula})
                </Button>
              ))}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dilutantFormula">Dilutant Formula</Label>
                <Input
                  id="dilutantFormula"
                  type="text"
                  placeholder="e.g., BN"
                  value={formData.dilutantFormula}
                  onChange={(e) => handleChange('dilutantFormula', e.target.value)}
                  error={!!errors.dilutantFormula}
                />
                {errors.dilutantFormula && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.dilutantFormula}</AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dilutantDensity">Dilutant Density (g/cm³)</Label>
                <Input
                  id="dilutantDensity"
                  type="number"
                  step="0.001"
                  placeholder="e.g., 2.1"
                  value={formData.dilutantDensity}
                  onChange={(e) => handleChange('dilutantDensity', e.target.value)}
                  error={!!errors.dilutantDensity}
                />
                {dilutantDensityInfo && (
                  <p className="text-sm text-muted-foreground">{dilutantDensityInfo}</p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Sample Geometry</Label>
            <RadioGroup
              value={formData.geometry}
              onValueChange={(value) => handleChange('geometry', value as GeometryType)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Pellet" id="pellet" />
                <Label htmlFor="pellet" className="font-normal cursor-pointer">
                  Pellet (pressed powder)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Capillary" id="capillary" />
                <Label htmlFor="capillary" className="font-normal cursor-pointer">
                  Capillary (tube)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {formData.geometry === 'Pellet' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="diameter">Pellet Diameter (mm)</Label>
                <Input
                  id="diameter"
                  type="number"
                  step="0.1"
                  value={formData.dimensions.diameter}
                  onChange={(e) => handleChange('dimensions.diameter', parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thickness">Pellet Thickness (mm)</Label>
                <Input
                  id="thickness"
                  type="number"
                  step="0.1"
                  value={formData.dimensions.thickness}
                  onChange={(e) => handleChange('dimensions.thickness', parseFloat(e.target.value))}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="innerDiameter">Inner Diameter (mm)</Label>
                <Input
                  id="innerDiameter"
                  type="number"
                  step="0.1"
                  value={formData.dimensions.innerDiameter}
                  onChange={(e) => handleChange('dimensions.innerDiameter', parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="length">Capillary Length (mm)</Label>
                <Input
                  id="length"
                  type="number"
                  step="0.1"
                  value={formData.dimensions.length}
                  onChange={(e) => handleChange('dimensions.length', parseFloat(e.target.value))}
                />
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Label>Container Material</Label>
            <RadioGroup
              value={formData.containerMaterial}
              onValueChange={(value) => handleChange('containerMaterial', value as ContainerMaterial)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="None" id="none" />
                <Label htmlFor="none" className="font-normal cursor-pointer">
                  None / Open holder
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Kapton" id="kapton" />
                <Label htmlFor="kapton" className="font-normal cursor-pointer">
                  Kapton tape/window
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Quartz" id="quartz" />
                <Label htmlFor="quartz" className="font-normal cursor-pointer">
                  Quartz capillary
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Polyimide" id="polyimide" />
                <Label htmlFor="polyimide" className="font-normal cursor-pointer">
                  Polyimide tubing
                </Label>
              </div>
            </RadioGroup>
          </div>

          {formData.containerMaterial !== 'None' && (
            <div className="space-y-2">
              <Label htmlFor="wallThickness">Container Wall Thickness (mm)</Label>
              <Input
                id="wallThickness"
                type="number"
                step="0.001"
                value={formData.containerWallThickness}
                onChange={(e) => handleChange('containerWallThickness', parseFloat(e.target.value))}
              />
              <p className="text-sm text-muted-foreground">
                Default: {CONTAINER_MATERIALS[formData.containerMaterial]?.defaultWallThickness} mm
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="packingFactor">
              Packing Factor: {(formData.packingFactor * 100).toFixed(0)}%
            </Label>
            <input
              id="packingFactor"
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={formData.packingFactor}
              onChange={(e) => handleChange('packingFactor', parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>10% (very loose)</span>
              <span>60% (typical)</span>
              <span>100% (theoretical)</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {formData.packingFactor < 0.4 && "Loose powder - typical for unpressed samples"}
              {formData.packingFactor >= 0.4 && formData.packingFactor < 0.7 && "Moderately packed - typical for tapped powder"}
              {formData.packingFactor >= 0.7 && formData.packingFactor < 0.9 && "Well packed - typical for pressed pellets"}
              {formData.packingFactor >= 0.9 && "Highly compacted - requires high pressure"}
            </p>
          </div>

          <Button type="submit" className="w-full" loading={isLoading}>
            {isLoading ? 'Calculating...' : 'Calculate Sample Masses'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}