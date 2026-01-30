import pool from "../db.js";

export async function getTraineeGrades(req, res) {
  try {
    // Fetches grades from the view
    const result = await pool.query(
      `SELECT 
        trainee_id,
        trainee_name,
        batch_name,
        assessment_title,
        raw_score
       FROM trainer_grades_view
       ORDER BY batch_name, trainee_name`
    );

    const traineesMap = {};

    result.rows.forEach(row => {
      // Unique key combining ID and Batch to handle trainees in multiple batches
      const key = `${row.trainee_id}_${row.batch_name}`;
      
      if (!traineesMap[key]) {
        traineesMap[key] = {
          trainee_id: row.trainee_id,
          name: row.trainee_name,
          batch: row.batch_name,
          practiceExam: null,
          activity: null,
          courseEndExam: null,
          oralExam: null,
          skillCheck: null,
          dailyQuiz: null,
          homework: null,
          exercises: null,
          mockExam: null
        };
      }

      const title = row.assessment_title.toLowerCase().replace(/[^a-z]/g, "");
      const score = row.raw_score !== null ? Number(row.raw_score) : null;

      // Logic: If multiple attempts exist, we keep the highest score
      const updateIfHigher = (field) => {
        if (score !== null && (traineesMap[key][field] === null || score > traineesMap[key][field])) {
          traineesMap[key][field] = score;
        }
      };

      if (title.includes("practice") && title.includes("exam")) updateIfHigher("practiceExam");
      else if (title.includes("activity")) updateIfHigher("activity");
      else if (title.includes("courseend") || (title.includes("course") && title.includes("end"))) updateIfHigher("courseEndExam");
      else if (title.includes("oral") && title.includes("exam")) updateIfHigher("oralExam");
      else if (title.includes("skill") && title.includes("check")) updateIfHigher("skillCheck");
      else if (title.includes("daily") && title.includes("quiz")) updateIfHigher("dailyQuiz");
      else if (title.includes("homework")) updateIfHigher("homework");
      else if (title.includes("exercise")) updateIfHigher("exercises");
      else if (title.includes("mock") && title.includes("exam")) updateIfHigher("mockExam");
    });

    res.json(Object.values(traineesMap));
  } catch (err) {
    console.error("getTraineeGrades error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}