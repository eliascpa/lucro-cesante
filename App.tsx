import React, { useState, useCallback } from 'react';
import { CalculationInputs, CalculationYear, CalculationType, ExportOption } from './types';
import InputForm from './components/InputForm';
import ResultsDisplay from './components/ResultsDisplay';
import { SparklesIcon } from './components/ui/Icons';
import { exportToPdf, exportToExcel } from './lib/exportUtils';

const App: React.FC = () => {
  const [inputs, setInputs] = useState<CalculationInputs>({
    annualWage: 50000,
    eventYear: new Date().getFullYear(),
    eventAge: 35,
    retirementAge: 65,
    incrementType: CalculationType.Percentage,
    incrementValue: 3,
    fringeBenefitType: CalculationType.None,
    fringeBenefitValue: 10,
    bonusType: CalculationType.None,
    bonusValue: 5000,
    discountRate: 3,
    discountStartYear: new Date().getFullYear() + 5,
    personalConsumptionPercentage: 33.33,
    exportOption: ExportOption.None,
  });

  const [results, setResults] = useState<CalculationYear[] | null>(null);
  const [totalLoss, setTotalLoss] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = useCallback(() => {
    setError(null);
    setResults(null);

    const {
      annualWage,
      eventYear,
      eventAge,
      retirementAge,
      incrementType,
      incrementValue,
      fringeBenefitType,
      fringeBenefitValue,
      bonusType,
      bonusValue,
      discountRate,
      discountStartYear,
      personalConsumptionPercentage,
      exportOption
    } = inputs;

    if (eventAge >= retirementAge) {
      setError("La edad del evento debe ser menor que la edad de jubilación.");
      return;
    }
    
    if (eventYear < 1900 || eventYear > 2200) {
      setError("Por favor ingrese un año del evento válido.");
      return;
    }

    const yearsOfLoss = retirementAge - eventAge;
    let totalLossCalc = 0;
    let annualIncome = annualWage;
    const annualResults: CalculationYear[] = [];

    for (let i = 0; i < yearsOfLoss; i++) {
      const currentYear = eventYear + i;
      const age = eventAge + i;

      if (i > 0) {
        if (incrementType === CalculationType.Percentage) {
          annualIncome *= (1 + incrementValue / 100);
        } else {
          annualIncome += incrementValue;
        }
      }

      let fringeBenefits = 0;
      if (fringeBenefitType === CalculationType.Percentage) {
        fringeBenefits = annualIncome * (fringeBenefitValue / 100);
      } else if (fringeBenefitType === CalculationType.Amount) {
        fringeBenefits = fringeBenefitValue;
      }

      let bonus = 0;
      if (bonusType === CalculationType.Percentage) {
        bonus = annualIncome * (bonusValue / 100);
      } else if (bonusType === CalculationType.Amount) {
        bonus = bonusValue;
      }

      const totalAnnualIncome = annualIncome + fringeBenefits + bonus;
      const personalConsumption = totalAnnualIncome * (personalConsumptionPercentage / 100);
      const netAnnualIncome = totalAnnualIncome - personalConsumption;
      
      let discountedIncome = netAnnualIncome;
      if (currentYear >= discountStartYear) {
          const discountYears = currentYear - discountStartYear + 1;
          discountedIncome = netAnnualIncome / Math.pow(1 + discountRate / 100, discountYears);
      }
      
      totalLossCalc += discountedIncome;

      annualResults.push({
        year: currentYear,
        age,
        income: annualIncome,
        fringeBenefits,
        bonus,
        totalAnnualIncome,
        personalConsumption,
        netAnnualIncome,
        discountedIncome,
      });
    }

    setResults(annualResults);
    setTotalLoss(totalLossCalc);

    // Trigger export after calculation
    switch (exportOption) {
      case ExportOption.PDF:
        exportToPdf(annualResults, inputs, totalLossCalc);
        break;
      case ExportOption.Excel:
        exportToExcel(annualResults, inputs, totalLossCalc);
        break;
      default:
        // Do nothing for 'None'
        break;
    }

  }, [inputs]);
  
  const handlePrint = () => {
    window.print();
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-3">
            <SparklesIcon />
            Calculadora de Lucro Cesante
          </h1>
          <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">
            Estime la pérdida de ingresos con ajustes detallados y proyecciones.
          </p>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2">
            <InputForm inputs={inputs} setInputs={setInputs} onCalculate={handleCalculate} error={error} />
          </div>

          <div className="lg:col-span-3">
             <ResultsDisplay 
                results={results} 
                totalLoss={totalLoss} 
                inputs={inputs} 
                onPrint={handlePrint} 
              />
          </div>
        </main>
        <footer className="text-center mt-12 text-sm text-slate-500 dark:text-slate-400">
            <p>&copy; {new Date().getFullYear()} Calculadora de Lucro Cesante. Todos los derechos reservados.</p>
            <p className="mt-1">Creado como una aplicación web moderna con React y Tailwind CSS.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;