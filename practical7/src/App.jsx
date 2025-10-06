import { useState } from 'react';
import './App.css';
import Todolist from './Todolist';

// Sidebar component
function Sidebar({ onSelect }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('Home');

  const menuItems = ['Home', 'TodoList', 'Settings', 'About'];

  return (
    <div className={`sidebar ${open ? 'open' : ''}`}>
      <button className="toggle-btn" onClick={() => setOpen(!open)}>
        {open ? 'Close' : 'Menu'}
      </button>
      {open && (
        <ul className="menu">
          {menuItems.map(item => (
            <li
              key={item}
              className={active === item ? 'active' : ''}
              onClick={() => {
                setActive(item);
                if (item === 'TodoList') {
                  onSelect('practical'); 
                } else {
                  onSelect(item);
                }
              }}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function App() {
  const [selected, setSelected] = useState('');

  return (
    <div className="App">
      <Sidebar onSelect={setSelected} />
      <div className="content">
        {selected === 'Home' && (
          <>
            <h1>Welcome to the My HomePage</h1>
            <p>This is a simple application to demonstrate React components.</p>
          </>
        )}
        {selected === 'practical' && <Todolist />}
        {selected === 'Settings' && (
          <>
            <h1>Settings</h1>
            <p>
             No Setting options available yet. This is a placeholder for future settings.

             
            </p>
          </>
        )}
        {selected === 'About' && (
          <>
            <h1>About</h1>
            <p>
              This React app showcases a sidebar navigation, a practical dropdown, and a simple to-do list. 
              It is built for learning and experimenting with React hooks, component structure, and UI patterns.
            </p>
            <ul>
              <li>Author: Kathan</li>
              <li>Semester: 5th</li>
              <li>Features: Sidebar, Dropdown, To-Do List</li>
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
