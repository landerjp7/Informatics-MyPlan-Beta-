"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const sqlite3_1 = __importDefault(require("sqlite3"));
const express_session_1 = __importDefault(require("express-session"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json());
app.use((0, express_session_1.default)({
    secret: 'supersecretkey',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // set to true if using HTTPS
}));
const db = new sqlite3_1.default.Database('database.db');
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
    }
    else {
        console.log('Courses table created or already exists.');
    }
});
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'password123';
function requireAdmin(req, res, next) {
    if (req.session && req.session.isAdmin) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
}
function requireAuth(req, res, next) {
    if (req.session && (req.session.isAdmin || req.session.userId)) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized' });
}
// Student registration
app.post('/api/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    // Check if username already exists
    db.get('SELECT id FROM users WHERE username = ?', [username], (err, row) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (row) {
            return res.status(400).json({ error: 'Username already exists' });
        }
        try {
            // Hash the password
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            // Insert new user
            db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function (err) {
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
        }
        catch (error) {
            res.status(500).json({ error: 'Error hashing password' });
        }
    }));
}));
// Student login
app.post('/api/student-login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }
    db.get('SELECT id, username, password FROM users WHERE username = ?', [username], (err, row) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (!row) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        try {
            const isValidPassword = yield bcrypt_1.default.compare(password, row.password);
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
        }
        catch (error) {
            res.status(500).json({ error: 'Error verifying password' });
        }
    }));
});
// Admin login (existing)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USER && password === ADMIN_PASS) {
        req.session.isAdmin = true;
        req.session.userId = 0; // Admin has special ID
        req.session.username = 'admin';
        res.json({ message: 'Logged in' });
    }
    else {
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
// Course list for a pathway (dynamic from DB)
app.get('/api/pathway/:id/courses', (req, res) => {
    const { id } = req.params;
    db.all('SELECT id, name, quarter, description, credits, prerequisites, reddit_link, ratemyprofessor_link, difficulty_rating, workload_rating FROM courses WHERE pathway_id = ?', [id], (err, rows) => {
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
    db.run('INSERT INTO pathways (id, name) VALUES (?, ?)', [id, name], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ message: 'Pathway created', pathway: { id, name } });
    });
});
// Create a new course for a pathway (admin only)
app.post('/api/pathway/:id/courses', requireAdmin, (req, res) => {
    const { id } = req.params;
    const { courseId, name, quarter } = req.body;
    if (!courseId || !name || !quarter) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    db.run('INSERT INTO courses (id, name, quarter, pathway_id) VALUES (?, ?, ?, ?)', [courseId, name, quarter, id], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ message: 'Course created', course: { id: courseId, name, quarter, pathway_id: id } });
    });
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
    db.run(`UPDATE courses SET ${updates.join(', ')} WHERE id = ?`, params, function (err) {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.json({ message: 'Course updated' });
    });
});
// Delete a course (admin only)
app.delete('/api/courses/:courseId', requireAdmin, (req, res) => {
    const { courseId } = req.params;
    db.run('DELETE FROM courses WHERE id = ?', [courseId], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }
        res.json({ message: 'Course deleted' });
    });
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
)`);
// Ensure schedule_days and schedule_time columns exist in courses table
// (SQLite doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN, so we use a workaround)
db.all("PRAGMA table_info(courses)", (err, columns) => {
    if (err)
        return;
    const colNames = columns ? columns.map((col) => col.name) : [];
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
    db.all(`SELECT c.* FROM student_courses sc JOIN courses c ON sc.course_id = c.id WHERE sc.user_id = ?`, [req.session.userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ myplan: rows });
    });
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
    db.run('INSERT OR IGNORE INTO student_courses (user_id, course_id) VALUES (?, ?)', [req.session.userId, courseId], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ message: 'Course added to MyPlan' });
    });
});
// Remove a course from MyPlan
app.delete('/api/myplan/:courseId', (req, res) => {
    if (!req.session.userId || req.session.isAdmin) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    const { courseId } = req.params;
    db.run('DELETE FROM student_courses WHERE user_id = ? AND course_id = ?', [req.session.userId, courseId], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Course removed from MyPlan' });
    });
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
