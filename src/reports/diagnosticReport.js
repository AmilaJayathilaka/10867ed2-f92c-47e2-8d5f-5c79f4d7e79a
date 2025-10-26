import moment from 'moment';
import PDFDocument from "pdfkit";
import fs from "fs";
import { formatDate, loadJSON } from '../utils/helpers.js';

function generateReport(reportData){
  const { student, assessmentName, latestCompletedDate, correctCount, totalQuestions, byStrand } = reportData;
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(`${student.firstName}_Diagnostic_Report_${moment().unix()}.pdf`));

  doc.text(
    `${student.firstName} ${student.lastName} recently completed ${assessmentName} assessment on ${formatDate(latestCompletedDate)}`
  );
  doc.text(`He got ${correctCount} questions right out of ${totalQuestions}. Details by strand given below:`);
  doc.moveDown();

  for (const [strand, result] of Object.entries(byStrand)) {
    doc.text(`${strand}: ${result.correct} out of ${result.total} correct`);
  }
  doc.end();
}

function groupByStrand(responses) {
  const strandMap = {};

  responses.forEach((r) => {
    const strand = r.strand;
    if (!strandMap[strand]) {
      strandMap[strand] = { total: 1, correct: 0 };
    }else{
      strandMap[strand].total += 1;
    }

    if (r.correct) {
      strandMap[strand].correct += 1;
    }
  });

  return strandMap;
}

export async function generateDiagnosticReport(student) {
  try {
    const responses = await loadJSON('student-responses.json');
    const assessments = await loadJSON('assessments.json');
    const questions = await loadJSON('questions.json');

    //get completed assessments
    const completed = responses
      .filter((r) => r.student.id === student.id && r.completed)
      .sort((a, b) => moment(b.completed, "DD/MM/YYYY HH:mm:ss").diff(moment(a.completed, "DD/MM/YYYY HH:mm:ss")));

    if (completed.length === 0) {
      console.log('No completed assessments found.');
      return;
    }

    const latest = completed[0];
    const assessment = assessments.find((a) => a.id === latest.assessmentId);
    const totalQuestions = assessment.questions.length;

    const detailedResponses = latest.responses.map((r) => {
      const question = questions.find((q) => q.id === r.questionId);
      return {
        ...r,
        correct: question.config.key === r.response,
        strand: question.strand,
      };
    });

    const correctCount = detailedResponses.filter((r) => r.correct).length;
    const byStrand = groupByStrand(detailedResponses);
    const assessmentName = assessment.name;
    const latestCompletedDate = latest.completed;

    const reportData = { student, assessmentName, latestCompletedDate, correctCount, totalQuestions, byStrand }
    generateReport(reportData);
  } catch (error) {
    throw new Error('Diagnostic report generation error.');
  }
}
