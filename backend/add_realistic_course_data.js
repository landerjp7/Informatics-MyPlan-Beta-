const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.db');

const realisticCourses = [
  // UX Pathway
  {
    id: 'INFO360', name: 'Design Thinking', quarter: 'Autumn', pathway_id: 'path1',
    description: 'Learn human-centered design methods to solve complex problems. Students work in teams to understand user needs, generate ideas, and prototype solutions.',
    credits: 4,
    prerequisites: 'INFO200 or permission of instructor',
    reddit_link: 'https://www.reddit.com/r/udub/search/?q=INFO360',
    ratemyprofessor_link: 'https://www.ratemyprofessors.com/search?query=INFO360%20UW',
    difficulty_rating: 3.2,
    workload_rating: 3.5
  },
  {
    id: 'INFO365', name: 'Mobile Application Design', quarter: 'Winter', pathway_id: 'path1',
    description: 'Design and develop mobile applications using modern frameworks. Focus on user experience, performance, and platform-specific design patterns.',
    credits: 4,
    prerequisites: 'INFO340 or equivalent programming experience',
    reddit_link: 'https://www.reddit.com/r/udub/search/?q=INFO365',
    ratemyprofessor_link: 'https://www.ratemyprofessors.com/search?query=INFO365%20UW',
    difficulty_rating: 3.8,
    workload_rating: 4.0
  },
  {
    id: 'INFO462', name: 'User Interface Design', quarter: 'Spring', pathway_id: 'path1',
    description: 'Advanced UI/UX design principles and implementation. Students create interactive prototypes and conduct user research.',
    credits: 4,
    prerequisites: 'INFO360 or permission of instructor',
    reddit_link: 'https://www.reddit.com/r/udub/search/?q=INFO462',
    ratemyprofessor_link: 'https://www.ratemyprofessors.com/search?query=INFO462%20UW',
    difficulty_rating: 3.5,
    workload_rating: 3.8
  },

  // HCI Pathway
  {
    id: 'INFO200', name: 'Intellectual Foundations of Informatics', quarter: 'Autumn', pathway_id: 'path2',
    description: 'Introduction to the intellectual foundations of informatics, including information theory, human-computer interaction, and social computing.',
    credits: 4,
    prerequisites: 'None',
    reddit_link: 'https://www.reddit.com/r/udub/search/?q=INFO200',
    ratemyprofessor_link: 'https://www.ratemyprofessors.com/search?query=INFO200%20UW',
    difficulty_rating: 2.8,
    workload_rating: 3.0
  },
  {
    id: 'INFO340', name: 'Client-Side Development', quarter: 'Winter', pathway_id: 'path2',
    description: 'Modern web development focusing on front-end technologies. Learn HTML, CSS, JavaScript, and responsive design principles.',
    credits: 4,
    prerequisites: 'INFO201 or equivalent programming experience',
    reddit_link: 'https://www.reddit.com/r/udub/search/?q=INFO340',
    ratemyprofessor_link: 'https://www.ratemyprofessors.com/search?query=INFO340%20UW',
    difficulty_rating: 3.5,
    workload_rating: 3.7
  },
  {
    id: 'INFO441', name: 'Cooperative Software Development', quarter: 'Spring', pathway_id: 'path2',
    description: 'Team-based software development using agile methodologies. Students work on real projects with industry partners.',
    credits: 4,
    prerequisites: 'INFO340, INFO350',
    reddit_link: 'https://www.reddit.com/r/udub/search/?q=INFO441',
    ratemyprofessor_link: 'https://www.ratemyprofessors.com/search?query=INFO441%20UW',
    difficulty_rating: 4.0,
    workload_rating: 4.2
  },

  // Software Development Pathway
  {
    id: 'INFO201', name: 'Technical Foundations of Informatics', quarter: 'Autumn', pathway_id: 'path3',
    description: 'Programming fundamentals using Python. Covers data structures, algorithms, and software engineering principles.',
    credits: 4,
    prerequisites: 'None',
    reddit_link: 'https://www.reddit.com/r/udub/search/?q=INFO201',
    ratemyprofessor_link: 'https://www.ratemyprofessors.com/search?query=INFO201%20UW',
    difficulty_rating: 3.0,
    workload_rating: 3.3
  },
  {
    id: 'INFO350', name: 'Information Systems Analysis & Design', quarter: 'Winter', pathway_id: 'path3',
    description: 'Systematic approach to analyzing and designing information systems. Covers requirements gathering, modeling, and implementation.',
    credits: 4,
    prerequisites: 'INFO201',
    reddit_link: 'https://www.reddit.com/r/udub/search/?q=INFO350',
    ratemyprofessor_link: 'https://www.ratemyprofessors.com/search?query=INFO350%20UW',
    difficulty_rating: 3.3,
    workload_rating: 3.5
  },
  {
    id: 'INFO448', name: 'Introduction to Full-Stack Development', quarter: 'Spring', pathway_id: 'path3',
    description: 'Complete web application development from database to frontend. Learn modern frameworks and deployment strategies.',
    credits: 4,
    prerequisites: 'INFO340, INFO350',
    reddit_link: 'https://www.reddit.com/r/udub/search/?q=INFO448',
    ratemyprofessor_link: 'https://www.ratemyprofessors.com/search?query=INFO448%20UW',
    difficulty_rating: 4.2,
    workload_rating: 4.5
  },

  // Health Informatics Pathway
  {
    id: 'INFO280', name: 'Information and Power', quarter: 'Autumn', pathway_id: 'path4',
    description: 'Examines how information technologies shape power dynamics in society, with focus on healthcare and public health.',
    credits: 4,
    prerequisites: 'None',
    reddit_link: 'https://www.reddit.com/r/udub/search/?q=INFO280',
    ratemyprofessor_link: 'https://www.ratemyprofessors.com/search?query=INFO280%20UW',
    difficulty_rating: 2.5,
    workload_rating: 2.8
  },
  {
    id: 'INFO474', name: 'Information Retrieval Systems', quarter: 'Winter', pathway_id: 'path4',
    description: 'Design and implementation of search engines and information retrieval systems, with applications in healthcare.',
    credits: 4,
    prerequisites: 'INFO201',
    reddit_link: 'https://www.reddit.com/r/udub/search/?q=INFO474',
    ratemyprofessor_link: 'https://www.ratemyprofessors.com/search?query=INFO474%20UW',
    difficulty_rating: 3.8,
    workload_rating: 4.0
  },
  {
    id: 'INFO478', name: 'Health Informatics', quarter: 'Spring', pathway_id: 'path4',
    description: 'Application of information technology to healthcare. Covers electronic health records, telemedicine, and health data analytics.',
    credits: 4,
    prerequisites: 'INFO201, INFO280',
    reddit_link: 'https://www.reddit.com/r/udub/search/?q=INFO478',
    ratemyprofessor_link: 'https://www.ratemyprofessors.com/search?query=INFO478%20UW',
    difficulty_rating: 3.5,
    workload_rating: 3.7
  },

  // Cybersecurity Pathway
  {
    id: 'INFO310', name: 'Information Assurance and Cybersecurity', quarter: 'Autumn', pathway_id: 'path5',
    description: 'Fundamentals of cybersecurity including threat modeling, cryptography, and secure system design.',
    credits: 4,
    prerequisites: 'INFO201',
    reddit_link: 'https://www.reddit.com/r/udub/search/?q=INFO310',
    ratemyprofessor_link: 'https://www.ratemyprofessors.com/search?query=INFO310%20UW',
    difficulty_rating: 3.7,
    workload_rating: 3.9
  },
  {
    id: 'INFO312', name: 'Information Security and Privacy', quarter: 'Winter', pathway_id: 'path5',
    description: 'Advanced topics in information security including privacy-preserving technologies and security policy.',
    credits: 4,
    prerequisites: 'INFO310',
    reddit_link: 'https://www.reddit.com/r/udub/search/?q=INFO312',
    ratemyprofessor_link: 'https://www.ratemyprofessors.com/search?query=INFO312%20UW',
    difficulty_rating: 4.0,
    workload_rating: 4.2
  },
  {
    id: 'INFO313', name: 'Ethical Hacking', quarter: 'Spring', pathway_id: 'path5',
    description: 'Penetration testing and ethical hacking techniques. Students learn to identify and exploit security vulnerabilities.',
    credits: 4,
    prerequisites: 'INFO310',
    reddit_link: 'https://www.reddit.com/r/udub/search/?q=INFO313',
    ratemyprofessor_link: 'https://www.ratemyprofessors.com/search?query=INFO313%20UW',
    difficulty_rating: 4.3,
    workload_rating: 4.5
  },

  // Information Management Pathway
  {
    id: 'INFO320', name: 'Database Design and Management', quarter: 'Autumn', pathway_id: 'path6',
    description: 'Database design principles, SQL, and data management systems. Covers both relational and NoSQL databases.',
    credits: 4,
    prerequisites: 'INFO201',
    reddit_link: 'https://www.reddit.com/r/udub/search/?q=INFO320',
    ratemyprofessor_link: 'https://www.ratemyprofessors.com/search?query=INFO320%20UW',
    difficulty_rating: 3.4,
    workload_rating: 3.6
  },
  {
    id: 'INFO321', name: 'Information Architecture', quarter: 'Winter', pathway_id: 'path6',
    description: 'Design of information systems and digital spaces. Focus on organization, navigation, and user experience.',
    credits: 4,
    prerequisites: 'INFO200',
    reddit_link: 'https://www.reddit.com/r/udub/search/?q=INFO321',
    ratemyprofessor_link: 'https://www.ratemyprofessors.com/search?query=INFO321%20UW',
    difficulty_rating: 3.2,
    workload_rating: 3.4
  },
  {
    id: 'INFO322', name: 'Enterprise Information Systems', quarter: 'Spring', pathway_id: 'path6',
    description: 'Large-scale information systems used in organizations. Covers ERP systems, business processes, and system integration.',
    credits: 4,
    prerequisites: 'INFO320, INFO350',
    reddit_link: 'https://www.reddit.com/r/udub/search/?q=INFO322',
    ratemyprofessor_link: 'https://www.ratemyprofessors.com/search?query=INFO322%20UW',
    difficulty_rating: 3.6,
    workload_rating: 3.8
  },

  // Information and Society Pathway
  {
    id: 'INFO380', name: 'Product and Information Systems Management', quarter: 'Winter', pathway_id: 'path7',
    description: 'Management of information systems and digital products. Covers project management, team leadership, and strategic planning.',
    credits: 4,
    prerequisites: 'INFO200',
    reddit_link: 'https://www.reddit.com/r/udub/search/?q=INFO380',
    ratemyprofessor_link: 'https://www.ratemyprofessors.com/search?query=INFO380%20UW',
    difficulty_rating: 3.1,
    workload_rating: 3.3
  },
  {
    id: 'INFO381', name: 'Social Justice and Information', quarter: 'Spring', pathway_id: 'path7',
    description: 'Examines how information technologies can promote or hinder social justice. Focus on digital equity and inclusion.',
    credits: 4,
    prerequisites: 'INFO280',
    reddit_link: 'https://www.reddit.com/r/udub/search/?q=INFO381',
    ratemyprofessor_link: 'https://www.ratemyprofessors.com/search?query=INFO381%20UW',
    difficulty_rating: 2.8,
    workload_rating: 3.0
  },

  // Data Science Pathway
  {
    id: 'INFO370', name: 'Core Methods in Data Science', quarter: 'Autumn', pathway_id: 'path8',
    description: 'Introduction to data science methods including data cleaning, exploratory analysis, and statistical modeling.',
    credits: 4,
    prerequisites: 'INFO201, MATH124',
    reddit_link: 'https://www.reddit.com/r/udub/search/?q=INFO370',
    ratemyprofessor_link: 'https://www.ratemyprofessors.com/search?query=INFO370%20UW',
    difficulty_rating: 3.8,
    workload_rating: 4.0
  },
  {
    id: 'INFO371', name: 'Advanced Methods in Data Science', quarter: 'Winter', pathway_id: 'path8',
    description: 'Advanced data science techniques including machine learning, predictive modeling, and big data analytics.',
    credits: 4,
    prerequisites: 'INFO370',
    reddit_link: 'https://www.reddit.com/r/udub/search/?q=INFO371',
    ratemyprofessor_link: 'https://www.ratemyprofessors.com/search?query=INFO371%20UW',
    difficulty_rating: 4.2,
    workload_rating: 4.4
  },
  {
    id: 'INFO472', name: 'Data Visualization', quarter: 'Spring', pathway_id: 'path8',
    description: 'Principles and techniques for creating effective data visualizations. Covers design principles and interactive visualizations.',
    credits: 4,
    prerequisites: 'INFO370',
    reddit_link: 'https://www.reddit.com/r/udub/search/?q=INFO472',
    ratemyprofessor_link: 'https://www.ratemyprofessors.com/search?query=INFO472%20UW',
    difficulty_rating: 3.5,
    workload_rating: 3.7
  }
];

db.serialize(() => {
  // Clear existing courses and add new ones with enhanced data
  db.run('DELETE FROM courses', [], (err) => {
    if (err) {
      console.error('Error clearing courses:', err);
      return;
    }
    
    const insertCourse = db.prepare(`
      INSERT INTO courses (id, name, quarter, pathway_id, description, credits, prerequisites, reddit_link, ratemyprofessor_link, difficulty_rating, workload_rating) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    realisticCourses.forEach(course => {
      insertCourse.run(
        course.id, course.name, course.quarter, course.pathway_id,
        course.description, course.credits, course.prerequisites,
        course.reddit_link, course.ratemyprofessor_link,
        course.difficulty_rating, course.workload_rating
      );
    });
    
    insertCourse.finalize();
  });
});

db.close(() => {
  console.log('Realistic UW Informatics course data added successfully!');
}); 