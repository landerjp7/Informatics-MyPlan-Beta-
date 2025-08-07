const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('database.db');

db.serialize(() => {
  db.get("PRAGMA table_info(courses)", (err, row) => {
    if (err) {
      console.error('Error checking table info:', err);
      db.close();
      return;
    }
    db.all("PRAGMA table_info(courses)", (err, columns) => {
      if (err) {
        console.error('Error fetching columns:', err);
        db.close();
        return;
      }
      const hasQuarter = columns.some(col => col.name === 'quarter');
      if (!hasQuarter) {
        db.run("ALTER TABLE courses ADD COLUMN quarter TEXT DEFAULT 'Autumn'", (err) => {
          if (err) {
            console.error('Error adding quarter column:', err);
          } else {
            console.log("'quarter' column added to courses table.");
            db.run("UPDATE courses SET quarter = 'Autumn' WHERE quarter IS NULL", (err) => {
              if (err) {
                console.error('Error setting default quarter:', err);
              } else {
                console.log("All existing courses set to 'Autumn' as default quarter.");
              }
              db.close();
            });
          }
        });
      } else {
        console.log("'quarter' column already exists. No changes made.");
        db.close();
      }
    });
  });
}); 