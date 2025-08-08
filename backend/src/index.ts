import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import session from 'express-session';
import bcrypt from 'bcrypt';

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

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(session({
  secret: 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // set to true if using HTTPS
}));

const db = new sqlite3.Database(process.env.DATABASE_PATH || 'database.db');

console.log('Attempting to create courses table...');
db.run(`CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  quarter TEXT NOT NULL,
  pathway_id TEXT,
  description TEXT,
  credits INTEGER,
  prerequisites TEXT,
  reddit_link TEXT,
  ratemyprofessor_link TEXT,
  difficulty_rating REAL,
  workload_rating REAL,
  schedule_days TEXT,
  schedule_time TEXT,
  start_date TEXT,
  end_date TEXT
)`, (err) => {
  if (err) {
    console.error('Error creating courses table:', err);
  } else {
    console.log('Courses table created or already exists.');
  }
});

// Create users table
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
)`, (err) => {
  if (err) {
    console.error('Error creating users table:', err);
  } else {
    console.log('Users table created or already exists.');
  }
});

// Create pathways table
db.run(`CREATE TABLE IF NOT EXISTS pathways (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL
)`, (err) => {
  if (err) {
    console.error('Error creating pathways table:', err);
  } else {
    console.log('Pathways table created or already exists.');
  }
});

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'password123';

function requireAdmin(req: any, res: any, next: any) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

function requireAuth(req: any, res: any, next: any) {
  if (req.session && (req.session.isAdmin || req.session.userId)) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

// Health check endpoint - simplified for Railway
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({ 
    status: 'ok', 
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Simple root endpoint for testing
app.get('/', (req, res) => {
  res.json({ message: 'UW Course Planner Backend is running!' });
});

// Student registration
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }
  
  // Check if username already exists
  db.get('SELECT id FROM users WHERE username = ?', [username], async (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (row) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    try {
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert new user
      db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        
        // Set session
        req.session.userId = this.lastID;
        req.session.username = username;
        req.session.isAdmin = false;
        
        res.status(201).json({ 
          message: 'User registered successfully',
          user: { userId: this.lastID, username, isAdmin: false }
        });
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Error hashing password' });
    }
  });
});

// Student login
app.post('/api/student-login', (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  db.get('SELECT id, password FROM users WHERE username = ?', [username], async (err, row: any) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!row) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const match = await bcrypt.compare(password, row.password);
    if (match) {
      req.session.userId = row.id;
      req.session.username = username;
      req.session.isAdmin = false;
      res.json({ message: 'Login successful', user: { userId: row.id, username: username, isAdmin: false } });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
});

// Admin login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.isAdmin = true;
    res.json({ message: 'Admin login successful' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
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

// Add a new pathway (Admin only)
app.post('/api/pathways', requireAdmin, (req, res) => {
  const { id, name } = req.body;
  if (!id || !name) {
    return res.status(400).json({ error: 'Pathway ID and name are required' });
  }
  db.run('INSERT INTO pathways (id, name) VALUES (?, ?)', [id, name], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.status(201).json({ message: 'Pathway added', pathwayId: id });
  });
});

// Get all pathways (Auth required)
app.get('/api/pathways', requireAuth, (req, res) => {
  db.all('SELECT * FROM pathways', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ pathways: rows });
  });
});

// Add a new course (Admin only)
app.post('/api/pathway/:pathwayId/courses', requireAdmin, (req, res) => {
  const { pathwayId } = req.params;
  const { id, name, quarter, description, credits, prerequisites, reddit_link, ratemyprofessor_link, difficulty_rating, workload_rating, schedule_days, schedule_time, start_date, end_date } = req.body;
  if (!id || !name || !quarter || !credits) {
    return res.status(400).json({ error: 'Course ID, name, quarter, and credits are required' });
  }
  db.run(
    'INSERT INTO courses (id, name, quarter, pathway_id, description, credits, prerequisites, reddit_link, ratemyprofessor_link, difficulty_rating, workload_rating, schedule_days, schedule_time, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, name, quarter, pathwayId, description, credits, prerequisites, reddit_link, ratemyprofessor_link, difficulty_rating, workload_rating, schedule_days, schedule_time, start_date, end_date],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({ message: 'Course added', courseId: id });
    }
  );
});

// Get courses for a specific pathway (Auth required)
app.get('/api/pathway/:pathwayId/courses', requireAuth, (req, res) => {
  const { pathwayId } = req.params;
  db.all('SELECT * FROM courses WHERE pathway_id = ?', [pathwayId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ courses: rows });
  });
});

// Delete a course (Admin only)
app.delete('/api/course/:courseId', requireAdmin, (req, res) => {
  const { courseId } = req.params;
  db.run('DELETE FROM courses WHERE id = ?', [courseId], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Course deleted' });
  });
});

// Update student input (Auth required)
app.post('/api/student-input', requireAuth, (req, res) => {
  const { major, minor, focusArea, classStanding, prerequisitesCompleted, yearsToGraduate } = req.body;
  const userId = req.session.userId;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  db.run(
    `INSERT OR REPLACE INTO student_input (user_id, major, minor, focus_area, class_standing, prerequisites_completed, years_to_graduate) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, major, minor, focusArea, classStanding, JSON.stringify(prerequisitesCompleted), yearsToGraduate],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Student input saved successfully' });
    }
  );
});

