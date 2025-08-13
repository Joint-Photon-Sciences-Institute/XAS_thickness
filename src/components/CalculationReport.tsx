import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CalculationResult } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CalculationReportProps {
  result: CalculationResult;
}

export function CalculationReport({ result }: CalculationReportProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Calculation Results</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="text-2xl font-bold mb-4">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-xl font-semibold mt-6 mb-3">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg font-semibold mt-4 mb-2">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="mb-4">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-6 mb-4">{children}</ul>
              ),
              li: ({ children }) => (
                <li className="mb-1">{children}</li>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold">{children}</strong>
              ),
              em: ({ children }) => (
                <em className="italic">{children}</em>
              ),
              hr: () => (
                <hr className="my-6 border-t border-border" />
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-4">
                  <table className="min-w-full border border-border rounded-lg overflow-hidden">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-muted/50 border-b border-border">{children}</thead>
              ),
              tbody: ({ children }) => (
                <tbody className="divide-y divide-border">{children}</tbody>
              ),
              tr: ({ children }) => (
                <tr className="hover:bg-muted/30 transition-colors">{children}</tr>
              ),
              th: ({ children }) => (
                <th className="px-4 py-3 text-left font-semibold text-sm uppercase tracking-wider">{children}</th>
              ),
              td: ({ children }) => (
                <td className="px-4 py-3 text-sm">{children}</td>
              ),
            }}
          >
            {result.report}
          </ReactMarkdown>
          
          <div className="mt-6 p-4 bg-primary/10 rounded-lg">
            <p className="text-lg font-semibold text-center">
              Recommended Thickness: {result.recommendedThickness.toFixed(1)} μm
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}