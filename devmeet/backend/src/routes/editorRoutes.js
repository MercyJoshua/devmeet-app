const express = require("express");
const router = express.Router();
const pool = require("../config/db"); // Database connection
const multer = require("multer");
const path = require("path");


// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Directory where files will be saved
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});
const upload = multer({ storage });

/**
 * @desc Retrieve all files for a project in a nested structure
 * @route GET /:projectId/get
 */
router.get('/:projectId/get', async (req, res) => {
  const { projectId } = req.params;

  // Validate projectId
  if (!projectId || isNaN(Number(projectId))) {
    return res.status(400).json({ message: "Invalid project ID." });
  }

  try {
    // Validate project existence
    const [project] = await pool.query('SELECT id FROM projects WHERE id = ?', [projectId]);
    if (project.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Fetch all files for the project
    const [rows] = await pool.query('SELECT * FROM files WHERE project_id = ? ORDER BY id', [projectId]);

    // Helper function to build a nested file tree
    const buildFileTree = (files) => {
      const map = {};
      const tree = [];

      files.forEach((file) => {
        map[file.id] = { ...file, children: [] }; // Initialize the file with a children array
      });

      files.forEach((file) => {
        if (file.parent_id) {
          if (map[file.parent_id]) {
            map[file.parent_id].children.push(map[file.id]); // Add as a child to the parent
          }
        } else {
          tree.push(map[file.id]); // Add to the root level
        }
      });

      return tree;
    };

    const fileTree = buildFileTree(rows);

    res.json(fileTree);
  } catch (err) {
    console.error('Error retrieving files:', err.message);
    res.status(500).json({ error: 'Failed to retrieve files.' });
  }
});

/**
 * @desc Retrieve content of a specific file in a project by path (media files)
 * @route GET /files/:projectId/*
 */
router.get('/:projectId/*', async (req, res) => {
  const { projectId } = req.params;
  const filePath = req.params[0]; // Captures the dynamic path after /:projectId/

  // Validate inputs
  if (!projectId || isNaN(Number(projectId))) {
    return res.status(400).json({ error: "Invalid project ID." });
  }
  if (!filePath) {
    return res.status(400).json({ error: "File path is required." });
  }

  try {
    // Validate project existence
    const [project] = await pool.query('SELECT id FROM projects WHERE id = ?', [projectId]);
    if (project.length === 0) {
      return res.status(404).json({ error: "Project not found." });
    }

    // Fetch file content
    const [file] = await pool.query(
      'SELECT content FROM files WHERE project_id = ? AND path = ?',
      [projectId, filePath]
    );

    if (file.length === 0) {
      return res.status(404).json({ error: "File not found." });
    }

    // Return the file content
    res.json({ content: file[0].content });
  } catch (err) {
    console.error("Error retrieving file content:", err.message);
    res.status(500).json({ error: "Failed to retrieve file content." });
  }
});

/**
 * @desc Retrieve content of a specific file (code files)
 * @route GET /:fileId
 */
router.get('/:fileId', async (req, res) => {
  const { fileId } = req.params;
  console.log('Received fileId:', fileId);

  if (!fileId || isNaN(Number(fileId))) {
    console.log('Invalid fileId:', fileId);
    return res.status(400).json({ error: 'Invalid file ID.' });
  }

  try {
    const [file] = await pool.query('SELECT content FROM files WHERE id = ?', [fileId]);
    console.log('Query result:', file);

    if (file.length === 0) {
      console.log('File not found for ID:', fileId);
      return res.status(404).json({ error: 'File not found.' });
    }

    console.log('Returning file content:', file[0].content);
    res.json({ content: file[0].content });
  } catch (err) {
    console.error('Error retrieving file:', err.message);
    res.status(500).json({ error: 'Failed to retrieve file content.' });
  }
});

/**
 * @desc Save code content for a specific file
 * @route POST /:fileId/save
 */
router.post('/:fileId/save', async (req, res) => {
  const { fileId } = req.params;
  const { codeContent } = req.body;
  const updated_by = req.session?.user?.id;
  console.log('Request received:', { fileId, codeContent });
console.log('Session user:', req.session?.user);


  if (!fileId || isNaN(Number(fileId))) {
    return res.status(400).json({ error: 'Invalid file ID.' });
  }

  if (!codeContent) {
    return res.status(400).json({ error: 'Code content is required.' });
  }

  try {
    // Ensure the file exists and is of type 'code'
    const [file] = await pool.query(
      'SELECT * FROM files WHERE id = ? AND type = ?',
      [fileId, 'code']
    );
    console.log('File query result:', file);

    if (file.length === 0) {
      return res.status(404).json({ error: 'File not found or is not a code file.' });
    }

    // Update the file content
    const updateResult = await pool.query(
  'UPDATE files SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
  [codeContent, fileId]
);
console.log('Update query result:', updateResult);

    console.log('Code content updated successfully for file:', fileId);
    res.status(200).json({ message: 'Code content saved successfully.' });
  } catch (err) {
    console.error('Error saving code content:', err.message);
    res.status(500).json({ error: 'Failed to save code content.' });
  }
});


/**
 * @desc Create a file or folder in a project
 * @route POST /:projectId/create
 */
router.post('/:projectId/create', async (req, res) => {
  const { name, type, parentId } = req.body;
  const { projectId } = req.params;
  const created_by = req.session?.user?.id;

  if (!name || !type) {
    return res.status(400).json({ error: 'Name and type are required.' });
  }

  if (!created_by) {
    return res.status(401).json({ error: 'Unauthorized: User must be logged in.' });
  }

  try {
    console.log('Creating file or folder:', { name, type, parentId, projectId });

    // Initialize path variable
    let computedPath = name;

    // If there's a parentId, fetch the parent's path
    if (parentId) {
      const [parent] = await pool.query('SELECT path FROM files WHERE id = ?', [parentId]);
      if (parent.length === 0) {
        return res.status(404).json({ error: 'Parent folder not found.' });
      }
      computedPath = `${parent[0].path}/${name}`;
    }

    // Insert file or folder into the database
    const [result] = await pool.query(
      `INSERT INTO files (project_id, parent_id, name, type, path, content, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [projectId, parentId || null, name, type, computedPath, null, created_by]
    );

    // Fetch the newly created file or folder
    const [newFile] = await pool.query('SELECT * FROM files WHERE id = ?', [result.insertId]);

    if (!newFile || newFile.length === 0) {
      return res.status(404).json({ error: 'File not found after creation.' });
    }

    console.log('Newly created file or folder:', newFile[0]);
    res.status(201).json(newFile[0]); // Return the complete file object
  } catch (err) {
    console.error('Error creating file or folder:', err.message);
    res.status(500).json({ error: 'Failed to create file or folder.' });
  }
});


/**
 * @desc Upload a file to a project (supports media files, other file types, and code content)
 * @route POST /:projectId/upload
 */
router.post("/:projectId/upload", upload.single("file"), async (req, res) => {
  const { projectId } = req.params;
  const { parent_id, content } = req.body; // Optional parent folder ID and file content
  const created_by = req.session?.user?.id; // Ensure user session exists

  if (!req.file && !content) {
    return res.status(400).json({ error: "Either a file or content is required." });
  }

  try {
    // Validate project existence
    const [project] = await pool.query("SELECT id FROM projects WHERE id = ?", [projectId]);
    if (project.length === 0) {
      return res.status(404).json({ error: "Project not found." });
    }

    // If a file is uploaded, process and save it
    let filePath = null;
    let fileSize = 0;

    if (req.file) {
      filePath = req.file.path; // Path where the file is stored
      fileSize = req.file.size; // File size in bytes
    }

    // Insert file metadata into the database
    const [result] = await pool.query(
      `INSERT INTO files (project_id, parent_id, name, type, path, size, content, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        projectId,
        parent_id || null, // If parent_id is undefined, use null
        req.file ? req.file.originalname : "Untitled File", // Use file name or a default name
        req.file ? "file" : "code", // Type is "file" for uploads, "code" for content-only
        filePath,
        fileSize,
        content || null, // Store the file content if provided
        created_by || null, // Ensure created_by is null-safe
      ]
    );

    // Respond with the file details
    const uploadedFile = {
      id: result.insertId,
      project_id: projectId,
      parent_id: parent_id || null,
      name: req.file ? req.file.originalname : "Untitled File",
      type: req.file ? "file" : "code",
      path: filePath,
      size: fileSize,
      content: content || null,
      created_by,
    };

    res.status(201).json({ message: "File uploaded successfully.", file: uploadedFile });
  } catch (err) {
    console.error("Error during file upload:", err.message);
    res.status(500).json({ error: "Failed to upload file." });
  }
});

/**
 * @desc Update a file or folder name
 * @route PUT /:id
 */
router.put('/:id/update', async (req, res) => {
  const { id } = req.params;
  const { name, content, path, size } = req.body;

  try {
    // Check if file exists
    const [file] = await pool.query('SELECT id FROM files WHERE id = ?', [id]);
    if (file.length === 0) {
      return res.status(404).json({ error: 'File/Folder not found.' });
    }

    // Update file
    await pool.query(
      `UPDATE files SET name = ?, content = ?, path = ?, size = ? WHERE id = ?`,
      [name, content || null, path || null, size || null, id]
    );

    res.json({ message: 'File/Folder updated successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to update file/folder.' });
  }
});

/**
 * @desc Delete a file or folder
 * @route DELETE /:id
 */
router.delete('/:id/delete', async (req, res) => {
  const { id } = req.params;

  try {
    // Check if file exists
    const [file] = await pool.query('SELECT id FROM files WHERE id = ?', [id]);
    if (file.length === 0) {
      return res.status(404).json({ error: 'File/Folder not found.' });
    }

    // Delete file
    await pool.query('DELETE FROM files WHERE id = ?', [id]);

    res.json({ message: 'File/Folder deleted successfully.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Failed to delete file/folder.' });
  }
});

module.exports = router;
