const express = require('express');
const pool = require('../config/db');
const router = express.Router();
const multer = require('multer');
const upload = multer();

router.post('/create', upload.none(), async (req, res) => {
  const {
    title,
    description,
    priority = 'low',
    project,
    assignee,
    startDate,
    dueDate,
    visibility = 'transparent',
    files = [],
    status = 'todo',
  } = JSON.parse(req.body.taskData); // Parse the task data

  if (!title || !project) {
    return res.status(400).json({ error: 'Title and project are required.' });
  }

  // Step 1: Retrieve user ID for the assignee
  let assigneeId = null;
  if (assignee) {
    try {
      const [user] = await pool.query('SELECT id FROM users WHERE email = ?', [assignee]);

      if (user.length === 0) {
        return res.status(400).json({ error: 'Assignee email does not exist in the system.' });
      }

      assigneeId = user[0].id; // Get the user ID from the database
    } catch (error) {
      console.error('Error fetching assignee:', error);
      return res.status(500).json({ error: 'Error fetching assignee details.' });
    }
  }

  // Step 2: Proceed with task creation
  const userId = req.session?.user?.id; // For authentication

  try {
    const query = `
      INSERT INTO tasks (title, description, priority, project_id, assignee_id, start_date, due_date, visibility, files, status, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      title,
      description || null,
      priority,
      project,
      assigneeId,  // Insert the assignee_id
      startDate || null,
      dueDate || null,
      visibility,
      JSON.stringify(files),
      status,
      userId,  // Include the user who created the task (using session)
    ]);

    res.status(201).json({ message: 'Task created successfully', taskId: result.insertId });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Retrieve all tasks (with pagination)
router.get('/retrieve', async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Default to 10 tasks per page
  const offset = (page - 1) * limit;

  console.log('Session data on /retrieve:', req.session);
  const userId = req.session?.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const [tasks] = await pool.query(`
      SELECT t.*, pt.role, pt.email, t.created_by 
      FROM tasks t
      JOIN project_team pt ON t.project_id = pt.project_id
      WHERE 
  (pt.email = ? OR t.assignee_id = ? OR t.created_by = ?)
  AND t.visibility = 'transparent' 
      ORDER BY t.created_at DESC
      LIMIT ? OFFSET ?
    `, [userId, userId, userId, parseInt(limit), parseInt(offset)]);

    // console.log('Fetched tasks for user:', userId);
    // console.log('Tasks:', tasks); // Log the retrieved tasks

    // Log the retrieved tasks
    res.status(200).json(tasks);
  } catch (error) {
    console.error('Error retrieving tasks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Retrieve a single task by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [tasks] = await pool.query(`SELECT * FROM tasks WHERE id = ?`, [id]);

    if (tasks.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json(tasks[0]);
  } catch (error) {
    console.error('Error retrieving task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a task
router.put('/edit/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description, priority, project, assignee, startDate, dueDate, visibility, files, status } = req.body;

  if (!title || !project || !assignee) {
    return res.status(400).json({ error: 'Title, project, and assignee are required.' });
  }

  try {
    const [result] = await pool.query(`
      UPDATE tasks 
      SET title = ?, description = ?, priority = ?, project_id = ?, assignee_id = ?, start_date = ?, due_date = ?, visibility = ?, files = ?, status = ?
      WHERE id = ?
    `, [title, description || null, priority, project, assignee, startDate || null, dueDate || null, visibility, JSON.stringify(files), status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({ message: 'Task updated successfully' });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reassign a task
router.patch('/:id/reassign', async (req, res) => {
  const { id } = req.params;
  const { assignee } = req.body;

  if (!assignee) {
    return res.status(400).json({ error: 'Assignee is required.' });
  }

  try {
    const [result] = await pool.query(`UPDATE tasks SET assignee_id = ? WHERE id = ?`, [assignee, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({ message: 'Task reassigned successfully' });
  } catch (error) {
    console.error('Error reassigning task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a task
router.delete('/delete/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(`DELETE FROM tasks WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
