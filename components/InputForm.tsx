import React from 'react';
import { CalculationInputs, CalculationType, ExportOption } from '../types';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from './ui/Card';
import { Label } from './ui/Label';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';
import { AlertTriangleIcon, DownloadIcon } from './ui/Icons';

interface InputFormProps {
  inputs: CalculationInputs;
  setInputs: React.Dispatch<React.SetStateAction<CalculationInputs>>;
  onCalculate: () => void;
  error: string | null;
}

const InputForm: React.FC<InputFormProps> = ({ inputs, setInputs, onCalculate, error }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: value === '' ? '' : parseFloat(value) }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setInputs(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Card className="sticky top-8">
      <CardHeader>
        <CardTitle>Parámetros de Cálculo</CardTitle>
        <CardDescription>Ingrese los datos para iniciar la simulación.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); onCalculate(); }} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="annualWage">Salario Anual ($)</Label>
              <Input type="number" name="annualWage" id="annualWage" value={inputs.annualWage} onChange={handleInputChange} placeholder="50000" />
            </div>
            <div>
              <Label htmlFor="eventYear">Año del Evento</Label>
              <Input type="number" name="eventYear" id="eventYear" value={inputs.eventYear} onChange={handleInputChange} placeholder="2024" />
            </div>
            <div>
              <Label htmlFor="eventAge">Edad del Evento</Label>
              <Input type="number" name="eventAge" id="eventAge" value={inputs.eventAge} onChange={handleInputChange} placeholder="35" />
            </div>
            <div>
              <Label htmlFor="retirementAge">Edad de Jubilación</Label>
              <Input type="number" name="retirementAge" id="retirementAge" value={inputs.retirementAge} onChange={handleInputChange} placeholder="65" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Incremento Anual</Label>
            <div className="grid grid-cols-3 gap-2">
              <Select name="incrementType" value={inputs.incrementType} onChange={handleSelectChange} className="col-span-1">
                <option>{CalculationType.Percentage}</option>
                <option>{CalculationType.Amount}</option>
              </Select>
              <Input type="number" name="incrementValue" value={inputs.incrementValue} onChange={handleInputChange} className="col-span-2" placeholder="Valor"/>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Beneficios Adicionales</Label>
            <div className="grid grid-cols-3 gap-2">
              <Select name="fringeBenefitType" value={inputs.fringeBenefitType} onChange={handleSelectChange} className="col-span-1">
                <option>{CalculationType.None}</option>
                <option>{CalculationType.Percentage}</option>
                <option>{CalculationType.Amount}</option>
              </Select>
              <Input type="number" name="fringeBenefitValue" value={inputs.fringeBenefitValue} onChange={handleInputChange} className="col-span-2" placeholder="Valor" disabled={inputs.fringeBenefitType === CalculationType.None} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Bono</Label>
            <div className="grid grid-cols-3 gap-2">
              <Select name="bonusType" value={inputs.bonusType} onChange={handleSelectChange} className="col-span-1">
                <option>{CalculationType.None}</option>
                <option>{CalculationType.Percentage}</option>
                <option>{CalculationType.Amount}</option>
              </Select>
              <Input type="number" name="bonusValue" value={inputs.bonusValue} onChange={handleInputChange} className="col-span-2" placeholder="Valor" disabled={inputs.bonusType === CalculationType.None} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="personalConsumptionPercentage">Consumo Propio del Reclamante (%)</Label>
            <Input type="number" name="personalConsumptionPercentage" id="personalConsumptionPercentage" value={inputs.personalConsumptionPercentage} onChange={handleInputChange} placeholder="33.33" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="discountRate">Tasa de Descuento (%)</Label>
              <Input type="number" name="discountRate" id="discountRate" value={inputs.discountRate} onChange={handleInputChange} placeholder="3" />
            </div>
            <div>
              <Label htmlFor="discountStartYear">Año Inicio Descuento</Label>
              <Input type="number" name="discountStartYear" id="discountStartYear" value={inputs.discountStartYear} onChange={handleInputChange} placeholder="2029" />
            </div>
          </div>
          
           <div className="space-y-2">
              <Label htmlFor="exportOption">Exportar a</Label>
              <Select name="exportOption" id="exportOption" value={inputs.exportOption} onChange={handleSelectChange}>
                <option value={ExportOption.None}>Ninguno</option>
                <option value={ExportOption.PDF}>PDF</option>
                <option value={ExportOption.Excel}>Excel</option>
              </Select>
            </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 p-4 rounded-md flex items-center" role="alert">
              <AlertTriangleIcon className="h-5 w-5 mr-3" />
              <p className="font-semibold">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full">
             <DownloadIcon className="mr-2 h-4 w-4" />
            Calcular y Exportar
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default InputForm;