// Get student input (Auth required)
app.get('/api/student-input', requireAuth, (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  db.get('SELECT * FROM student_input WHERE user_id = ?', [userId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (row) {
      // Parse prerequisites_completed back to array
      (row as any).prerequisites_completed = JSON.parse((row as any).prerequisites_completed || '[]');
    }
    res.json({ studentInput: row });
  });
});

// Generate pathways (Auth required)
app.post('/api/generate-pathways', requireAuth, (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // For now, return a static list of pathways.
  // In a real application, this would involve complex logic based on student input.
  const generatedPathways = [
    { id: 'path1', name: 'Informatics Core Pathway' },
    { id: 'path2', name: 'Data Science Focus Pathway' },
    { id: 'path3', name: 'Human-Computer Interaction Pathway' },
  ];
  res.json({ pathways: generatedPathways });
});

// Create student_courses table
db.run(`CREATE TABLE IF NOT EXISTS student_courses (
  user_id INTEGER,
  course_id TEXT,
  PRIMARY KEY (user_id, course_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
)`, (err) => {
  if (err) {
    console.error('Error creating student_courses table:', err);
  } else {
    console.log('Student_courses table created or already exists.');
  }
});

// Insert sample pathway data if it doesn't exist
db.run(`INSERT OR IGNORE INTO pathways (id, name) VALUES 
  ('path1', 'Informatics Core'),
  ('path2', 'Data Science Track'),
  ('path3', 'Human-Computer Interaction'),
  ('path4', 'Information Architecture')`, (err) => {
  if (err) {
    console.error('Error inserting sample pathways:', err);
  } else {
    console.log('Sample pathways inserted or already exist.');
  }
});

// Insert sample course data if it doesn't exist
db.run(`INSERT OR IGNORE INTO courses (id, name, quarter, pathway_id, description, credits) VALUES 
  ('INFO200', 'Foundations of Informatics', 'Autumn 2024', 'path1', 'Introduction to informatics concepts and methods', 5),
  ('INFO201', 'Technical Foundations of Informatics', 'Winter 2025', 'path1', 'Technical skills for informatics', 5),
  ('INFO300', 'Research Methods in Informatics', 'Spring 2025', 'path1', 'Research methodologies in informatics', 5),
  ('INFO310', 'Information Systems Analysis and Design', 'Autumn 2024', 'path2', 'Analysis and design of information systems', 5),
  ('INFO340', 'Client-Side Development', 'Winter 2025', 'path2', 'Web development and client-side technologies', 5),
  ('INFO360', 'Design Methods', 'Spring 2025', 'path3', 'Design methodologies and user experience', 5),
  ('INFO370', 'Information Visualization', 'Autumn 2024', 'path3', 'Data visualization techniques', 5),
  ('INFO380', 'Database Design and Management', 'Winter 2025', 'path4', 'Database design and management principles', 5),
  ('INFO441', 'Information Systems Capstone', 'Spring 2025', 'path4', 'Capstone project in information systems', 5),
  ('INFO442', 'Informatics Capstone', 'Autumn 2024', 'path1', 'Final capstone project in informatics', 5)`, (err) => {
  if (err) {
    console.error('Error inserting sample courses:', err);
  } else {
    console.log('Sample courses inserted or already exist.');
  }
});

