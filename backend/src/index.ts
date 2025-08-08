import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { initializeDatabase, closeDatabase } from './database';

// Extend the Request interface to include session
declare module 'express-session' {
  interface SessionData {
    isAdmin: boolean;
    userId?: number;
    username?: string;
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize database
initializeDatabase()
  .then(() => {
    console.log('Database initialized successfully');
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  closeDatabase().then(() => {
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  closeDatabase().then(() => {
    process.exit(0);
  });
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(session({
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({ 
    status: 'ok', 
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'UW Course Planner Backend is running!' });
});

// Simple admin login (no database)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'password123') {
    req.session.isAdmin = true;
    res.json({ message: 'Admin login successful' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Simple student login (no database)
app.post('/api/student-login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'student' && password === 'password123') {
    req.session.userId = 1;
    req.session.username = username;
    req.session.isAdmin = false;
    res.json({ 
      message: 'Login successful', 
      user: { userId: 1, username: username, isAdmin: false } 
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Simple registration (no database)
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }
  
  req.session.userId = 2;
  req.session.username = username;
  req.session.isAdmin = false;
  
  res.status(201).json({ 
    message: 'User registered successfully',
    user: { userId: 2, username, isAdmin: false }
  });
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// Mock pathways data
app.get('/api/pathways', (req, res) => {
  const pathways = [
    { id: 'path1', name: 'Informatics Core' },
    { id: 'path2', name: 'Data Science Track' },
    { id: 'path3', name: 'Human-Computer Interaction' },
    { id: 'path4', name: 'Information Architecture' }
  ];
  res.json({ pathways });
});

// Mock courses data
app.get('/api/pathway/:pathwayId/courses', (req, res) => {
  const courses = [
    { id: 'INFO200', name: 'Foundations of Informatics', quarter: 'Autumn 2024', pathway_id: 'path1', description: 'Introduction to informatics concepts and methods', credits: 5 },
    { id: 'INFO201', name: 'Technical Foundations of Informatics', quarter: 'Winter 2025', pathway_id: 'path1', description: 'Technical skills for informatics', credits: 5 },
    { id: 'INFO300', name: 'Research Methods in Informatics', quarter: 'Spring 2025', pathway_id: 'path1', description: 'Research methodologies in informatics', credits: 5 },
    { id: 'INFO310', name: 'Information Systems Analysis and Design', quarter: 'Autumn 2024', pathway_id: 'path2', description: 'Analysis and design of information systems', credits: 5 },
    { id: 'INFO340', name: 'Client-Side Development', quarter: 'Winter 2025', pathway_id: 'path2', description: 'Web development and client-side technologies', credits: 5 },
    { id: 'INFO360', name: 'Design Methods', quarter: 'Spring 2025', pathway_id: 'path3', description: 'Design methodologies and user experience', credits: 5 },
    { id: 'INFO370', name: 'Information Visualization', quarter: 'Autumn 2024', pathway_id: 'path3', description: 'Data visualization techniques', credits: 5 },
    { id: 'INFO380', name: 'Database Design and Management', quarter: 'Winter 2025', pathway_id: 'path4', description: 'Database design and management principles', credits: 5 },
    { id: 'INFO441', name: 'Information Systems Capstone', quarter: 'Spring 2025', pathway_id: 'path4', description: 'Capstone project in information systems', credits: 5 },
    { id: 'INFO442', name: 'Informatics Capstone', quarter: 'Autumn 2024', pathway_id: 'path1', description: 'Final capstone project in informatics', credits: 5 }
  ];
  res.json({ courses });
});

// Mock MyPlan data
app.get('/api/myplan', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const myplan = [
    { id: 'INFO200', name: 'Foundations of Informatics', quarter: 'Autumn 2024', credits: 5 }
  ];
  res.json({ myplan });
});

// Add course to MyPlan (mock)
app.post('/api/myplan', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.status(201).json({ message: 'Course added to MyPlan' });
});

// Remove course from MyPlan (mock)
app.delete('/api/myplan/:courseId', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  res.json({ message: 'Course removed from MyPlan' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check available at: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
}); 