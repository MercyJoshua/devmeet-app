const express = require('express');
const pool = require('../config/db'); // MySQL connection setup
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Ensure the 'uploads' directory exists
    },
    filename: (_req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`); // Unique filename
    },
});

const upload = multer({ storage });

// Create a new message with optional file attachments
router.post('/send', upload.array('files', 5), async (req, res) => {
    const { senderId, receiverId, content, messageType = 'text' } = req.body;

    // Validate required fields
    if (!senderId || !receiverId || (!content && !req.files?.length)) {
        return res.status(400).json({ error: 'Missing required fields: senderId, receiverId, or content/files' });
    }

    const files = req.files ? req.files.map(file => file.path) : []; // Get file paths
    const timestamp = new Date(); // Use server timestamp for consistency

    try {
        const query = `
            INSERT INTO messages (sender_id, receiver_id, content, timestamp, message_type, files)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await pool.execute(query, [
            senderId,
            receiverId,
            content || null,
            timestamp,
            messageType,
            JSON.stringify(files),
        ]);

        res.status(201).json({
            message: 'Message sent successfully',
            data: { messageId: result.insertId },
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Get recent chats for a user
router.get('/chats', async (req, res) => {
    const { userId } = req.query; // Assume userId is passed as a query parameter

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const query = `
            SELECT sender_id, receiver_id, content, timestamp
            FROM messages
            WHERE sender_id = ? OR receiver_id = ?
            GROUP BY sender_id, receiver_id
            ORDER BY timestamp DESC
        `;
        const [chats] = await pool.query(query, [userId, userId]);

        res.status(200).json({ data: chats });
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ error: 'Failed to fetch chats' });
    }
});

// Get all messages between two users
router.get('/receive/:user1/:user2', async (req, res) => {
    const { user1, user2 } = req.params;

    try {
        const query = `
            SELECT * FROM messages
            WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
            ORDER BY timestamp ASC
        `;
        const [messages] = await pool.query(query, [user1, user2, user2, user1]);

        res.status(200).json({ data: messages });
    } catch (error) {
        console.error('Error retrieving messages:', error);
        res.status(500).json({ error: 'Failed to retrieve messages' });
    }
});
// Create a new chat between two users
router.post('/chats/create', async (req, res) => {
    const { user1Id, user2Id } = req.body;

    if (!user1Id || !user2Id) {
        return res.status(400).json({ error: 'Both user IDs are required' });
    }

    try {
        // Validate that both users exist
        const userCheckQuery = `SELECT id FROM users WHERE id IN (?, ?)`;
        const [users] = await pool.query(userCheckQuery, [user1Id, user2Id]);

        if (users.length !== 2) {
            return res.status(404).json({ error: 'One or both users not found' });
        }

        // Check if the chat already exists
        const checkQuery = `
            SELECT id FROM chats
            WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
        `;
        const [existingChat] = await pool.query(checkQuery, [user1Id, user2Id, user2Id, user1Id]);

        if (existingChat.length) {
            return res.status(409).json({ message: 'Chat already exists between these users' });
        }

        // Create a new chat session
        const insertQuery = `
            INSERT INTO chats (user1_id, user2_id, chat_type)
            VALUES (?, ?, 'one-on-one')
        `;
        const [result] = await pool.execute(insertQuery, [user1Id, user2Id]);

        res.status(201).json({
            message: 'Chat created successfully',
            chatId: result.insertId,
        });
    } catch (error) {
        console.error('Error creating chat:', error);
        res.status(500).json({ error: 'Failed to create chat' });
    }
});
// Search for users, teams or project teams by username or email
router.get('/search', async (req, res) => {
    const { searchQuery } = req.query;

    if (!searchQuery) {
        return res.status(400).json({ error: 'Search query is required' });
    }

    try {
        const userQuery = `
            SELECT id, username, full_name, email, 'user' AS type
            FROM users
            WHERE username LIKE ? OR email LIKE ? OR full_name LIKE ?
        `;
        const teamQuery = `
            SELECT id, name AS name, description, 'team' AS type
            FROM teams
            WHERE name LIKE ?
        `;
        const projectTeamQuery = `
            SELECT id, title AS name, description, 'project' AS type
            FROM projects
            WHERE title LIKE ?
        `;

        const [users] = await pool.query(userQuery, [`%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`]);
        const [teams] = await pool.query(teamQuery, [`%${searchQuery}%`]);
        const [projectTeams] = await pool.query(projectTeamQuery, [`%${searchQuery}%`]);

        const results = [...users, ...teams, ...projectTeams];

        res.status(200).json({ data: results });
    } catch (error) {
        console.error('Error searching:', error);
        res.status(500).json({ error: 'Failed to search' });
    }
});

// Get a single message by ID
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [messages] = await pool.query('SELECT * FROM messages WHERE id = ?', [id]);

        if (!messages.length) {
            return res.status(404).json({ error: 'Message not found' });
        }

        res.status(200).json({ data: messages[0] });
    } catch (error) {
        console.error('Error retrieving message:', error);
        res.status(500).json({ error: 'Failed to retrieve message' });
    }
});

// Delete a message
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM messages WHERE id = ?', [id]);

        if (!result.affectedRows) {
            return res.status(404).json({ error: 'Message not found' });
        }

        res.status(200).json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ error: 'Failed to delete message' });
    }
});

module.exports = router;
