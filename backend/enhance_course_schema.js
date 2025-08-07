const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

// Add new columns to courses table
db.serialize(() => {
  // Add new columns for enhanced course data
  db.run('ALTER TABLE courses ADD COLUMN description TEXT');
  db.run('ALTER TABLE courses ADD COLUMN credits INTEGER');
  db.run('ALTER TABLE courses ADD COLUMN prerequisites TEXT');
  db.run('ALTER TABLE courses ADD COLUMN reddit_link TEXT');
  db.run('ALTER TABLE courses ADD COLUMN ratemyprofessor_link TEXT');
  db.run('ALTER TABLE courses ADD COLUMN difficulty_rating REAL');
  db.run('ALTER TABLE courses ADD COLUMN workload_rating REAL');
  
  console.log('Enhanced course schema created successfully.');
});

db.close(() => {
  console.log('Database schema update completed.');
}); 