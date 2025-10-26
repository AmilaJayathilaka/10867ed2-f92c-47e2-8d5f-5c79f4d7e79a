import fs from "fs";
import { generateProgressReport } from "../reports/progressReport.js";

describe("Progress report gneration", () => {
  test("should generate a non-empty PDF file", async () => {
    const student1 = {
        id: "student1",
        firstName: "Tony",
        lastName: "Stark",
        yearLevel: 6
    };

    // files in current folder before generation
    const filesBefore = fs.readdirSync(process.cwd());

    await generateProgressReport(student1);

    // wait a bit for the PDF to be fully written
    setTimeout(() => {
      const filesAfter = fs.readdirSync(process.cwd());

      // find new file
      const newFiles = filesAfter.filter(f => !filesBefore.includes(f) && f.endsWith(".pdf"));
      expect(newFiles.length).toBe(1);

      // file is not empty
      const stats = fs.statSync(newFiles[0]);
      expect(stats.size).toBeGreaterThan(0);
    }, 100);

  });
});
