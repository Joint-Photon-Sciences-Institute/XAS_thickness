import ReactMarkdown from 'react-markdown';
import { DiluteSampleResult } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface DiluteSampleReportProps {
  result: DiluteSampleResult;
}

export function DiluteSampleReport({ result }: DiluteSampleReportProps) {
  const sampleMassMg = result.sampleMass * 1000;
  const dilutantMassMg = result.dilutantMass * 1000;
  const totalMassMg = result.totalMass * 1000;
  
  const isLowMass = totalMassMg < 10;
  const isHighMass = totalMassMg > 1000;
  const isVeryDilute = result.dilutionRatio < 0.01;
  const isVeryConcentrated = result.dilutionRatio > 0.9;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mass Calculation Results</CardTitle>
          <CardDescription>
            Required masses for dilute sample preparation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Sample Mass</p>
              <p className="text-2xl font-bold">{sampleMassMg.toFixed(2)} mg</p>
              <p className="text-xs text-muted-foreground">
                {(result.dilutionRatio * 100).toFixed(1)}% of total
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Dilutant Mass</p>
              <p className="text-2xl font-bold">{dilutantMassMg.toFixed(2)} mg</p>
              <p className="text-xs text-muted-foreground">
                {((1 - result.dilutionRatio) * 100).toFixed(1)}% of total
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Mass</p>
              <p className="text-2xl font-bold">{totalMassMg.toFixed(2)} mg</p>
              <p className="text-xs text-muted-foreground">
                Volume: {(result.sampleVolume * 1000).toFixed(3)} cm³
              </p>
            </div>
          </div>

          {(isLowMass || isHighMass || isVeryDilute || isVeryConcentrated) && (
            <div className="space-y-2">
              {isLowMass && (
                <Alert>
                  <AlertTitle>Low Total Mass</AlertTitle>
                  <AlertDescription>
                    The calculated total mass ({totalMassMg.toFixed(2)} mg) is very low. 
                    Consider preparing a larger batch for easier handling.
                  </AlertDescription>
                </Alert>
              )}
              
              {isHighMass && (
                <Alert>
                  <AlertTitle>High Total Mass</AlertTitle>
                  <AlertDescription>
                    The calculated total mass ({totalMassMg.toFixed(2)} mg) is quite high. 
                    You may want to verify your geometry dimensions or consider a smaller sample.
                  </AlertDescription>
                </Alert>
              )}
              
              {isVeryDilute && (
                <Alert>
                  <AlertTitle>Very Dilute Sample</AlertTitle>
                  <AlertDescription>
                    The sample is very dilute ({(result.dilutionRatio * 100).toFixed(2)}% sample). 
                    Ensure thorough mixing to maintain homogeneity.
                  </AlertDescription>
                </Alert>
              )}
              
              {isVeryConcentrated && (
                <Alert>
                  <AlertTitle>High Sample Concentration</AlertTitle>
                  <AlertDescription>
                    The sample concentration is very high ({(result.dilutionRatio * 100).toFixed(1)}% sample). 
                    Consider if dilution is necessary for your measurement.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <div className="border-t pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Effective Density:</span>
                <span className="ml-2 font-medium">{result.effectiveDensity.toFixed(3)} g/cm³</span>
              </div>
              <div>
                <span className="text-muted-foreground">Dilution Ratio:</span>
                <span className="ml-2 font-medium">1:{(1/result.dilutionRatio - 1).toFixed(1)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sample Preparation Instructions</CardTitle>
          <CardDescription>
            Step-by-step guide for preparing your dilute sample
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              components={{
                h2: ({ children }) => (
                  <h3 className="text-lg font-semibold mt-4 mb-2">{children}</h3>
                ),
                h3: ({ children }) => (
                  <h4 className="text-base font-medium mt-3 mb-2">{children}</h4>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-5 space-y-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-5 space-y-1">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-sm">{children}</li>
                ),
                p: ({ children }) => (
                  <p className="text-sm mb-2">{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold">{children}</strong>
                ),
              }}
            >
              {result.preparationInstructions}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Calculation Report</CardTitle>
          <CardDescription>
            Complete technical details of the calculation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <h2 className="text-xl font-bold mt-4 mb-3">{children}</h2>
                ),
                h2: ({ children }) => (
                  <h3 className="text-lg font-semibold mt-4 mb-2">{children}</h3>
                ),
                h3: ({ children }) => (
                  <h4 className="text-base font-medium mt-3 mb-2">{children}</h4>
                ),
                table: ({ children }) => (
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    {children}
                  </table>
                ),
                thead: ({ children }) => (
                  <thead className="bg-gray-50 dark:bg-gray-800">{children}</thead>
                ),
                tbody: ({ children }) => (
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                    {children}
                  </tbody>
                ),
                tr: ({ children }) => <tr>{children}</tr>,
                th: ({ children }) => (
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {children}
                  </th>
                ),
                td: ({ children }) => (
                  <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                    {children}
                  </td>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc pl-5 space-y-1">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal pl-5 space-y-1">{children}</ol>
                ),
                li: ({ children }) => (
                  <li className="text-sm">{children}</li>
                ),
                p: ({ children }) => (
                  <p className="text-sm mb-2">{children}</p>
                ),
                strong: ({ children }) => (
                  <strong className="font-semibold">{children}</strong>
                ),
                hr: () => <hr className="my-4 border-gray-200 dark:border-gray-700" />,
              }}
            >
              {result.report}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}