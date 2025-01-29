const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../config/db");

const router = express.Router();

// User registration route
router.post("/register", async (req, res) => {
  const { full_name, username, email, password_hash } = req.body;

  try {
    if (!full_name || !username || !email || !password_hash) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const [existingUser] = await pool.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Username or email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password_hash, 10);

    const [result] = await pool.query(
      "INSERT INTO users (full_name, username, email, password_hash) VALUES (?, ?, ?, ?)",
      [full_name, username, email, hashedPassword]
    );

   // Automatically log in the user by fetching the newly created user's details
const [newUser] = await pool.query("SELECT * FROM users WHERE id = ?", [result.insertId]);

req.session.user = {
  id: newUser[0].id,
  full_name: newUser[0].full_name,
  username: newUser[0].username,
  email: newUser[0].email,
};

res.status(201).json({
  message: "User registered successfully.",
  user: req.session.user,
});

  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});


// User login route
router.post("/signin", async (req, res) => {
  const { email, password_hash } = req.body;

  try {
    if (!email || !password_hash) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const [user] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);

    if (user.length === 0) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const validPassword = await bcrypt.compare(password_hash, user[0].password_hash);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Store user details in session
    req.session.user = {
      id: user[0].id,
      full_name: user[0].full_name,
      username: user[0].username,
      email: user[0].email,
    };
    console.log('Session after login:', req.session);
    
    res.status(200).json({ message: "Login successful." });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});

// Get logged-in user data
router.get("/user", (req, res) => {
  //console.log('Session:', req.session); 
  if (req.session.user) {
    return res.json(req.session.user);
  }
  res.status(401).json({ message: 'Unauthorized' });
});

// Search users by skills, username, or email
router.get("/search/users", async (req, res) => {
  const { query } = req.query; // Get search query from query parameters

  try {
    if (!query) {
      return res.status(400).json({ message: "Query is required for searching." });
    }

    const sql = `
      SELECT id, full_name, username, email, skills
      FROM users
      WHERE username LIKE ? OR email LIKE ? OR JSON_CONTAINS(skills, ?)
    `;
    const params = [`%${query}%`, `%${query}%`, JSON.stringify(query)];

    const [results] = await pool.query(sql, params);

    res.status(200).json({
      message: "Search results fetched successfully.",
      results,
    });
  } catch (error) {
    console.error("Error fetching search results:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});


// Update user profile
router.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  let { full_name, username, email, skills } = req.body;

  try {
    console.log("Request Body:", req.body); // Debugging

    // Check if the user exists
    const [existingUser] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    if (existingUser.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    // Normalize skills (ensure it's a valid JSON string)
    if (Array.isArray(skills)) {
      skills = JSON.stringify(skills); // Convert array to JSON string
    } else if (typeof skills === "string") {
      try {
        skills = JSON.stringify(skills.split(",").map(skill => skill.trim())); // Parse string to array, then to JSON
      } catch (error) {
        return res.status(400).json({ message: "Invalid skills format." });
      }
    }

    // Update user details in the database
    await pool.query(
      "UPDATE users SET full_name = ?, username = ?, email = ?, skills = ? WHERE id = ?",
      [full_name, username, email, skills || null, id]
    );

    // Retrieve the updated user for response
    const [updatedUser] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);

    res.status(200).json({
      message: "Profile updated successfully.",
      user: {
        id: updatedUser[0].id,
        full_name: updatedUser[0].full_name,
        username: updatedUser[0].username,
        email: updatedUser[0].email,
        skills: JSON.parse(updatedUser[0].skills || "[]"), // Convert JSON string back to array
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
});


// Logout route
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Error logging out" });
    }
    res.clearCookie("user_sid");
    res.status(200).json({ message: "Logout successful" });
  });
});

module.exports = router;
