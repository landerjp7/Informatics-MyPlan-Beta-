const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

// Create tables
const createTables = () => {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS pathways (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      quarter TEXT NOT NULL,
      pathway_id TEXT NOT NULL,
      FOREIGN KEY (pathway_id) REFERENCES pathways(id)
    )`);
  });
};

// Seed data
const seedData = () => {
  db.serialize(() => {
    // Insert pathways
    const pathways = [
      { id: 'path1', name: 'Pathway 1' },
      { id: 'path2', name: 'Pathway 2' },
      { id: 'path3', name: 'Pathway 3' }
    ];
    const insertPathway = db.prepare('INSERT OR IGNORE INTO pathways (id, name) VALUES (?, ?)');
    pathways.forEach(p => insertPathway.run(p.id, p.name));
    insertPathway.finalize();

    // Insert courses
    const courses = [
      { id: 'CSE142', name: 'Computer Programming I', quarter: 'Autumn', pathway_id: 'path1' },
      { id: 'CSE143', name: 'Computer Programming II', quarter: 'Winter', pathway_id: 'path1' },
      { id: 'MATH124', name: 'Calculus I', quarter: 'Autumn', pathway_id: 'path1' },
      { id: 'CSE142_2', name: 'Computer Programming I', quarter: 'Summer', pathway_id: 'path2' },
      { id: 'CSE143_2', name: 'Computer Programming II', quarter: 'Autumn', pathway_id: 'path2' },
      { id: 'MATH124_2', name: 'Calculus I', quarter: 'Summer', pathway_id: 'path2' },
      { id: 'CSE142_3', name: 'Computer Programming I', quarter: 'Autumn', pathway_id: 'path3' },
      { id: 'CSE143_3', name: 'Computer Programming II', quarter: 'Spring', pathway_id: 'path3' },
      { id: 'MATH124_3', name: 'Calculus I', quarter: 'Winter', pathway_id: 'path3' }
    ];
    const insertCourse = db.prepare('INSERT OR IGNORE INTO courses (id, name, quarter, pathway_id) VALUES (?, ?, ?, ?)');
    courses.forEach(c => insertCourse.run(c.id, c.name, c.quarter, c.pathway_id));
    insertCourse.finalize();
  });
};

createTables();
seedData();
db.close(() => {
  console.log('Database seeded successfully.');
}); 