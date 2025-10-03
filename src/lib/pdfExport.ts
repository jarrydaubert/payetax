// src/lib/pdfExport.ts
// PDF export functionality - kept separate to enable lazy loading

import type { TaxCalculationResults } from '@/lib/taxCalculator';
import { formatCurrency } from '@/lib/utils';

export interface ExportData {
  results: TaxCalculationResults;
  salary: number;
  taxYear: string;
  taxCode: string;
  region: string;
  studentLoans: string[];
  exportDate: string;
}

export async function generatePDF(data: ExportData): Promise<void> {
  try {
    // Dynamically import jsPDF only when needed to reduce bundle size
    const { jsPDF } = await import(/* webpackChunkName: "jspdf" */ 'jspdf');

    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const { results, salary, taxYear, taxCode, region, studentLoans, exportDate } = data;

    // Set up styling
    const primaryColor = [99, 102, 241]; // Purple
    const textColor = [51, 51, 51]; // Dark gray
    const lightGray = [156, 163, 175];

    // Header with branding
    pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.rect(0, 0, 297, 25, 'F'); // Full width header

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PayeTax', 20, 15);

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'normal');
    pdf.text('UK Tax Calculator Results', 20, 21);

    pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
    pdf.setFontSize(10);
    pdf.text(`Generated on ${exportDate}`, 220, 21);

    let yPos = 35;

    // Input Details Section
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text('Input Details', 20, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(textColor[0], textColor[1], textColor[2]);

    const inputDetails = [
      ['Gross Salary:', formatCurrency(salary)],
      ['Tax Year:', taxYear],
      ['Tax Code:', taxCode || '1257L'],
      ['Region:', region],
      ['Student Loans:', studentLoans.join(', ') || 'None'],
    ];

    for (const [label, value] of inputDetails) {
      pdf.text(label, 20, yPos);
      pdf.text(value, 80, yPos);
      yPos += 5;
    }

    yPos += 5;

    // Results Table
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text('Tax Calculation Results', 20, yPos);
    yPos += 8;

    // Table headers
    pdf.setFillColor(248, 249, 250);
    pdf.rect(20, yPos - 4, 250, 8, 'F');

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
    pdf.text('Description', 25, yPos);
    pdf.text('Annual', 120, yPos);
    pdf.text('Monthly', 170, yPos);
    pdf.text('Weekly', 220, yPos);
    yPos += 10;

    // Table rows
    const tableData = [
      [
        'Gross Salary',
        results.grossSalary.annually,
        results.grossSalary.monthly,
        results.grossSalary.weekly,
      ],
      [
        'Income Tax',
        -results.incomeTax.annually,
        -results.incomeTax.monthly,
        -results.incomeTax.weekly,
      ],
      [
        'National Insurance',
        -results.nationalInsurance.annually,
        -results.nationalInsurance.monthly,
        -results.nationalInsurance.weekly,
      ],
    ];

    if (results.pensionContribution.annually > 0) {
      tableData.push([
        'Pension Contribution',
        -results.pensionContribution.annually,
        -results.pensionContribution.monthly,
        -results.pensionContribution.weekly,
      ]);
    }

    if (results.studentLoan.annually > 0) {
      tableData.push([
        'Student Loan Repayment',
        -results.studentLoan.annually,
        -results.studentLoan.monthly,
        -results.studentLoan.weekly,
      ]);
    }

    pdf.setFont('helvetica', 'normal');
    for (const [description, annual, monthly, weekly] of tableData) {
      const isNegative = (annual as number) < 0;
      if (isNegative) {
        pdf.setTextColor(220, 38, 38);
      } else {
        pdf.setTextColor(textColor[0], textColor[1], textColor[2]);
      }

      pdf.text(description as string, 25, yPos);
      pdf.text(formatCurrency(Math.abs(annual as number)), 120, yPos);
      pdf.text(formatCurrency(Math.abs(monthly as number)), 170, yPos);
      pdf.text(formatCurrency(Math.abs(weekly as number)), 220, yPos);
      yPos += 6;
    }

    // Net pay (highlighted)
    yPos += 3;
    pdf.setFillColor(240, 253, 244);
    pdf.rect(20, yPos - 4, 250, 8, 'F');

    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(22, 163, 74); // Green
    pdf.text('Net Take-Home Pay', 25, yPos);
    pdf.text(formatCurrency(results.netPay.annually), 120, yPos);
    pdf.text(formatCurrency(results.netPay.monthly), 170, yPos);
    pdf.text(formatCurrency(results.netPay.weekly), 220, yPos);
    yPos += 15;

    // Tax Rate Summary
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    pdf.text('Tax Rate Summary', 20, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(textColor[0], textColor[1], textColor[2]);

    const effectiveRate = (
      ((results.incomeTax.annually + results.nationalInsurance.annually) /
        results.grossSalary.annually) *
      100
    ).toFixed(1);
    const incomeTaxRate = (
      (results.incomeTax.annually / results.grossSalary.annually) *
      100
    ).toFixed(1);
    const niRate = (
      (results.nationalInsurance.annually / results.grossSalary.annually) *
      100
    ).toFixed(1);

    const rateDetails = [
      ['Effective Tax Rate:', `${effectiveRate}%`],
      ['Income Tax Rate:', `${incomeTaxRate}%`],
      ['National Insurance Rate:', `${niRate}%`],
    ];

    for (const [label, value] of rateDetails) {
      pdf.text(label, 20, yPos);
      pdf.text(value, 80, yPos);
      yPos += 5;
    }

    // Footer
    pdf.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    pdf.setFontSize(8);
    pdf.text('Generated by PayeTax UK Tax Calculator - https://payetax.co.uk', 20, 190);
    pdf.text(`Results calculated using official HMRC rates for ${taxYear}`, 20, 195);

    // Save the PDF
    const filename = `tax-calculation-${taxYear.replace('/', '-')}-${Date.now()}.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw error;
  }
}
