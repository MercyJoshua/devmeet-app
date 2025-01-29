const express = require('express');
const pool = require('../config/db');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Create project
router.post('/create', async (req, res) => {
  const { title, description, projectType, startDate, endDate, projectTeam } = req.body;
  const userId = req.session?.user?.id;

  if (!title || !startDate || !endDate || !userId) {
    return res.status(400).json({
      message: 'Missing required fields',
      missingFields: { title: !title, startDate: !startDate, endDate: !endDate, userId: !userId },
    });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Insert project into 'projects' table
    const [result] = await connection.execute(
      `INSERT INTO projects (title, description, project_type, start_date, end_date, created_by) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description, projectType, startDate, endDate, userId]
    );

    const projectId = result.insertId;

    // Add the project creator to the 'project_team' table
    await connection.execute(
      `INSERT INTO project_team (project_id, email, role, specialization, added_at) 
       VALUES (?, ?, ?, ?, NOW())`,
      [projectId, req.session.user.email, 'Creator', 'Project Management']
    );

    // Add additional team members if the project is collaborative
    if (projectType === 'collaborative' && Array.isArray(projectTeam)) {
      const teamMemberValues = projectTeam
        .filter((member) => member.email && member.role)
        .map((member) => [
          projectId,
          member.email,
          member.role,
          member.specialization || 'General',
        ]);

        if (teamMemberValues.length > 0) {
          const placeholders = teamMemberValues.map(() => '(?, ?, ?, ?, NOW())').join(', ');
          const flattenedValues = teamMemberValues.flat();
          console.log('SQL:', `INSERT INTO project_team (project_id, email, role, specialization, added_at) VALUES ${placeholders}`);
          console.log('Values:', flattenedValues);
          await connection.execute(`INSERT INTO project_team (project_id, email, role, specialization, added_at) VALUES ${placeholders}`, flattenedValues, { multiple: true });
        }        
    }

    await connection.commit();
    res.status(201).json({ message: 'Project created successfully!', projectId });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Internal server error.' });
  } finally {
    connection.release();
  }
});


// FETCH PROJECTS FROM DB
router.get('/retrieve', async (req, res) => {
  const userId = req.session?.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }

  try {
    // Fetch projects for the current user
    const [projects] = await pool.execute(
      `SELECT 
         p.id, p.title, p.description, p.project_type, p.start_date, p.end_date, p.created_by, p.created_at
       FROM projects p
       WHERE p.created_by = ?
       ORDER BY p.created_at DESC`,
      [userId]
    );

    if (projects.length === 0) {
      return res.status(200).json([]);
    }

    // Generate placeholders for project IDs
    const projectIds = projects.map((project) => project.id);
    const placeholders = projectIds.map(() => '?').join(', ');

    // Fetch team members for all projects
    const [projectTeam] = await pool.query(
      `SELECT 
         pt.project_id, pt.email, pt.role, pt.specialization, pt.added_at, u.full_name 
       FROM project_team pt
       JOIN users u ON pt.email = u.email 
       WHERE pt.project_id IN (${placeholders})`,
      projectIds
    );

    // Format date helper function
    const formatDate = (date) => {
      if (date instanceof Date) {
        return date.toISOString().split('T')[0].split('-').reverse().join('-');
      } else {
        return date.split('-').reverse().join('-');
      }
    };

    // Map projects with their team members and team count
    const projectData = projects.map((project) => {
      const members = projectTeam.filter((member) => member.project_id === project.id);
      return {
        ...project,
        startDate: formatDate(project.start_date),
        endDate: formatDate(project.end_date),
        teamMembers: members, // Detailed member info for UI display
        teamMemberCount: members.length, // Member count for summary
      };
    });

    res.status(200).json(projectData);
  } catch (error) {
    console.error('Error retrieving projects:', error.message);
    res.status(500).json({ message: 'Failed to fetch projects.' });
  }
});

// Fetch project timeline and task events
router.get('/timeline-events', async (req, res) => {
  const userId = req.session?.user?.id;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized.' });
  }

  try {
    // Fetch the user's projects
    const [projects] = await pool.execute(
      `SELECT id, title, start_date, end_date 
       FROM projects 
       WHERE created_by = ?`,
      [userId]
    );

    if (projects.length === 0) {
      return res.status(404).json({ message: 'No projects found.' });
    }

    // Fetch tasks for each project
    const projectIds = projects.map(project => project.id);
    const placeholders = projectIds.map(() => '?').join(', ');

    const [tasks] = await pool.execute(
      `SELECT 
         id, project_id, title, start_date, due_date, status 
       FROM tasks 
       WHERE project_id IN (${placeholders})`,
      projectIds
    );

    // Combine project and task data for the Gantt chart
    const ganttData = projects.map(project => {
      // Add project as a task in the Gantt chart
      const projectTask = {
        id: `project_${project.id}`,
        text: project.title,
        start_date: project.start_date,
        end_date: project.end_date,
        type: 'project', // Mark as a project
      };

      // Add associated tasks for the project
      const projectTasks = tasks.filter(task => task.project_id === project.id).map(task => ({
        id: `task_${task.id}`,
        text: task.title,
        start_date: task.start_date,
        end_date: task.due_date,
        parent: `project_${project.id}`, // Link task to project
        status: task.status,  // Add task status for better tracking
      }));

      return [projectTask, ...projectTasks];
    }).flat();

    // Return the Gantt chart data in the correct format
    res.status(200).json(ganttData);
  } catch (error) {
    console.error('Error fetching project timeline events:', error);
    res.status(500).json({ message: 'Failed to fetch timeline events.' });
  }
});

// EDIT PROJECT
router.put('/edit/:projectId', async (req, res) => {
  const { projectId } = req.params;
  const { title, description, projectType, startDate, endDate } = req.body;
  const userId = req.session?.user?.id;

  // Check if any of the required fields are undefined
  if (!title || !startDate || !endDate || !userId) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  // Set default values for optional fields
  const desc = description || '';
  const projectTypeValue = projectType || '';

  try {
    const [result] = await pool.execute(
      `UPDATE projects SET title = ?, description = ?, project_type = ?, start_date = ?, end_date = ? WHERE id = ? AND created_by = ?`,
      [title, desc, projectTypeValue, startDate, endDate, projectId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Project not found or not authorized.' });
    }

    res.status(200).json({ message: 'Project updated successfully!' });
  } catch (error) {
    console.error('Error editing project:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// ARCHIVE PROJECT
router.put('/archive/:projectId', async (req, res) => {
  const { projectId } = req.params;
  const userId = req.session?.user?.id;

  try {
    const [result] = await pool.execute(
      `UPDATE projects 
       SET archived = TRUE 
       WHERE id = ? AND created_by = ?`,
      [projectId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Project not found or not authorized.' });
    }

    res.status(200).json({ message: 'Project archived successfully!' });
  } catch (error) {
    console.error('Error archiving project:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// DELETE PROJECT
router.delete('/delete/:projectId', async (req, res) => {
  const { projectId } = req.params;
  const userId = req.session?.user?.id;

  try {
    const [result] = await pool.execute(
      `DELETE FROM projects 
       WHERE id = ? AND created_by = ?`,
      [projectId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Project not found or not authorized.' });
    }

    res.status(200).json({ message: 'Project deleted successfully!' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;


