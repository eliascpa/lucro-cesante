export enum CalculationType {
  Percentage = 'Porcentaje',
  Amount = 'Monto',
  None = 'Ninguno'
}

export enum ExportOption {
  None = 'Ninguno',
  PDF = 'PDF',
  Excel = 'Excel',
}

export interface CalculationInputs {
  annualWage: number;
  eventYear: number;
  eventAge: number;
  retirementAge: number;
  incrementType: CalculationType.Percentage | CalculationType.Amount;
  incrementValue: number;
  fringeBenefitType: CalculationType;
  fringeBenefitValue: number;
  bonusType: CalculationType;
  bonusValue: number;
  discountRate: number;
  discountStartYear: number;
  personalConsumptionPercentage: number;
  exportOption: ExportOption;
}

export interface CalculationYear {
  year: number;
  age: number;
  income: number;
  fringeBenefits: number;
  bonus: number;
  totalAnnualIncome: number;
  personalConsumption: number;
  netAnnualIncome: number;
  discountedIncome: number;
}