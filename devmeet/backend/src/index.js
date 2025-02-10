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
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));  

const authenticate = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized: Please log in.' });
  }
};

// MySQL session store setup
const sessionStore = new MySQLStore({
  host: process.env.DATABASE_HOST,
  port: 3306,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectTimeout: 60000, 
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

  // Handle incoming code updates
  socket.on('code_update', (data) => {
    socket.broadcast.emit('code_update', data);
  });

  // Handle messages in chat
  socket.on('send_message', (message) => {
    console.log('Message received:', message);
    io.emit('new_message', message); // Broadcast to all clients
  });

  // Handle disconnection
  socket.on('disconnect', () => {
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
