import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import './App.css';
import { apiPost, apiGet, apiDelete } from './api';

interface User {
  userId: number;
  username: string;
  isAdmin: boolean;
}

function AdminBar({ user, onLogout }: { user: User | null, onLogout: () => void }) {
  return (
    <div className="admin-bar">
      {user ? (
        <>
          <span>Logged in as {user.isAdmin ? 'admin' : user.username}</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </>
      ) : (
        <span>Not logged in</span>
      )}
    </div>
  );
}

function StudentPortal({ user }: { user: User }) {
  const [myPlan, setMyPlan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMyPlan = () => {
    setLoading(true);
    apiGet('/api/myplan')
      .then(data => {
        setMyPlan(data.myplan || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load MyPlan');
        setLoading(false);
      });
  };

  useEffect(() => { fetchMyPlan(); }, []);

  const handleRemove = async (courseId: string) => {
    await apiDelete(`/api/myplan/${courseId}`);
    fetchMyPlan();
  };

  return (
    <div className="container">
      <h2>Welcome, {user.username}!</h2>
      <p>This is your student portal. Here are your planned courses:</p>
      <Link to="/student/courses" className="browse-btn">Browse Courses & Pathways</Link>
      {loading ? (
        <div>Loading MyPlan...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : myPlan.length === 0 ? (
        <div>No courses in your plan yet.</div>
      ) : (
        <div className="courses-grid">
          {myPlan.map((c: any) => (
            <div key={c.id} className="course-card">
              <div className="course-header">
                <h3>{c.id}: {c.name}</h3>
                <div className="course-meta">
                  <span className="quarter">{c.quarter}</span>
                  <span className="credits">{c.credits} credits</span>
                  {c.difficulty_rating && (
                    <span className="difficulty">Difficulty: {c.difficulty_rating}/5</span>
                  )}
                  {c.workload_rating && (
                    <span className="workload">Workload: {c.workload_rating}/5</span>
                  )}
                </div>
              </div>
              {c.description && (
                <p className="course-description">{c.description}</p>
              )}
              {c.prerequisites && c.prerequisites !== 'None' && (
                <div className="prerequisites">
                  <strong>Prerequisites:</strong> {c.prerequisites}
                </div>
              )}
              <div className="course-links">
                {c.reddit_link && (
                  <a href={c.reddit_link} target="_blank" rel="noopener noreferrer" className="link-btn reddit">
                    💬 Reddit Discussion
                  </a>
                )}
                {c.ratemyprofessor_link && (
                  <a href={c.ratemyprofessor_link} target="_blank" rel="noopener noreferrer" className="link-btn rmp">
                    👨‍🏫 RateMyProfessor
                  </a>
                )}
              </div>
              <button className="delete-btn" onClick={() => handleRemove(c.id)}>
                Remove from MyPlan
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StudentAuth({ onLogin }: { onLogin: (user: User) => void }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const endpoint = isRegistering ? '/api/register' : '/api/student-login';
      const data = await apiPost(endpoint, { username, password });
      setSuccess(data.message);
      if (data.user) {
        onLogin(data.user);
        navigate('/student');
      }
      setUsername('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-tabs">
        <button 
          className={!isRegistering ? 'active' : ''} 
          onClick={() => setIsRegistering(false)}
        >
          Login
        </button>
        <button 
          className={isRegistering ? 'active' : ''} 
          onClick={() => setIsRegistering(true)}
        >
          Register
        </button>
      </div>
      
      <form className="auth-form" onSubmit={handleSubmit}>
        <h3>{isRegistering ? 'Create Account' : 'Student Login'}</h3>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">
          {isRegistering ? 'Register' : 'Login'}
        </button>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
      </form>
    </div>
  );
}

function AdminLoginForm({ onLogin }: { onLogin: (user: User) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await apiPost('/api/login', { username, password });
      onLogin({ userId: 0, username: 'admin', isAdmin: true });
    } catch (err: any) {
      setError(err.message || 'Invalid credentials');
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h3>Admin Login</h3>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login as Admin</button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
}

function AddPathwayForm({ onAdd }: { onAdd: () => void }) {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const res = await fetch('/api/pathways', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id, name })
    });
    if (res.ok) {
      setSuccess('Pathway added!');
      setId(''); setName('');
      onAdd();
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to add pathway');
    }
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <h3>Add New Pathway</h3>
      <input value={id} onChange={e => setId(e.target.value)} placeholder="Pathway ID (e.g. path9)" required />
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Pathway Name" required />
      <button type="submit">Add Pathway</button>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
    </form>
  );
}

function AddCourseForm({ pathwayId, onAdd }: { pathwayId: string, onAdd: () => void }) {
  const [courseId, setCourseId] = useState('');
  const [name, setName] = useState('');
  const [quarter, setQuarter] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const res = await fetch(`/api/pathway/${pathwayId}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ courseId, name, quarter })
    });
    if (res.ok) {
      setSuccess('Course added!');
      setCourseId(''); setName(''); setQuarter('');
      onAdd();
    } else {
      const data = await res.json();
      setError(data.error || 'Failed to add course');
    }
  };

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <h3>Add New Course</h3>
      <input value={courseId} onChange={e => setCourseId(e.target.value)} placeholder="Course ID (e.g. INFO123)" required />
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Course Name" required />
      <input value={quarter} onChange={e => setQuarter(e.target.value)} placeholder="Quarter (e.g. Autumn)" required />
      <button type="submit">Add Course</button>
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}
    </form>
  );
}

function PathwaysList({ isAdmin }: { isAdmin: boolean }) {
  const [pathways, setPathways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refresh = () => {
    setLoading(true);
    apiGet('/api/pathways')
      .then(data => {
        setPathways(data.pathways);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load pathways');
        setLoading(false);
      });
  };
  useEffect(() => { refresh(); }, []);

  if (loading) return <div className="center">Loading pathways...</div>;
  if (error) return <div className="center error">{error}</div>;

  return (
    <div className="container">
      <h1>UW Informatics Pathways</h1>
      <ul className="pathway-list">
        {pathways.map((p: any) => (
          <li key={p.id}>
            <Link to={`/pathway/${p.id}`}>{p.name}</Link>
          </li>
        ))}
      </ul>
      {isAdmin && <AddPathwayForm onAdd={refresh} />}
      {isAdmin && <div className="admin-action">(Admin: You can add/edit pathways and courses in the backend or extend this UI!)</div>}
    </div>
  );
}

function PathwayCourses({ isAdmin, user }: { isAdmin: boolean, user: User | null }) {
  const { id } = useParams();
  const [courses, setCourses] = useState([]);
  const [pathwayName, setPathwayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [myPlanIds, setMyPlanIds] = useState<string[]>([]);
  const [quarter, setQuarter] = useState('All');
  const [availableQuarters, setAvailableQuarters] = useState<string[]>([]);

  // Fetch all courses for pathway to get available quarters
  useEffect(() => {
    if (!id) return;
    apiGet(`/api/pathway/${id}/courses`)
      .then(data => {
        const quarters = Array.from(new Set((data.courses || []).map((c: any) => String(c.quarter)))).sort();
        setAvailableQuarters(quarters as string[]);
      });
  }, [id]);

  const refresh = () => {
    setLoading(true);
    let url = `/api/pathway/${id}/courses`;
    if (quarter && quarter !== 'All') url += `?quarter=${encodeURIComponent(quarter)}`;
    apiGet(url)
      .then(data => {
        setCourses(data.courses);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load courses');
        setLoading(false);
      });
    apiGet('/api/pathways')
      .then(data => {
        const pathway = data.pathways.find((p: any) => p.id === id);
        setPathwayName(pathway ? pathway.name : id);
      });
    // If student, fetch their MyPlan
    if (user && !user.isAdmin) {
      apiGet('/api/myplan')
        .then(data => {
          setMyPlanIds((data.myplan || []).map((c: any) => c.id));
        });
    }
  };
  useEffect(() => { refresh(); }, [id, user, quarter]);

  const handleDelete = async (courseId: string) => {
    if (!window.confirm('Delete this course?')) return;
    await apiDelete(`/api/courses/${courseId}`);
    refresh();
  };

  const handleAddToMyPlan = async (courseId: string) => {
    await apiPost('/api/myplan', { courseId });
    refresh();
  };

  if (loading) return <div className="center">Loading courses...</div>;
  if (error) return <div className="center error">{error}</div>;

  return (
    <div className="container">
      <h2>{pathwayName}</h2>
      <Link to="/">← Back to all pathways</Link>
      <div style={{ margin: '16px 0' }}>
        <label htmlFor="quarter-select">Quarter: </label>
        <select id="quarter-select" value={quarter} onChange={e => setQuarter(e.target.value)}>
          <option value="All">All</option>
          {availableQuarters.map(q => (
            <option key={q} value={q}>{q}</option>
          ))}
        </select>
      </div>
      <div className="courses-grid">
        {courses.length === 0 ? (
          <div style={{ margin: '32px 0', fontStyle: 'italic' }}>No courses available for this quarter.</div>
        ) : courses.map((c: any) => (
          <div key={c.id} className="course-card">
            <div className="course-header">
              <h3>{c.id}: {c.name}</h3>
              <div className="course-meta">
                <span className="quarter">{c.quarter}</span>
                <span className="credits">{c.credits} credits</span>
                {c.difficulty_rating && (
                  <span className="difficulty">Difficulty: {c.difficulty_rating}/5</span>
                )}
                {c.workload_rating && (
                  <span className="workload">Workload: {c.workload_rating}/5</span>
                )}
              </div>
            </div>
            {c.description && (
              <p className="course-description">{c.description}</p>
            )}
            {c.prerequisites && c.prerequisites !== 'None' && (
              <div className="prerequisites">
                <strong>Prerequisites:</strong> {c.prerequisites}
              </div>
            )}
            <div className="course-links">
              {c.reddit_link && (
                <a href={c.reddit_link} target="_blank" rel="noopener noreferrer" className="link-btn reddit">
                  💬 Reddit Discussion
                </a>
              )}
              {c.ratemyprofessor_link && (
                <a href={c.ratemyprofessor_link} target="_blank" rel="noopener noreferrer" className="link-btn rmp">
                  👨‍🏫 RateMyProfessor
                </a>
              )}
            </div>
            {isAdmin && (
              <button className="delete-btn" onClick={() => handleDelete(c.id)}>
                Delete Course
              </button>
            )}
            {user && !user.isAdmin && (
              myPlanIds.includes(c.id) ? (
                <button className="delete-btn" disabled>In MyPlan</button>
              ) : (
                <button className="delete-btn" onClick={() => handleAddToMyPlan(c.id)}>
                  Add to MyPlan
                </button>
              )
            )}
          </div>
        ))}
      </div>
      {isAdmin && id && <AddCourseForm pathwayId={id} onAdd={refresh} />}
      {isAdmin && <div className="admin-action">(Admin: You can add/edit courses in the backend or extend this UI!)</div>}
    </div>
  );
}

// Helper: Parse days string to array
const parseDays = (days: string) => {
  if (!days) return [];
  // Accepts 'MWF', 'TuTh', etc.
  const map: { [key: string]: string } = { M: 'Mon', T: 'Tue', W: 'Wed', Th: 'Thu', F: 'Fri' };
  const result: string[] = [];
  let i = 0;
  while (i < days.length) {
    if (days[i] === 'T' && days[i + 1] === 'h') {
      result.push('Thu');
      i += 2;
    } else if (map[days[i]]) {
      result.push(map[days[i]]);
      i++;
    } else {
      i++;
    }
  }
  return result;
};

// Helper: Parse time string to { start, end } in minutes from 00:00
const parseTime = (time: string) => {
  if (!time) return null;
  const [start, end] = time.split('-');
  const toMinutes = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  return { start: toMinutes(start), end: toMinutes(end) };
};

function ScheduleGrid({ courses }: { courses: any[] }) {
  // Grid: Mon–Fri, 8am–6pm (600–1080 minutes)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const startHour = 8, endHour = 18;
  const hourSlots = Array.from({ length: endHour - startHour }, (_, i) => startHour + i);

  // Build a map: day -> array of { course, start, end }
  const dayMap: { [day: string]: Array<{ course: any, start: number, end: number }> } = {};
  days.forEach(day => (dayMap[day] = []));
  courses.forEach(c => {
    const courseDays = parseDays(c.schedule_days);
    const time = parseTime(c.schedule_time);
    if (courseDays.length && time) {
      courseDays.forEach(day => {
        dayMap[day].push({ course: c, start: time.start, end: time.end });
      });
    }
  });
  // Sort by start time
  days.forEach(day => dayMap[day].sort((a, b) => a.start - b.start));

  return (
    <div className="schedule-grid">
      <div className="schedule-header">
        <div className="schedule-time-col" />
        {days.map(day => (
          <div key={day} className="schedule-day-col schedule-header-cell">{day}</div>
        ))}
      </div>
      <div className="schedule-body">
        {hourSlots.map(hour => (
          <div key={hour} className="schedule-row">
            <div className="schedule-time-col">{hour}:00</div>
            {days.map(day => {
              // Find course block for this slot
              const block = dayMap[day].find(
                ({ start, end }) => start / 60 <= hour && end / 60 > hour
              );
              if (block && Math.floor(block.start / 60) === hour) {
                // Calculate block height (in rows)
                const duration = (block.end - block.start) / 60;
                return (
                  <div
                    key={day + hour}
                    className="schedule-block"
                    style={{ gridRow: `span ${Math.ceil(duration)}` }}
                    title={`${block.course.id}: ${block.course.name}\n${block.course.schedule_time}\n${block.course.start_date ? `Dates: ${block.course.start_date} to ${block.course.end_date}` : ''}`}
                  >
                    <div className="schedule-block-title">{block.course.id}</div>
                    <div className="schedule-block-time">{block.course.schedule_time}</div>
                    <div className="schedule-block-name">{block.course.name}</div>
                    {block.course.start_date && (
                      <div className="schedule-block-dates">
                        {block.course.start_date} to {block.course.end_date}
                      </div>
                    )}
                  </div>
                );
              } else {
                return <div key={day + hour} className="schedule-day-col schedule-cell" />;
              }
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function StudentMyPlan({ user: _user }: { user: User }) {
  const [myPlan, setMyPlan] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quarter, setQuarter] = useState('All');
  const [availableQuarters, setAvailableQuarters] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  const fetchMyPlan = () => {
    setLoading(true);
    apiGet('/api/myplan')
      .then(data => {
        setMyPlan(data.myplan || []);
        // Debug log
        console.log('Fetched myPlan:', data.myplan);
        // Extract available quarters from courses with valid quarter
        const quarters = Array.from(new Set((data.myplan || []).map((c: any) => c.quarter).filter((q: any) => typeof q === 'string' && q.trim() !== ''))).sort();
        setAvailableQuarters(quarters.length > 0 ? (quarters as string[]) : []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load MyPlan');
        setLoading(false);
      });
  };

  useEffect(() => { fetchMyPlan(); }, []);

  const handleRemove = async (courseId: string) => {
    await apiDelete(`/api/myplan/${courseId}`);
    fetchMyPlan();
  };

  // Filter courses by quarter and search
  const filteredPlan = myPlan.filter((c: any) =>
    (quarter === 'All' || c.quarter === quarter) &&
    (search === '' || c.name.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase()))
  );

  // Calculate median difficulty and workload
  const getMedian = (arr: number[]) => {
    if (arr.length === 0) return null;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  };
  const difficulties = myPlan
    .map((c: any) => typeof c.difficulty_rating === 'number' ? c.difficulty_rating : (c.difficulty_rating ? parseFloat(c.difficulty_rating) : null))
    .filter((d: number | null) => typeof d === 'number' && !isNaN(d)) as number[];
  const medianDifficulty = getMedian(difficulties);

  const workloads = myPlan
    .map((c: any) => typeof c.workload_rating === 'number' ? c.workload_rating : (c.workload_rating ? parseFloat(c.workload_rating) : null))
    .filter((w: number | null) => typeof w === 'number' && !isNaN(w)) as number[];
  const medianWorkload = getMedian(workloads);

  // Workload summary message
  const getWorkloadMessage = (value: number | null) => {
    if (value == null) return 'No workload ratings yet';
    if (value < 2) return 'Very manageable';
    if (value < 3) return 'Manageable';
    if (value < 4) return 'Challenging';
    return 'Very challenging';
  };

  // Render stars for the median
  const renderStars = (value: number | null) => {
    if (value == null) return <span style={{ color: '#888' }}>No difficulty ratings yet</span>;
    const rounded = Math.round(value * 2) / 2; // round to nearest 0.5
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rounded >= i) {
        stars.push(<span key={i} style={{ color: '#f7b731', fontSize: 24 }}>★</span>);
      } else if (rounded + 0.5 === i) {
        stars.push(<span key={i} style={{ color: '#f7b731', fontSize: 24 }}>☆</span>);
      } else {
        stars.push(<span key={i} style={{ color: '#ddd', fontSize: 24 }}>★</span>);
      }
    }
    return <span>{stars} <span style={{ fontSize: 16, color: '#333', marginLeft: 8 }}>(Median: {rounded} / 5)</span></span>;
  };

  return (
    <div className="container">
      <h2>MyPlan</h2>
      <Link to="/student/courses" className="browse-btn">Back to Course Browser</Link>
      <div style={{ margin: '16px 0' }}>
        <label htmlFor="quarter-select-myplan">Quarter: </label>
        <select id="quarter-select-myplan" value={quarter} onChange={e => setQuarter(e.target.value)}>
          <option value="All">All</option>
          {availableQuarters.length > 0 && availableQuarters.map(q => (
            <option key={q} value={q}>{q}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search by name or ID"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginLeft: 16, padding: '4px 8px', borderRadius: 4, border: '1px solid #ccc' }}
        />
      </div>
      <div style={{ margin: '24px 0', textAlign: 'center' }}>
        <strong>Median Difficulty:</strong> {renderStars(medianDifficulty)}
        {medianDifficulty != null && (
          <span style={{ marginLeft: 16, fontSize: 16, color: '#555' }}>Exact: {medianDifficulty.toFixed(2)} / 5</span>
        )}
      </div>
      <div style={{ margin: '12px 0', textAlign: 'center' }}>
        <strong>Median Workload:</strong> {medianWorkload != null ? medianWorkload.toFixed(2) + ' / 5' : 'No workload ratings yet'}
        {medianWorkload != null && (
          <span style={{ marginLeft: 16, fontSize: 16, color: '#555' }}>{getWorkloadMessage(medianWorkload)}</span>
        )}
      </div>
      <div style={{ margin: '32px 0' }}>
        <ScheduleGrid courses={filteredPlan} />
      </div>
      {loading ? (
        <div>Loading MyPlan...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : filteredPlan.length === 0 ? (
        <div>No courses in your plan match the selected filters.</div>
      ) : (
        <div className="courses-grid">
          {filteredPlan.map((c: any) => (
            <div key={c.id} className="course-card">
              <div className="course-header">
                <h3>{c.id}: {c.name}</h3>
                <div className="course-meta">
                  <span className="quarter">{c.quarter}</span>
                  <span className="credits">{c.credits} credits</span>
                  {c.difficulty_rating && (
                    <span className="difficulty">Difficulty: {c.difficulty_rating}/5</span>
                  )}
                  {c.workload_rating && (
                    <span className="workload">Workload: {c.workload_rating}/5</span>
                  )}
                </div>
              </div>
              {c.start_date && (
                <div className="course-dates">
                  <strong>Dates:</strong> {c.start_date} to {c.end_date}
                </div>
              )}
              {c.description && (
                <p className="course-description">{c.description}</p>
              )}
              {c.prerequisites && c.prerequisites !== 'None' && (
                <div className="prerequisites">
                  <strong>Prerequisites:</strong> {c.prerequisites}
                </div>
              )}
              <div className="course-links">
                {c.reddit_link && (
                  <a href={c.reddit_link} target="_blank" rel="noopener noreferrer" className="link-btn reddit">
                    💬 Reddit Discussion
                  </a>
                )}
                {c.ratemyprofessor_link && (
                  <a href={c.ratemyprofessor_link} target="_blank" rel="noopener noreferrer" className="link-btn rmp">
                    👨‍🏫 RateMyProfessor
                  </a>
                )}
              </div>
              <button className="delete-btn" onClick={() => handleRemove(c.id)}>
                Remove from MyPlan
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StudentCourseBrowser({ user: _user }: { user: User }) {
  const [pathways, setPathways] = useState<any[]>([]);
  const [selectedPathway, setSelectedPathway] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [myPlanIds, setMyPlanIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quarter, setQuarter] = useState('All');
  const [availableQuarters, setAvailableQuarters] = useState<string[]>([]);

  // Fetch pathways and MyPlan on mount
  useEffect(() => {
    apiGet('/api/pathways')
      .then(data => setPathways(data.pathways || []));
    apiGet('/api/myplan')
      .then(data => setMyPlanIds((data.myplan || []).map((c: any) => c.id)));
  }, []);

  // Fetch available quarters when pathway changes
  useEffect(() => {
    if (!selectedPathway) return setAvailableQuarters([]);
    apiGet(`/api/pathway/${selectedPathway}/courses`)
      .then(data => {
        const quarters = Array.from(new Set((data.courses || []).map((c: any) => String(c.quarter)))).sort();
        setAvailableQuarters(quarters as string[]);
      });
  }, [selectedPathway]);

  // Fetch courses for selected pathway
  useEffect(() => {
    if (!selectedPathway) return;
    setLoading(true);
    let url = `/api/pathway/${selectedPathway}/courses`;
    if (quarter && quarter !== 'All') url += `?quarter=${encodeURIComponent(quarter)}`;
    apiGet(url)
      .then(data => {
        setCourses(data.courses || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load courses');
        setLoading(false);
      });
    apiGet('/api/myplan')
      .then(data => setMyPlanIds((data.myplan || []).map((c: any) => c.id)));
  }, [selectedPathway, quarter]);

  const handleAddToMyPlan = async (courseId: string) => {
    await apiPost('/api/myplan', { courseId });
    setMyPlanIds([...myPlanIds, courseId]);
  };

  const handleRemoveFromMyPlan = async (courseId: string) => {
    await apiDelete(`/api/myplan/${courseId}`);
    setMyPlanIds(myPlanIds.filter(id => id !== courseId));
  };

  return (
    <div className="container">
      <h2>Browse Courses & Pathways</h2>
      <Link to="/student/myplan" className="browse-btn">View MyPlan</Link>
      <div style={{ marginBottom: 24 }}>
        <button
          className="browse-btn"
          onClick={() => setSelectedPathway(null)}
          style={{ marginRight: 12 }}
        >
          All Pathways
        </button>
        {pathways.map((p: any) => (
          <button
            key={p.id}
            className="browse-btn"
            style={{ marginRight: 8, background: selectedPathway === p.id ? 'linear-gradient(45deg, #764ba2, #667eea)' : undefined }}
            onClick={() => setSelectedPathway(p.id)}
          >
            {p.name}
          </button>
        ))}
        <span style={{ marginLeft: 16 }}>
          <label htmlFor="quarter-select-browser">Quarter: </label>
          <select id="quarter-select-browser" value={quarter} onChange={e => setQuarter(e.target.value)}>
            <option value="All">All</option>
            {availableQuarters.map(q => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
        </span>
      </div>
      {selectedPathway ? (
        loading ? <div>Loading courses...</div> : error ? <div className="error">{error}</div> : (
          <div className="courses-grid">
            {courses.length === 0 ? (
              <div style={{ margin: '32px 0', fontStyle: 'italic' }}>No courses available for this quarter.</div>
            ) : courses.map((c: any) => (
              <div key={c.id} className="course-card">
                <div className="course-header">
                  <h3>{c.id}: {c.name}</h3>
                  <div className="course-meta">
                    <span className="quarter">{c.quarter}</span>
                    <span className="credits">{c.credits} credits</span>
                    {c.difficulty_rating && (
                      <span className="difficulty">Difficulty: {c.difficulty_rating}/5</span>
                    )}
                    {c.workload_rating && (
                      <span className="workload">Workload: {c.workload_rating}/5</span>
                    )}
                  </div>
                </div>
                {c.description && (
                  <p className="course-description">{c.description}</p>
                )}
                {c.prerequisites && c.prerequisites !== 'None' && (
                  <div className="prerequisites">
                    <strong>Prerequisites:</strong> {c.prerequisites}
                  </div>
                )}
                <div className="course-links">
                  {c.reddit_link && (
                    <a href={c.reddit_link} target="_blank" rel="noopener noreferrer" className="link-btn reddit">
                      💬 Reddit Discussion
                    </a>
                  )}
                  {c.ratemyprofessor_link && (
                    <a href={c.ratemyprofessor_link} target="_blank" rel="noopener noreferrer" className="link-btn rmp">
                      👨‍🏫 RateMyProfessor
                    </a>
                  )}
                </div>
                {myPlanIds.includes(c.id) ? (
                  <button className="delete-btn" onClick={() => handleRemoveFromMyPlan(c.id)}>
                    Remove from MyPlan
                  </button>
                ) : (
                  <button className="delete-btn" onClick={() => handleAddToMyPlan(c.id)}>
                    Add to MyPlan
                  </button>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        <div style={{ marginTop: 32 }}>
          <h3>Select a pathway to view its courses.</h3>
        </div>
      )}
    </div>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);

  // Check login state on mount - simplified approach
  useEffect(() => {
    // Always start with no user, show public content
    setUser(null);
    
    // Optionally check for existing session later if needed
    // For now, let users see the public content and login forms
  }, []);

  const handleLogin = (user: User) => {
    setUser(user);
  };

  const handleLogout = async () => {
    await apiPost('/api/logout', {});
    setUser(null);
  };

  return (
    <Router>
      <AdminBar user={user} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={
          <>
            <StudentAuth onLogin={handleLogin} />
            <AdminLoginForm onLogin={handleLogin} />
            <PathwaysList isAdmin={user?.isAdmin || false} />
          </>
        } />
        <Route path="/pathway/:id" element={<PathwayCourses isAdmin={user?.isAdmin || false} user={user} />} />
        <Route path="/student" element={
          user && !user.isAdmin ? <StudentPortal user={user} /> : <div className="container"><h2>Unauthorized</h2><p>You must be logged in as a student to view this page.</p></div>
        } />
        <Route path="/student/courses" element={
          user && !user.isAdmin ? <StudentCourseBrowser user={user} /> : <div className="container"><h2>Unauthorized</h2><p>You must be logged in as a student to view this page.</p></div>
        } />
        <Route path="/student/myplan" element={
          user && !user.isAdmin ? <StudentMyPlan user={user} /> : <div className="container"><h2>Unauthorized</h2><p>You must be logged in as a student to view this page.</p></div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
