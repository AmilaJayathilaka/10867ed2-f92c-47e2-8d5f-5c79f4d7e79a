import readlineSync from 'readline-sync';
import { generateDiagnosticReport } from './reports/diagnosticReport.js';
import { generateProgressReport } from './reports/progressReport.js';
import { generateFeedbackReport } from './reports/feedbackReport.js';
import { loadJSON } from './utils/helpers.js';

export async function runGenerateReport() {
  const students = await loadJSON('students.json');
  console.log('Please enter the following');

  try {
    const studentId = readlineSync.question('Student ID: ');
    const student = students.find((s) => s.id === studentId);
    if (!student) throw new Error('Student not found.');

    const reportType = readlineSync.keyIn('Report to generate (1 for Diagnostic, 2 for Progress, 3 for Feedback): ', {
        limit: [1, 2, 3]
    });

    switch (reportType) {
      case '1':
        await generateDiagnosticReport(student);
        break;
      case '2':
        await generateProgressReport(student);
        break;
      case '3':
        await generateFeedbackReport(student);
        break;
      default:
        console.log('Invalid report type. Please enter 1, 2, or 3.');
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

runGenerateReport();


