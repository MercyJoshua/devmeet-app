const express = require('express');
const pool = require('../config/db');
const router = express.Router();

// 1. Create a Team
router.post('/create', async (req, res) => {
  const { name, description, logo, tags, type } = req.body;
  const createdBy = req.session.user.id;

  try {
    const [rows] = await pool.execute(
      'INSERT INTO teams (name, description, logo, tags, type, created_by) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description, logo, JSON.stringify(tags), type, createdBy]
    );
    res.status(201).json({ team_id: rows.insertId, name });
  } catch (error) {
    res.status(500).json({ message: 'Error creating team', error });
  }
});


// Invite a Member to a Team
router.post('/:teamId/invite', async (req, res) => {
  const { teamId } = req.params;
  const { email, username, role } = req.body;
// Invite by email
  const findUserByEmail = async (email) => {
    const query = `SELECT id FROM users WHERE email = ?`;
    const [rows] = await pool.execute(query, [email]);
    return rows.length > 0 ? rows[0] : null;
  };
// Invite by username
const findUserByUsername = async (username) => {
  const query = `SELECT id FROM users WHERE username = ?`;
  const [rows] = await pool.execute(query, [username]);
  return rows.length > 0 ? rows[0] : null;
};
// Add user to team
const addUserToTeam = async (teamId, userId, role) => {
  const query = `
    INSERT INTO team_members (team_id, user_id, role)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE role = ?;
  `;
  await pool.execute(query, [teamId, userId, role, role]);
};

  if (!role || (!email && !username)) {
    return res.status(400).json({ message: "Role and either email or username are required." });
  }

  try {
    // Determine whether to find user by email or username
    const user = email
      ? await findUserByEmail(email)
      : await findUserByUsername(username);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Add user to team
    await addUserToTeam(teamId, user.id, role);

    return res.status(200).json({ message: "User invited successfully!" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred.", error: error.message });
  }
});
// Fetch Invite
router.get('/invites', async (req, res) => {
  const userId = req.session.user.id; 

  try {
    // Fetch invites for the user
    const query = `
      SELECT tm.id, u.full_name AS sender, t.name AS teamName, tm.role
      FROM team_members tm
      JOIN teams t ON tm.team_id = t.id
      JOIN users u ON t.created_by = u.id
      WHERE tm.user_id = ? AND tm.status = 'pending'; 
    `;

    const [invites] = await pool.execute(query, [userId]);

    res.json({ invites });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch invites.' });
  }
});
// RESPOND TO INVITE
/* Routes for invitees to accept or decline team invites */
// ACCEPT
router.post('/invites/accept', async (req, res) => {
  const { inviteId } = req.body;

  try {
    console.log("Request body:", req.session.user.id); 
    // Validate inviteId
    if (!inviteId || isNaN(inviteId)) {
      return res.status(400).json({ message: 'Invalid invite ID.' });
    }
    const query = `
      UPDATE team_members 
      SET status = 'active' 
      WHERE id = ? AND status = 'pending';
    `;

    const [result] = await pool.execute(query, [inviteId]);

    //console.log("Update result:", result);

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'Invite not found or already handled.' });
    }

    res.json({ message: 'Invite accepted successfully.' });
  } catch (err) {
    console.error("Error accepting invite:", err.message, err.stack);
    res.status(500).json({ message: 'Failed to accept invite.' });
  }
});

// DECLINE
router.post('/invites/decline', async (req, res) => {
  const { inviteId } = req.body;

  try {
    const query = `
      DELETE FROM team_members 
      WHERE id = ? AND status = 'pending';
    `;

    const [result] = await pool.execute(query, [inviteId]);

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: 'Invite not found or already handled.' });
    }

    res.json({ message: 'Invite declined successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to decline invite.' });
  }
});

// REMOVE A TEAM MEMBERS
router.post("/:teamId/remove", async (req, res) => {
  const { userId } = req.body;
  const { teamId } = req.params;

  try {
    const result = await pool.query(
      "UPDATE team_members SET status = 'Removed' WHERE user_id = ? AND team_id = ?",
      [userId, teamId]
    );

    if (result.affectedRows > 0) {
      return res.status(200).json({ message: "Member removed successfully." });
    }

    res.status(404).json({ message: "Member not found or already removed." });
  } catch (error) {
    res.status(500).json({ message: "Failed to remove member.", error });
  }
});

 // Get all teams
