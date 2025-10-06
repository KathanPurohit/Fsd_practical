import { useState, useEffect } from 'react';
import './Todolist.css';

function Todolist() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [editIdx, setEditIdx] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(false);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';
      
      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      
      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        setIsListening(false);
      };
      
      setRecognition(recognitionInstance);
      setSpeechSupported(true);
    } else {
      setSpeechSupported(false);
    }
  }, []);

  const handleAdd = () => {
    if (input.trim() !== '') {
      setTasks([...tasks, input.trim()]);
      setInput('');
    }
  };

  const handleRemove = (idx) => {
    setTasks(tasks.filter((_, i) => i !== idx));
    if (editIdx === idx) {
      setEditIdx(null);
      setEditValue('');
    }
  };

  const handleEdit = (idx) => {
    setEditIdx(idx);
    setEditValue(tasks[idx]);
  };

  const handleSave = (idx) => {
    if (editValue.trim() !== '') {
      setTasks(tasks.map((task, i) => (i === idx ? editValue.trim() : task)));
      setEditIdx(null);
      setEditValue('');
    }
  };

  const startListening = () => {
    if (recognition && !isListening) {
      setIsListening(true);
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  };

  // Handle Enter key for adding tasks
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  return (
    <div className="todo-container">
      <h2>To-Do List</h2>
      
      <div className="todo-input">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Add a new task..."
          className="task-input"
        />
        <button onClick={handleAdd} className="add-btn">
          Add
        </button>
        
        {speechSupported && (
          <button
            onClick={isListening ? stopListening : startListening}
            className={`voice-btn ${isListening ? 'listening' : ''}`}
            title={isListening ? 'Stop listening' : 'Start voice input'}
          >
            {isListening ? (
              <span className="listening-indicator">
                🔴 <span className="stop-text">Stop</span>
              </span>
            ) : (
              '🎤'
            )}
          </button>
        )}
      </div>

      {!speechSupported && (
        <div className="warning-message">
          Voice commands are not supported in your browser.
        </div>
      )}

      {isListening && (
        <div className="listening-message">
          🎤 Listening... Speak your task now!
        </div>
      )}

      <ul className="todo-list">
        {tasks.map((task, idx) => (
          <li key={idx} className="todo-item">
            {editIdx === idx ? (
              <div className="edit-mode">
                <input
                  type="text"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  className="edit-input"
                  onKeyDown={(e) => e.key === 'Enter' && handleSave(idx)}
                />
                <button 
                  onClick={() => handleSave(idx)}
                  className="save-btn"
                >
                  Save
                </button>
                <button 
                  onClick={() => { setEditIdx(null); setEditValue(''); }}
                  className="cancel-btn"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="view-mode">
                <span className="task-text">{task}</span>
                <div className="task-actions">
                  <button 
                    onClick={() => handleEdit(idx)}
                    className="edit-btn"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleRemove(idx)}
                    className="remove-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {tasks.length === 0 && (
        <div className="empty-state">
          No tasks yet. Add one above or use the microphone button to speak your task!
        </div>
      )}
    </div>
  );
}

export default Todolist;