// Ensure schedule_days and schedule_time columns exist in courses table
// (SQLite doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN, so we use a workaround)
db.all("PRAGMA table_info(courses)", (err, columns) => {
  if (err) return;
  const colNames = columns ? columns.map((col: any) => col.name) : [];
  if (!colNames.includes('schedule_days')) {
    db.run('ALTER TABLE courses ADD COLUMN schedule_days TEXT');
  }
  if (!colNames.includes('schedule_time')) {
    db.run('ALTER TABLE courses ADD COLUMN schedule_time TEXT');
  }
  if (!colNames.includes('start_date')) {
    db.run('ALTER TABLE courses ADD COLUMN start_date TEXT');
  }
  if (!colNames.includes('end_date')) {
    db.run('ALTER TABLE courses ADD COLUMN end_date TEXT');
  }
});

// Seed/update some sample schedule and date data for Informatics courses
const sampleSchedules = [
  { id: 'INFO200', days: 'MWF', time: '10:00-11:20', start: '2024-09-25', end: '2024-12-06' },
  { id: 'INFO201', days: 'TuTh', time: '13:30-15:20', start: '2024-09-26', end: '2024-12-05' },
  { id: 'INFO300', days: 'MWF', time: '11:30-12:50', start: '2024-09-25', end: '2024-12-06' },
  { id: 'INFO310', days: 'TuTh', time: '09:00-10:50', start: '2024-09-26', end: '2024-12-05' },
  { id: 'INFO340', days: 'MWF', time: '14:00-15:20', start: '2024-09-25', end: '2024-12-06' },
  { id: 'INFO360', days: 'TuTh', time: '15:30-17:20', start: '2024-09-26', end: '2024-12-05' },
  { id: 'INFO370', days: 'MWF', time: '08:30-09:50', start: '2024-09-25', end: '2024-12-06' },
  { id: 'INFO380', days: 'TuTh', time: '11:00-12:50', start: '2024-09-26', end: '2024-12-05' },
  { id: 'INFO441', days: 'MWF', time: '13:00-14:20', start: '2024-09-25', end: '2024-12-06' },
  { id: 'INFO442', days: 'TuTh', time: '10:00-11:50', start: '2024-09-26', end: '2024-12-05' },
];
sampleSchedules.forEach(({ id, days, time, start, end }) => {
  db.run('UPDATE courses SET schedule_days = ?, schedule_time = ?, start_date = ?, end_date = ? WHERE id = ?', [days, time, start, end, id]);
});

// Get current student's MyPlan
app.get('/api/myplan', (req, res) => {
  if (!req.session.userId || req.session.isAdmin) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  db.all(
    `SELECT c.* FROM student_courses sc JOIN courses c ON sc.course_id = c.id WHERE sc.user_id = ?`,
    [req.session.userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ myplan: rows });
    }
  );
});

// Add a course to MyPlan
app.post('/api/myplan', (req, res) => {
  if (!req.session.userId || req.session.isAdmin) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { courseId } = req.body;
  if (!courseId) {
    return res.status(400).json({ error: 'Missing courseId' });
  }
  db.run(
    'INSERT OR IGNORE INTO student_courses (user_id, course_id) VALUES (?, ?)',
    [req.session.userId, courseId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({ message: 'Course added to MyPlan' });
    }
  );
});

// Remove a course from MyPlan
app.delete('/api/myplan/:courseId', (req, res) => {
  if (!req.session.userId || req.session.isAdmin) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { courseId } = req.params;
  db.run(
    'DELETE FROM student_courses WHERE user_id = ? AND course_id = ?',
    [req.session.userId, courseId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Course removed from MyPlan' });
    }
  );
});

// Start server immediately, then initialize database
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check available at: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️ Database: ${process.env.DATABASE_PATH || 'database.db'}`);
  
  // Initialize database after server starts
  console.log('Initializing database...');
}); 