router.get('/all', async (req, res) => {
  const userId = req.session?.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: User not logged in' });
  }

  try {
    const [teams] = await pool.execute(
      `SELECT DISTINCT t.id, t.name, t.description, t.logo, t.tags, t.type
       FROM teams t
       LEFT JOIN team_members tm ON t.id = tm.team_id
       WHERE t.created_by = ? OR tm.user_id = ?`,
      [userId, userId]
    );

    if (teams.length === 0) {
      return res.status(404).json({ error: 'No teams found for this user' });
    }

    const detailedTeams = await Promise.all(
      teams.map(async (team) => {
        const [members] = await pool.execute(
          "SELECT u.id, u.username, u.full_name, tm.role FROM team_members tm JOIN users u ON tm.user_id = u.id WHERE tm.team_id = ?",
          [team.id]
        );
        const [services] = await pool.execute(
          'SELECT * FROM services WHERE team_id = ?',
          [team.id]
        );
        const [portfolios] = await pool.execute(
          'SELECT * FROM portfolios WHERE team_id = ?',
          [team.id]
        );
    
        return { ...team, members, services, portfolios };
      })
    );    

    res.status(200).json(detailedTeams);
  } catch (error) {
    console.error('Error fetching user teams:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get specific team details by ID
router.get('/:id', async (req, res) => {
  const teamId = req.params.id;
  const userId = req.session?.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: User not logged in' });
  }

  try {
    // Fetch team details
    const [teamDetails] = await pool.execute(
      `SELECT t.id, t.name, t.description, t.logo, t.tags, t.type, t.created_by
       FROM teams t
       WHERE t.id = ? AND (t.created_by = ? OR EXISTS (
         SELECT 1 FROM team_members tm WHERE tm.team_id = t.id AND tm.user_id = ?
       ))`,
      [teamId, userId, userId]
    );

    if (teamDetails.length === 0) {
      return res.status(404).json({ error: 'Team not found or access denied' });
    }

    const team = teamDetails[0];

    // Normalize tags to be an array
    team.tags = team.tags ? team.tags.split(',').map(tag => tag.trim()) : [];

    // Fetch team members
    const [members] = await pool.execute(
      `SELECT u.id, u.username, u.full_name, tm.role
       FROM team_members tm
       JOIN users u ON tm.user_id = u.id
       WHERE tm.team_id = ?`,
      [teamId]
    );

    // Fetch team services
    const [services] = await pool.execute(
      'SELECT * FROM services WHERE team_id = ?',
      [teamId]
    );

    // Fetch team portfolios
    const [portfolios] = await pool.execute(
      'SELECT * FROM portfolios WHERE team_id = ?',
      [teamId]
    );

    // Return detailed team information
    res.status(200).json({ ...team, members, services, portfolios });
  } catch (error) {
    console.error('Error fetching team details:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// 3. Accept or Decline Invitation
router.put('/:team_id/member/:user_id/response', async (req, res) => {
  const { team_id, user_id } = req.params;
  const { status } = req.body;

  try {
    if (status !== 'Accepted' && status !== 'Declined') {
      return res.status(400).json({ message: 'Invalid status, must be "Accepted" or "Declined"' });
    }

    const [existingMember] = await pool.execute(
      'SELECT * FROM team_members WHERE team_id = ? AND user_id = ? AND status = "Invited"',
      [team_id, user_id]
    );

    if (existingMember.length === 0) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    await pool.execute(
      'UPDATE team_members SET status = ? WHERE team_id = ? AND user_id = ?',
      [status, team_id, user_id]
    );

    res.status(200).json({ message: `Invitation ${status.toLowerCase()} successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Error updating invitation status', error });
  }
});
// Update Team Details
router.put('/:teamId', async (req, res) => {
  const { teamId } = req.params;
  const { name, description, logo, tags, type } = req.body;

  try {
    const [result] = await pool.execute(
      'UPDATE teams SET name = ?, description = ?, logo = ?, tags = ?, type = ? WHERE id = ?',
      [name, description, logo, JSON.stringify(tags), type, teamId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.status(200).json({ message: 'Team updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating team', error });
  }
});

// 4. Add a Service to a Team
router.post('/:team_id/services', async (req, res) => {
  const { team_id } = req.params;
  const { service_name } = req.body;

  try {
    await pool.execute(
      'INSERT INTO services (team_id, service_name) VALUES (?, ?)',
      [team_id, service_name]
    );
    res.status(200).json({ message: 'Service added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding service', error });
  }
});

// 5. Add a Portfolio Item
router.post('/:team_id/portfolio', async (req, res) => {
  const { team_id } = req.params;
  const { project_name, project_description, project_link } = req.body;

  try {
    await pool.execute(
      'INSERT INTO portfolios (team_id, project_name, project_description, project_link) VALUES (?, ?, ?, ?)',
      [team_id, project_name, project_description, project_link]
    );
    res.status(200).json({ message: 'Portfolio item added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding portfolio item', error });
  }
});

// 6. Search for Teams by Service
router.get('/search', async (req, res) => {
  const { type, tag } = req.query;

  try {
    let query = 'SELECT id, name, description, logo, tags, type FROM teams WHERE 1=1';
    const params = [];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    if (tag) {
      query += ' AND JSON_CONTAINS(tags, JSON_QUOTE(?))';
      params.push(tag);
    }

    const [teams] = await pool.execute(query, params);
    res.status(200).json({ teams });
  } catch (error) {
    res.status(500).json({ message: 'Error searching for teams', error });
  }
});


module.exports = router;
