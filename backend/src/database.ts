// Simple in-memory database for deployment
// This avoids the SQLite3 compilation issues on Railway

interface User {
  id: number;
  username: string;
  password_hash: string;
  is_admin: boolean;
  created_at: string;
}

interface Course {
  id: number;
  course_code: string;
  title: string;
  credits: number;
  description: string;
  prerequisites: string;
  quarter: string;
  created_at: string;
}

interface UserCourse {
  id: number;
  user_id: number;
  course_id: number;
  quarter: string;
  year: number;
  status: string;
  created_at: string;
}

// In-memory storage
let users: User[] = [];
let courses: Course[] = [];
let userCourses: UserCourse[] = [];

let nextUserId = 1;
let nextCourseId = 1;
let nextUserCourseId = 1;

// Initialize database connection
export function initializeDatabase(): Promise<void> {
  return new Promise((resolve) => {
    console.log('In-memory database initialized successfully');
    
    // Add some sample data
    users = [
      {
        id: 1,
        username: 'admin',
        password_hash: 'admin123',
        is_admin: true,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        username: 'student',
        password_hash: 'student123',
        is_admin: false,
        created_at: new Date().toISOString()
      }
    ];
    
    courses = [
      {
        id: 1,
        course_code: 'INFO200',
        title: 'Foundations of Informatics',
        credits: 5,
        description: 'Introduction to informatics concepts and methods',
        prerequisites: 'None',
        quarter: 'Autumn 2024',
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        course_code: 'INFO201',
        title: 'Technical Foundations of Informatics',
        credits: 5,
        description: 'Technical skills for informatics',
        prerequisites: 'INFO200',
        quarter: 'Winter 2025',
        created_at: new Date().toISOString()
      }
    ];
    
    nextUserId = 3;
    nextCourseId = 3;
    nextUserCourseId = 1;
    
    resolve();
  });
}

// Get database instance (for compatibility)
export function getDatabase(): any {
  return null; // Not used with in-memory storage
}

// Close database connections
export function closeDatabase(): Promise<void> {
  return new Promise((resolve) => {
    console.log('In-memory database closed');
    resolve();
  });
}

// Database query helper
export function query(sql: string, params: any[] = []): Promise<any[]> {
  return new Promise((resolve) => {
    // Simple query parsing for basic operations
    if (sql.toLowerCase().includes('select') && sql.toLowerCase().includes('users')) {
      resolve(users);
    } else if (sql.toLowerCase().includes('select') && sql.toLowerCase().includes('courses')) {
      resolve(courses);
    } else if (sql.toLowerCase().includes('select') && sql.toLowerCase().includes('user_courses')) {
      resolve(userCourses);
    } else {
      resolve([]);
    }
  });
}

// Database execute helper (for INSERT, UPDATE, DELETE)
export function execute(sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve) => {
    if (sql.toLowerCase().includes('insert into users')) {
      const newUser: User = {
        id: nextUserId++,
        username: params[0] || 'user',
        password_hash: params[1] || 'password',
        is_admin: params[2] || false,
        created_at: new Date().toISOString()
      };
      users.push(newUser);
      resolve({ lastID: newUser.id });
    } else if (sql.toLowerCase().includes('insert into courses')) {
      const newCourse: Course = {
        id: nextCourseId++,
        course_code: params[0] || 'COURSE',
        title: params[1] || 'Course Title',
        credits: params[2] || 5,
        description: params[3] || 'Course description',
        prerequisites: params[4] || 'None',
        quarter: params[5] || 'Autumn 2024',
        created_at: new Date().toISOString()
      };
      courses.push(newCourse);
      resolve({ lastID: newCourse.id });
    } else if (sql.toLowerCase().includes('insert into user_courses')) {
      const newUserCourse: UserCourse = {
        id: nextUserCourseId++,
        user_id: params[0] || 1,
        course_id: params[1] || 1,
        quarter: params[2] || 'Autumn 2024',
        year: params[3] || 2024,
        status: params[4] || 'planned',
        created_at: new Date().toISOString()
      };
      userCourses.push(newUserCourse);
      resolve({ lastID: newUserCourse.id });
    } else {
      resolve({ changes: 0 });
    }
  });
}
