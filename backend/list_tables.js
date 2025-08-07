const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./backend/database.db');

db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('Error fetching tables:', err);
  } else {
    console.log('Tables in database:');
    tables.forEach(table => console.log(table.name));
  }
  db.close();
}); 