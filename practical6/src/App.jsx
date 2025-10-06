import { useState } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState('');
  const [editIdx, setEditIdx] = useState(null);
  const [editValue, setEditValue] = useState('');


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

  return (
    <div className="todo-container">
      <h2>React To-Do List</h2>
      <div className="todo-input">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Add a new task..."
        />
        <button onClick={handleAdd}>Add</button>
      </div>
      <ul className="todo-list">
        {tasks.map((task, idx) => (
          <li key={idx} className="todo-item">
            {editIdx === idx ? (
              <>
                <input
                  type="text"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  className="edit-input"
                />
                <button className="remove-btn" onClick={() => handleSave(idx)}>Save</button>
                <button className="remove-btn" onClick={() => { setEditIdx(null); setEditValue(''); }}>Cancel</button>
              </>
            ) : (
              <>
                {task}
                <button className="remove-btn" onClick={() => handleEdit(idx)}>Edit</button>
                <button className="remove-btn" onClick={() => handleRemove(idx)}>Delete</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;