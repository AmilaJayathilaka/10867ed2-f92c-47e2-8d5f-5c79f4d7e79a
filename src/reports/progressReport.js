import moment from 'moment';
import PDFDocument from "pdfkit";
import fs from "fs";
import { loadJSON } from '../utils/helpers.js';

function generateReport(reportData){
  const {student, assessmentName, completed, totalQuestions} = reportData;
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(`${student.firstName}_Progress_Report_${moment().unix()}.pdf`));
  
  doc.text(`${student.firstName} ${student.lastName} has completed ${assessmentName} assessment ${completed.length} times in total. Date and raw score given below:`);
  doc.moveDown();

  completed.forEach((c) => {
    const date = moment(c.assigned, "DD/MM/YYYY HH:mm:ss").format("Do MMMM YYYY");
    doc.text(`Date: ${date}, Raw Score: ${c.results.rawScore} out of ${totalQuestions}`);
  });
  doc.moveDown();

  const progress = completed[completed.length - 1].results.rawScore - completed[0].results.rawScore;
  doc.text(`${student.firstName} ${student.lastName} got ${progress} more correct in the recent completed assessment than the oldest`);
  doc.end();
}

export async function generateProgressReport(student) {
  try {
    const responses = await loadJSON('student-responses.json');
    const assessments = await loadJSON('assessments.json');

    //get completed assessments
    const completed = responses
      .filter((r) => r.student.id === student.id && r.completed)
      .sort((a, b) => moment(a.completed, "DD/MM/YYYY HH:mm:ss").diff(moment(b.completed, "DD/MM/YYYY HH:mm:ss")));

    if (completed.length === 0) {
      console.log('No completed assessments found.');
      return;
    }

    const assessment = assessments.find((a) => a.id === completed[0].assessmentId);
    const totalQuestions = assessment.questions.length;
    const assessmentName = assessment.name;

    const reportData = { student, assessmentName, completed, totalQuestions }
    generateReport(reportData);
  } catch (error) {
    throw new Error('Progress report generation error.');
  }
}
