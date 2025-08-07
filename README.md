# UW Course Planner - Beta Version

A comprehensive course planning application for University of Washington students, designed to help navigate prerequisites, course availability, and create efficient degree plans.

## 🎯 Features

### Current Features (Beta)
- **User Authentication**: Register and login with secure password hashing
- **Student Input Collection**: Save major, minor, focus area, class standing, prerequisites, and graduation timeline
- **Pathway Generator**: Generate multiple course pathway options based on student input
- **Course Exploration**: Browse courses for each pathway with quarter scheduling

### Planned Features
- Course and professor reviews integration (Reddit, Rate My Professor)
- Visual schedule builder with drag-and-drop interface
- Course plan optimizer for efficient graduation paths
- Prerequisites validation and warnings
- Time conflict detection

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd UWapp
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Start the backend server**
   ```bash
   cd ../backend
   npm run dev
   ```
   The backend will run on `http://localhost:5000`

5. **Start the frontend development server**
   ```bash
   cd ../frontend
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/register
Content-Type: application/json

{
  "username": "student123",
  "password": "securepassword"
}
```

#### Login User
```http
POST /api/login
Content-Type: application/json

{
  "username": "student123",
  "password": "securepassword"
}
```

### Student Input Endpoints

#### Save Student Input
```http
POST /api/student-input
Content-Type: application/json

{
  "username": "student123",
  "major": "Computer Science",
  "minor": "Mathematics",
  "focusArea": "Artificial Intelligence",
  "classStanding": "Sophomore",
  "prerequisitesCompleted": ["MATH124", "CSE142"],
  "yearsToGraduate": 3
}
```

#### Get Student Input
```http
GET /api/student-input?username=student123
```

### Pathway Endpoints

#### Generate Pathways
```http
POST /api/pathways
Content-Type: application/json

{
  "username": "student123"
}
```

#### Get Courses for Pathway
```http
GET /api/pathway/{pathwayId}/courses
```

Example: `GET /api/pathway/path1/courses`

## 🛠️ Technology Stack

### Backend
- **Node.js** with **Express.js**
- **TypeScript** for type safety
- **SQLite** database with **sqlite3**
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests

### Frontend
- **React** with **TypeScript**
- **Vite** for fast development and building
- **CSS** for styling

## 📁 Project Structure

```
UWapp/
├── backend/
│   ├── src/
│   │   └── index.ts          # Main backend server
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx           # Main React component
│   │   ├── main.tsx          # React entry point
│   │   └── App.css           # Styles
│   ├── package.json
│   └── vite.config.ts
├── .gitignore
└── README.md
```

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Database
The application uses SQLite for data storage. The database file (`database.db`) is created automatically when you first run the backend.

## 🤝 Contributing

This is a beta version. Contributions are welcome! Please feel free to submit issues and enhancement requests.

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions, please open an issue in the GitHub repository.

---

**Note**: This is a beta version. Features are being actively developed and may change.
