const express = require("express");
const pool = require("../config/db");

const router = express.Router();

// Get all tasks for a project
router.get("/tasks", async (req, res) => {
  const { project_id } = req.query;

  try {
    const [tasks] = await pool.query(
      "SELECT * FROM gantt_tasks WHERE project_id = ?",
      [project_id]
    );
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Add a new task
router.post("/tasks", async (req, res) => {
  const { project_id, text, start_date, duration, progress } = req.body;

  try {
    await pool.query(
      "INSERT INTO gantt_tasks (project_id, text, start_date, duration, progress) VALUES (?, ?, ?, ?, ?)",
      [project_id, text, start_date, duration, progress]
    );
    res.status(201).json({ message: "Task added successfully." });
  } catch (error) {
    console.error("Error adding task:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Update an existing task
router.put("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { text, start_date, duration, progress } = req.body;

  try {
    await pool.query(
      "UPDATE gantt_tasks SET text = ?, start_date = ?, duration = ?, progress = ? WHERE id = ?",
      [text, start_date, duration, progress, id]
    );
    res.status(200).json({ message: "Task updated successfully." });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Delete a task
router.delete("/tasks/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query("DELETE FROM gantt_tasks WHERE id = ?", [id]);
    res.status(200).json({ message: "Task deleted successfully." });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

module.exports = router;
