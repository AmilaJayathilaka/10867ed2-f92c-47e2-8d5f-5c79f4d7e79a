import moment from 'moment';
import PDFDocument from "pdfkit";
import fs from "fs";
import { formatDate,loadJSON } from '../utils/helpers.js';

function generateReport(reportData){
  const { student, assessmentName, latestCompletedDate, correctCount, totalQuestions, wrongResponses } = reportData;
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(`${student.firstName}_Feedback_Report_${moment().unix()}.pdf`));

  doc.text(`${student.firstName} ${student.lastName} recently completed ${assessmentName} assessment on ${formatDate(latestCompletedDate)}`);
  doc.text(`He got ${correctCount} questions right out of ${totalQuestions}. Feedback for wrong answers given below`);
  doc.moveDown();

  wrongResponses.forEach((r) => {
    doc.text(`Question: ${r.question.stem}`);
    doc.text(`Your answer: ${r.chosenOption.label} with value ${r.chosenOption.value}`);
    doc.text(`Right answer: ${r.correctOption.label} with value ${r.correctOption.value}`);
    doc.text(`Hint: ${r.question.config.hint}`);
    doc.moveDown();
  });
  doc.end();
}

export async function generateFeedbackReport(student) {
  try {
    const responses = await loadJSON('student-responses.json');
    const assessments = await loadJSON('assessments.json');
    const questions = await loadJSON('questions.json');

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
      const correctOption = question.config.options.find((o) => o.id === question.config.key);
      const chosenOption = question.config.options.find((o) => o.id === r.response);
      const correct = question.config.key === r.response;

      return { question, correct, chosenOption, correctOption };
    });

    const correctCount = detailedResponses.filter((r) => r.correct).length;
    const wrongResponses = detailedResponses.filter((r) => !r.correct);
    const assessmentName = assessment.name;
    const latestCompletedDate = latest.completed;

    const reportData = { student, assessmentName, latestCompletedDate, correctCount, totalQuestions, wrongResponses }
    generateReport(reportData);
  } catch (error) {
    throw new Error('Feedback report generation error.');
  }  
}
