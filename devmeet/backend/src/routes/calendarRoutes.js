const express = require("express");
const pool = require("../config/db");
const router = express.Router();

// Utility function to fetch user/team IDs
const fetchParticipantIds = async (participants) => {
  const participantValues = [];
  for (const participant of participants) {
    let userId = null;
    let teamId = null;

    // Check if participant is a user
    const [userResult] = await pool.query(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [participant, participant]
    );
    if (userResult.length > 0) {
      userId = userResult[0].id;
    } else {
      // Check if participant is a team
      const [teamResult] = await pool.query(
        "SELECT id FROM teams WHERE name = ?",
        [participant]
      );
      if (teamResult.length > 0) {
        teamId = teamResult[0].id;
      }
    }

    // Skip invalid participants
    if (!userId && !teamId) continue;

    participantValues.push({ user_id: userId, team_id: teamId });
  }
  return participantValues;
};

// Add a new event
router.post("/events", async (req, res) => {
  const { title, description, start, end, allDay, participants } = req.body;

  // Validate session user
  if (!req.session.user || !req.session.user.id) {
    return res.status(401).json({ message: "Unauthorized: Missing session user." });
  }

  const userId = req.session.user.id;

  console.log("Session user:", req.session.user);
  console.log("Received payload:", req.body);

  // Validate required fields
  if (!title || !start || !end) {
    console.log("Validation failed:", { title, start, end });
    return res.status(400).json({ message: "Required fields are missing or invalid." });
  }

  try {
    console.log("Attempting to create event...");

    // Insert event into `calendar_events` table
    const [result] = await pool.query(
      `INSERT INTO calendar_events (user_id, title, description, start_time, end_time, all_day) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, title, description || null, start, end, allDay || 0]
    );

    const eventId = result.insertId;
    console.log("Event created with ID:", eventId);

    // Prepare participants to add
    let participantsToAdd = [];
    if (Array.isArray(participants) && participants.length > 0) {
      const participantValues = await fetchParticipantIds(participants);
      participantsToAdd = participantValues.map(({ user_id, team_id }) => [
        eventId,
        user_id || null,
        team_id || null,
        userId, // Event creator as `added_by`
      ]);
    }

    // Add the event creator as a participant
    participantsToAdd.push([eventId, userId, null, userId]);

    // Insert participants into `event_participants` table
    if (participantsToAdd.length > 0) {
      console.log("Adding participants:", participantsToAdd);
      await pool.query(
        `INSERT INTO event_participants (event_id, user_id, team_id, added_by) VALUES ?`,
        [participantsToAdd]
      );
    }

    res.status(201).json({ message: "Event added successfully.", event_id: eventId });
  } catch (error) {
    console.error("Error adding event:", error.message);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});


// Get events for a user or team within a date range
router.get('/events', async (req, res) => {
  const userId = req.session.user.id;

  try {
    // Fetch events where the user is a direct participant or a member of a participating team
    const [events] = await pool.query(`
      SELECT DISTINCT e.* 
      FROM calendar_events e
      LEFT JOIN event_participants ep ON e.id = ep.event_id
      LEFT JOIN team_members tm ON ep.team_id = tm.team_id
      WHERE ep.user_id = ? OR tm.user_id = ?
      ORDER BY e.start_time
    `, [userId, userId]);

    const formattedEvents = events.map(event => ({
      id: event.id,
      title: event.title,
      start: event.start_time,
      end: event.end_time,
      allDay: !!event.all_day, // Convert to boolean
    }));

    res.json(formattedEvents);
  } catch (err) {
    console.error('Error fetching events:', err.message);
    res.status(500).json({ message: 'Error fetching events.' });
  }
});

// Update an event and its participants
router.put("/events/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, start_time, end_time, all_day, participants } = req.body;

  if (!id || !Array.isArray(participants)) {
    return res.status(400).json({ message: "Event ID and participants are required." });
  }

  try {
    // Update the event details
    await pool.query(
      `UPDATE calendar_events 
       SET title = ?, description = ?, start_time = ?, end_time = ?, all_day = ? 
       WHERE id = ?`,
      [title, description || null, start_time, end_time, all_day || 0, id]
    );

    // Clear existing participants
    await pool.query(`DELETE FROM event_participants WHERE event_id = ?`, [id]);

    // Process updated participants and insert into event_participants
    const participantValues = await fetchParticipantIds(participants);
    const formattedValues = participantValues.map(({ user_id, team_id }) => [
      id,
      user_id || null,
      team_id || null,
      user_id, // `added_by` can be current user's ID
    ]);

    if (formattedValues.length > 0) {
      await pool.query(
        `INSERT INTO event_participants (event_id, user_id, team_id, added_by) VALUES ?`,
        [formattedValues]
      );
    }

    res.status(200).json({ message: "Event updated successfully." });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Delete an event
router.delete("/events/:id", async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Event ID is required." });
  }

  try {
    // Delete the event and its participants
    await pool.query(`DELETE FROM event_participants WHERE event_id = ?`, [id]);
    const [result] = await pool.query(`DELETE FROM calendar_events WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Event not found." });
    }

    res.status(200).json({ message: "Event deleted successfully." });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

module.exports = router;


