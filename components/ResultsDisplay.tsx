
import React from 'react';
import { CalculationInputs, CalculationYear, CalculationType } from '../types';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { PrinterIcon, TableIcon } from './ui/Icons';

interface ResultsDisplayProps {
  results: CalculationYear[] | null;
  totalLoss: number;
  inputs: CalculationInputs;
  onPrint: () => void;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results, totalLoss, inputs, onPrint }) => {
  if (!results) {
    return (
      <Card className="h-full flex flex-col items-center justify-center text-center">
        <CardContent className="pt-6">
          <TableIcon className="mx-auto h-16 w-16 text-slate-400 dark:text-slate-500" />
          <h3 className="mt-4 text-xl font-semibold text-slate-800 dark:text-slate-200">Esperando cálculo</h3>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Ingrese los parámetros en el formulario y presione "Calcular" para ver los resultados aquí.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div id="print-area">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Resultados del Cálculo</CardTitle>
            <CardDescription>Proyección detallada de la pérdida de ingresos.</CardDescription>
          </div>
          <Button onClick={onPrint} variant="outline" size="sm" className="ml-4 print-hidden">
            <PrinterIcon className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg mb-6">
            <h4 className="font-semibold text-lg mb-3 text-slate-800 dark:text-slate-100">Resumen de Suposiciones</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm text-slate-700 dark:text-slate-300">
                <p><strong>Salario Anual:</strong> {formatCurrency(inputs.annualWage)}</p>
                <p><strong>Edad Evento:</strong> {inputs.eventAge} años</p>
                <p><strong>Edad Jubilación:</strong> {inputs.retirementAge} años</p>
                 <p>
                    <strong>Incremento Anual:</strong> {inputs.incrementType}, {
                        inputs.incrementType === CalculationType.Percentage 
                        ? `${inputs.incrementValue}%` 
                        : formatCurrency(inputs.incrementValue)
                    }
                </p>
                {inputs.fringeBenefitType !== CalculationType.None && (
                    <p>
                        <strong>Beneficios Adic.:</strong> {inputs.fringeBenefitType}, {
                            inputs.fringeBenefitType === CalculationType.Percentage 
                            ? `${inputs.fringeBenefitValue}%` 
                            : formatCurrency(inputs.fringeBenefitValue)
                        }
                    </p>
                )}
                {inputs.bonusType !== CalculationType.None && (
                    <p>
                        <strong>Bono:</strong> {inputs.bonusType}, {
                            inputs.bonusType === CalculationType.Percentage 
                            ? `${inputs.bonusValue}%` 
                            : formatCurrency(inputs.bonusValue)
                        }
                    </p>
                )}
                <p><strong>Tasa Descuento:</strong> {inputs.discountRate}%</p>
                <p><strong>Año Inicio Desc.:</strong> {inputs.discountStartYear}</p>
                <p><strong>Consumo Propio:</strong> {inputs.personalConsumptionPercentage}%</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
              <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  <th scope="col" className="px-4 py-3">Año</th>
                  <th scope="col" className="px-4 py-3">Edad</th>
                  <th scope="col" className="px-4 py-3 text-right">Ingreso Bruto</th>
                  <th scope="col" className="px-4 py-3 text-right">Consumo Propio</th>
                  <th scope="col" className="px-4 py-3 text-right">Ingreso Neto</th>
                  <th scope="col" className="px-4 py-3 text-right">Ingreso Descontado</th>
                </tr>
              </thead>
              <tbody>
                {results.map((row, index) => (
                  <tr key={index} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-2 font-medium text-slate-900 dark:text-white">{row.year}</td>
                    <td className="px-4 py-2">{row.age}</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(row.totalAnnualIncome)}</td>
                    <td className="px-4 py-2 text-right text-red-600 dark:text-red-400">({formatCurrency(row.personalConsumption)})</td>
                    <td className="px-4 py-2 text-right font-semibold">{formatCurrency(row.netAnnualIncome)}</td>
                    <td className="px-4 py-2 text-right font-bold text-slate-900 dark:text-white">{formatCurrency(row.discountedIncome)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-6 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-between">
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">Pérdida Total de Ingresos:</h4>
            <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{formatCurrency(totalLoss)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsDisplay;