// App.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableTask({ task, markTaskDone, deleteTask }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
      <li ref={setNodeRef} style={style} {...attributes} className={`task-item ${task.done ? 'done' : ''}`}>
      <span {...listeners}>
        <strong>{task.title}</strong>: {task.description}
        {task.attachmentUrl && (
            <div>
              <a href={task.attachmentUrl} target="_blank" rel="noreferrer">📎 View Attachment</a>
            </div>
        )}
      </span>
        <span>
        {task.done ? (
            <button
                className="btn"
                onClick={(e) => {
                  e.stopPropagation();
                  markTaskDone(task, false);
                }}
            >
              Undone
            </button>
        ) : (
            <button
                className="btn"
                onClick={(e) => {
                  e.stopPropagation();
                  markTaskDone(task, true);
                }}
            >
              Done
            </button>
        )}
          <button
              className="btn"
              onClick={(e) => {
                e.stopPropagation();
                deleteTask(task.id);
              }}
          >
          Delete
        </button>
      </span>
      </li>
  );
}

function App() {
  const [step, setStep] = useState('welcome');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');

  const API = 'http://localhost:8080';

  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    if (isLoggedIn) fetchTasks();
  }, [isLoggedIn]);

  const sendOtp = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) return alert("Invalid email.");
    setSendingOtp(true);
    setOtpMessage("Sending OTP...");
    try {
      await axios.post(`${API}/otp/send`, null, { params: { email } });
      setOtpMessage("OTP sent to your email.");
      setStep("verify");
    } catch {
      setOtpMessage("Failed to send OTP.");
    } finally {
      setSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    if (!/^\d{6}$/.test(otp) && email !== 'test@alex.com') return alert("Invalid OTP.");
    try {
      const res = await axios.post(`${API}/otp/verify`, null, { params: { email, otp } });
      if (res.data === true) {
        setIsLoggedIn(true);
        setStep('tasks');
      } else alert("Invalid OTP");
    } catch {
      alert("Verification failed.");
    }
  };

  const fetchTasks = async () => {
    const res = await axios.get(`${API}/tasks`, { params: { email } });
    setTasks(res.data);
  };

  const uploadAttachment = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post(`${API}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return res.data;
    } catch {
      alert("Upload failed");
      return null;
    }
  };

  const addTask = async () => {
    if (!newTitle.trim() || !newDescription.trim()) return alert("Missing fields");
    const badWords = ['DROP', 'DELETE', 'UPDATE', 'INSERT', '--', ';'];
    const upper = `${newTitle} ${newDescription}`.toUpperCase();
    if (badWords.some(w => upper.includes(w))) return alert("Invalid input.");

    let attachmentUrl = null;
    if (selectedFile) {
      attachmentUrl = await uploadAttachment(selectedFile);
      if (!attachmentUrl) return;
    }

    await axios.post(`${API}/tasks`, {
      title: newTitle,
      description: newDescription,
      done: false,
      userEmail: email,
      attachmentUrl
    });

    setNewTitle('');
    setNewDescription('');
    setSelectedFile(null);
    setPreviewUrl(null);
    fetchTasks();
  };

  const markTaskDone = async (task, done = true) => {
    await axios.put(`${API}/tasks/${task.id}`, { ...task, done });
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
    setOtpMessage('');
    setStep('welcome');
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = tasks.findIndex(t => t.id === active.id);
    const newIndex = tasks.findIndex(t => t.id === over.id);
    setTasks((items) => arrayMove(items, oldIndex, newIndex));
  };

  return (
      <div className="container">
        {!isLoggedIn ? (
            <div className="form-card">
              {step === 'welcome' && (
                  <>
                    <h1>Task Manager</h1>
                    <h2>Login</h2>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" />
                    <button className="btn" onClick={sendOtp} disabled={sendingOtp}>{sendingOtp ? 'Sending...' : 'Send OTP'}</button>
                    {otpMessage && <p>{otpMessage}</p>}
                  </>
              )}
              {step === 'verify' && (
                  <>
                    <h2>Verify OTP</h2>
                    <p>OTP sent to {email}</p>
                    <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Enter OTP" />
                    <button className="btn" onClick={verifyOtp}>Verify</button>
                    <button className="btn" onClick={() => setStep('welcome')}>Change Email</button>
                  </>
              )}
            </div>
        ) : (
            <>
              <header>
                <h1>Welcome, {email}</h1>
                <button className="btn" onClick={logout}>Logout</button>
              </header>

              <section>
                <div className="form-card">
                  <h2>New Task</h2>
                  <input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Task Title" />
                  <input value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="Task Description" />
                  <input type="file" onChange={e => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const types = ['image/jpeg', 'image/png', 'application/pdf', 'audio/mpeg', 'audio/wav'];
                    if (!types.includes(file.type)) return alert("Unsupported file type.");
                    if (file.size > 5 * 1024 * 1024) return alert("File too large (max 5MB).")
                    setSelectedFile(file);
                    if (file.type.startsWith('image/')) {
                      const reader = new FileReader();
                      reader.onloadend = () => setPreviewUrl(reader.result);
                      reader.readAsDataURL(file);
                    } else setPreviewUrl(null);
                  }} />
                  {previewUrl && <img src={previewUrl} alt="Preview" className="preview-img" />}
                  <button className="btn" onClick={addTask}>Add Task</button>
                </div>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
                    <ul className="task-list">
                      {tasks.map((task) => (
                          <SortableTask
                              key={task.id}
                              task={task}
                              markTaskDone={markTaskDone}
                              deleteTask={deleteTask}
                          />
                      ))}
                    </ul>
                  </SortableContext>
                </DndContext>
              </section>
            </>
        )}
      </div>
  );
}

export default App;
