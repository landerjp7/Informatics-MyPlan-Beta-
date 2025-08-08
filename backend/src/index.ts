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

// Simple root endpoint for testing
app.get('/', (req, res) => {
  res.json({ message: 'UW Course Planner Backend is running!' });
});

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
console.log('CREATE TABLE statement for courses executed.');

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
          user: { id: this.lastID, username }
        });
      });
    } catch (error) {
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
  
  db.get('SELECT id, username, password FROM users WHERE username = ?', [username], async (err, row: any) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!row) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    try {
      const isValidPassword = await bcrypt.compare(password, row.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      // Set session
      req.session.userId = row.id;
      req.session.username = row.username;
      req.session.isAdmin = false;
      
      res.json({ 
        message: 'Logged in successfully',
        user: { id: row.id, username: row.username }
      });
    } catch (error) {
      res.status(500).json({ error: 'Error verifying password' });
    }
  });
});

// Admin login (existing)
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.isAdmin = true;
    req.session.userId = 0; // Admin has special ID
    req.session.username = 'admin';
    res.json({ message: 'Logged in' });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Get current user info
app.get('/api/me', (req, res) => {
  if (!req.session.userId && !req.session.isAdmin) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  
  res.json({
    userId: req.session.userId,
    username: req.session.username,
    isAdmin: req.session.isAdmin
  });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out' });
  });
});

// Get all pathways
app.get('/api/pathways', (req, res) => {
  db.all('SELECT id, name FROM pathways', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ pathways: rows });
  });
});

// Course list for a pathway (dynamic from DB) with optional quarter filtering
app.get('/api/pathway/:id/courses', (req, res) => {
  const { id } = req.params;
  const { quarter } = req.query;
  let sql = 'SELECT id, name, quarter, description, credits, prerequisites, reddit_link, ratemyprofessor_link, difficulty_rating, workload_rating FROM courses WHERE pathway_id = ?';
  let params = [id];
  if (quarter) {
    sql += ' AND quarter = ?';
    params.push(String(quarter));
  }
  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Pathway not found or no courses' });
    }
    res.json({ courses: rows });
  });
});

// Create a new pathway (admin only)
app.post('/api/pathways', requireAdmin, (req, res) => {
  const { id, name } = req.body;
  if (!id || !name) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  db.run(
    'INSERT INTO pathways (id, name) VALUES (?, ?)',
    [id, name],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({ message: 'Pathway created', pathway: { id, name } });
    }
  );
});

// Create a new course for a pathway (admin only)
app.post('/api/pathway/:id/courses', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { courseId, name, quarter } = req.body;
  if (!courseId || !name || !quarter) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  db.run(
    'INSERT INTO courses (id, name, quarter, pathway_id) VALUES (?, ?, ?, ?)',
    [courseId, name, quarter, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.status(201).json({ message: 'Course created', course: { id: courseId, name, quarter, pathway_id: id } });
    }
  );
});

// Update an existing course (admin only)
app.put('/api/courses/:courseId', requireAdmin, (req, res) => {
  const { courseId } = req.params;
  const { name, quarter } = req.body;
  if (!name && !quarter) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  const updates = [];
  const params = [];
  if (name) {
    updates.push('name = ?');
    params.push(name);
  }
  if (quarter) {
    updates.push('quarter = ?');
    params.push(quarter);
  }
  params.push(courseId);
  db.run(
    `UPDATE courses SET ${updates.join(', ')} WHERE id = ?`,
    params,
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Course not found' });
      }
      res.json({ message: 'Course updated' });
    }
  );
});

// Delete a course (admin only)
app.delete('/api/courses/:courseId', requireAdmin, (req, res) => {
  const { courseId } = req.params;
  db.run(
    'DELETE FROM courses WHERE id = ?',
    [courseId],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Course not found' });
      }
      res.json({ message: 'Course deleted' });
    }
  );
});

// Ensure student_courses table exists
// This table links user IDs to course IDs
// Each row: (user_id, course_id)
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

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check available at: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️ Database: ${process.env.DATABASE_PATH || 'database.db'}`);
}); 