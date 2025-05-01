import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [step, setStep] = useState('welcome');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');


  const API = 'http://localhost:8080';

  useEffect(() => {
    if (isLoggedIn) {
      fetchTasks();
    }
  }, [isLoggedIn]);

  const sendOtp = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    setSendingOtp(true);
    setOtpMessage("Sending OTP...");

    try {
      await axios.post(`${API}/otp/send`, null, { params: { email } });
      setOtpMessage("OTP sent to your email.");
      setStep("verify");
    } catch (err) {
      setOtpMessage("Failed to send OTP. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };



  const verifyOtp = async () => {
    const otpRegex = /^[0-9]{6}$/;
    if (!otpRegex.test(otp)) {
      alert("OTP must be exactly 6 digits.");
      return;
    }

    try {
      const response = await axios.post(`${API}/otp/verify`, null, {
        params: { email, otp }
      });

      if (response.data === true) {
        setIsLoggedIn(true);
        setStep('tasks');
      } else {
        alert('Invalid OTP');
      }
    } catch (err) {
      alert('OTP verification failed');
    }
  };


  const fetchTasks = async () => {
    const response = await axios.get(`${API}/tasks`, { params: { email } });
    setTasks(response.data);
  };

  const addTask = async () => {
    if (!newTitle.trim() || !newDescription.trim()) {
      alert("Task title and description cannot be empty.");
      return;
    }

    const badWords = ['DROP', 'DELETE', 'UPDATE', 'INSERT', '--', ';', '/*', '*/'];
    const titleUpper = newTitle.toUpperCase();
    const descriptionUpper = newDescription.toUpperCase();

    for (let word of badWords) {
      if (titleUpper.includes(word) || descriptionUpper.includes(word)) {
        alert("Invalid input detected. Please avoid SQL keywords.");
        return;
      }
    }

    await axios.post(`${API}/tasks`, {
      title: newTitle,
      description: newDescription,
      done: false,
      userEmail: email
    });

    setNewTitle('');
    setNewDescription('');
    fetchTasks();
  };


  const markTaskDone = async (task) => {
    await axios.put(`${API}/tasks/${task.id}`, {
      title: task.title,
      description: task.description,
      done: true,
      userEmail: email
    });
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await axios.delete(`${API}/tasks/${id}`);
    fetchTasks();
  };

  const logout = () => {
    setIsLoggedIn(false);
    setEmail('');
    setOtp('');
    setTasks([]);
    setOtpMessage('')
    setStep('welcome');
  };

  return (
      <div className="container">
        {!isLoggedIn ? (
            <>
              {step === 'welcome' && (
                  <div className="login-box">
                    <h2>Welcome to Task Manager</h2>
                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button onClick={sendOtp} disabled={sendingOtp}>
                      {sendingOtp ? 'Sending...' : 'Send OTP'}
                    </button>
                    {otpMessage && <p style={{ color: 'gray' }}>{otpMessage}</p>}
                  </div>
              )}

              {step === 'verify' && (
                  <div className="login-box">
                    <h2>Verify OTP</h2>
                    <p>OTP was sent to <b>{email}</b></p>
                    <input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />
                    <button onClick={verifyOtp}>Verify</button>
                    <button onClick={() => setStep('welcome')} style={{ marginTop: '0.5rem' }}>
                      Change Email
                    </button>
                  </div>
              )}
            </>
        ) : (
            <>
              <h1>{email}'s Task List</h1>
              <button onClick={logout} style={{ float: 'right' }}>Logout</button>

              <div className="add-task">
                <input
                    placeholder="Title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                />
                <input
                    placeholder="Description"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                />
                <button onClick={addTask}>Add Task</button>
              </div>

              <ul>
                {tasks.map((task) => (
                    <li key={task.id} className={`task-item ${task.done ? 'done' : ''}`}>
          <span>
            <b>{task.title}</b>: {task.description}
          </span>
                      <span>
            {!task.done && <button onClick={() => markTaskDone(task)}>Done</button>}
                        <button onClick={() => deleteTask(task.id)} style={{ marginLeft: '0.5rem' }}>
              Delete
            </button>
          </span>
                    </li>
                ))}
              </ul>
            </>
        )}

      </div>
  );
}

export default App;
