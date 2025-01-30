const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const dotenv = require('dotenv');
const cors = require('cors');
const pool = require('./config/db');
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const taskRoutes = require("./routes/taskRoutes");
const messageRoutes = require("./routes/messageRoutes");
const teamRoutes = require("./routes/teamRoutes");
const ganttRoutes = require("./routes/ganttRoutes");
const calendarRoutes = require("./routes/calendarRoutes");
const editorRoutes = require("./routes/editorRoutes");
const http = require("http");
const { Server } = require("socket.io");

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Frontend origin
const allowedOrigins = ["http://localhost:3000", "http://localhost:3001", "https://devmeet-app.vercel.app/"];

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Enable CORS with credentials
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  })
);

// Middleware
app.use(express.json());  // Middleware to parse JSON data
app.use(express.urlencoded({ extended: true }));  // Middleware to parse URL-encoded data

const authenticate = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized: Please log in.' });
  }
};

// MySQL session store setup
const sessionStore = new MySQLStore({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "devmeet",
});

app.use(
  session({
    key: "devmeet_user_sid",
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    },
  })
);

app.use('/uploads', express.static('uploads')); 
// const UPLOAD_DIR = path.join(__dirname, 'uploads');
// app.use('/uploads', express.static(UPLOAD_DIR));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/gantt', ganttRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/explorer', editorRoutes);

// WebSocket logic for real-time collaboration
io.on('connection', (socket) => {
 // console.log('A user connected:', socket.id);

  // Handle incoming code updates
  socket.on('code_update', (data) => {
   // console.log('Code update received:', data);
    socket.broadcast.emit('code_update', data); // Broadcast code changes to other clients
  });

  // Handle messages in chat
  socket.on('send_message', (message) => {
    console.log('Message received:', message);
    io.emit('new_message', message); // Broadcast to all clients
  });

  // Handle disconnection
  socket.on('disconnect', () => {
   // console.log('User disconnected:', socket.id);
  });
});

// Test Database Connection
pool.query('SELECT 1')
  .then(() => console.log('Connected to MySQL database'))
  .catch((err) => {
    console.error('Database connection error:', err.message);
    process.exit(1);
  });

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
