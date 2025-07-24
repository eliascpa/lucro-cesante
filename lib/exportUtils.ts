
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { CalculationInputs, CalculationYear, CalculationType } from '../types';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('es-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

const getAssumptions = (inputs: CalculationInputs): (string | number)[][] => {
    const assumptions: (string | number)[][] = [
        ['Salario Anual:', formatCurrency(inputs.annualWage)],
        ['Edad del Evento:', `${inputs.eventAge} años`],
        ['Edad de Jubilación:', `${inputs.retirementAge} años`],
    ];

    const incrementValueStr = inputs.incrementType === CalculationType.Percentage 
        ? `${inputs.incrementValue}%` 
        : formatCurrency(inputs.incrementValue);
    assumptions.push(['Incremento Anual:', `${inputs.incrementType}, ${incrementValueStr}`]);

    if (inputs.fringeBenefitType !== CalculationType.None) {
        const fringeValueStr = inputs.fringeBenefitType === CalculationType.Percentage 
            ? `${inputs.fringeBenefitValue}%` 
            : formatCurrency(inputs.fringeBenefitValue);
        assumptions.push(['Beneficios Adicionales:', `${inputs.fringeBenefitType}, ${fringeValueStr}`]);
    }
    
    if (inputs.bonusType !== CalculationType.None) {
        const bonusValueStr = inputs.bonusType === CalculationType.Percentage 
            ? `${inputs.bonusValue}%` 
            : formatCurrency(inputs.bonusValue);
        assumptions.push(['Bono:', `${inputs.bonusType}, ${bonusValueStr}`]);
    }
    
    assumptions.push(
        ['Tasa de Descuento:', `${inputs.discountRate}%`],
        ['Año Inicio Descuento:', inputs.discountStartYear],
        ['Consumo Propio:', `${inputs.personalConsumptionPercentage}%`]
    );

    return assumptions;
};

export const exportToPdf = (
  results: CalculationYear[],
  inputs: CalculationInputs,
  totalLoss: number
) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text('Reporte de Cálculo de Pérdida de Ingresos', 14, 22);
  
  doc.setFontSize(12);
  doc.text('Resumen de Suposiciones', 14, 32);
  
  const assumptions = getAssumptions(inputs);
  autoTable(doc, {
      body: assumptions,
      startY: 36,
      theme: 'plain',
      styles: { fontSize: 9 },
      columnStyles: { 0: { fontStyle: 'bold' } }
  });

  const tableColumn = ["Año", "Edad", "Ingreso Bruto", "Consumo Propio", "Ingreso Neto", "Ingreso Descontado"];
  const tableRows = results.map(row => [
    row.year,
    row.age,
    formatCurrency(row.totalAnnualIncome),
    `(${formatCurrency(row.personalConsumption)})`,
    formatCurrency(row.netAnnualIncome),
    formatCurrency(row.discountedIncome)
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: (doc as any).lastAutoTable.finalY + 10,
    headStyles: { fillColor: [22, 160, 133] },
    didDrawCell: (data) => {
        if (data.section === 'body' && (data.column.index === 3)) {
            if (data.cell.styles.textColor !== '#e74c3c') {
              (doc as any).setTextColor('#e74c3c');
            }
        }
    }
  });
  
  const finalY = (doc as any).lastAutoTable.finalY;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Pérdida Total de Ingresos:', 14, finalY + 15);
  doc.text(formatCurrency(totalLoss), 205, finalY + 15, { align: 'right' });


  doc.save('calculo_lucro_cesante.pdf');
};

export const exportToExcel = (
  results: CalculationYear[],
  inputs: CalculationInputs,
  totalLoss: number
) => {
  const assumptions = getAssumptions(inputs);
  const header = ["Año", "Edad", "Ingreso", "Beneficios Adicionales", "Bono", "Ingreso Bruto Total", "Consumo Propio", "Ingreso Neto", "Ingreso Descontado"];

  const data = results.map(row => [
    row.year,
    row.age,
    row.income,
    row.fringeBenefits,
    row.bonus,
    row.totalAnnualIncome,
    row.personalConsumption,
    row.netAnnualIncome,
    row.discountedIncome
  ]);
  
  const assumptionsHeader = [['Resumen de Suposiciones']];
  const tableHeader = [header];
  const totalRow = [['Pérdida Total de Ingresos:', '', '', '', '', '', '', '', totalLoss]];

  const worksheetData = [
    ['Reporte de Cálculo de Pérdida de Ingresos'],
    [],
    ...assumptionsHeader,
    ...assumptions,
    [],
    ...tableHeader,
    ...data,
    [],
    ...totalRow
  ];

  const ws = XLSX.utils.aoa_to_sheet(worksheetData);
  
  const currencyFormat = '$#,##0.00';
  const dataStartRow = assumptions.length + 5;
  const dataEndRow = dataStartRow + data.length -1;
  const totalRowIndex = dataEndRow + 2;
  
  // Format currency columns in main data table
  for (let R = dataStartRow; R <= dataEndRow; ++R) {
    for (let C = 2; C <= 8; ++C) { // Columns C to I
        const cell_address = { c: C, r: R };
        const cell_ref = XLSX.utils.encode_cell(cell_address);
        if (ws[cell_ref]) {
          ws[cell_ref].t = 'n'; // Ensure type is number
          ws[cell_ref].z = currencyFormat;
        }
    }
  }

  // Format total loss cell
  const totalLossCellRef = XLSX.utils.encode_cell({c: 8, r: totalRowIndex});
  if (ws[totalLossCellRef]) {
    ws[totalLossCellRef].t = 'n';
    ws[totalLossCellRef].z = currencyFormat;
  }
  
  // Format amounts in assumptions
   assumptions.forEach((row, index) => {
    const value = row[1];
    if (typeof value === 'string' && value.startsWith('$')) {
      const cellRef = XLSX.utils.encode_cell({c: 1, r: 3 + index});
      if(ws[cellRef]) {
          ws[cellRef].t = 'n';
          ws[cellRef].v = parseFloat(value.replace(/[^0-9.-]+/g,""));
          ws[cellRef].z = currencyFormat;
      }
    }
  });


  // Set column widths
  ws['!cols'] = [
    { wch: 25 }, { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, 
    { wch: 20 }, { wch: 18 }, { wch: 18 }, { wch: 20 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Resultados');
  XLSX.writeFile(wb, 'calculo_lucro_cesante.xlsx');
};