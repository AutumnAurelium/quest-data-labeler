import { useState, useEffect } from 'react';
import './App.css'
import TaskView from './components/TaskView';
import { getTasks } from './api_util';

function App() {
  // Attempt to initialize from localStorage
  const initialTask = localStorage.getItem("selectedTask") || "";
  const [tasks, setTasks] = useState<string[]>([]);
  const [selectedTask, setSelectedTask] = useState<string>(initialTask);

  useEffect(() => {
    getTasks()
      .then((data) => {
        setTasks(data);
        const storedTask = localStorage.getItem("selectedTask");
        // If storedTask exists in the fetched tasks, use it. Otherwise, default to the first task.
        if (storedTask && data.includes(storedTask)) {
          setSelectedTask(storedTask);
        } else if (data.length > 0) {
          setSelectedTask(data[0]);
          localStorage.setItem("selectedTask", data[0]);
        }
      });
  }, []);
  
  const handleTaskChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newTask = e.target.value;
    setSelectedTask(newTask);
    localStorage.setItem("selectedTask", newTask);
  };

  return (
    <>
      <div>
        <p>Select a task</p>
        <select onChange={handleTaskChange} value={selectedTask}>
          {tasks.map((task) => (
            <option key={task} value={task}>{task}</option>
          ))}
        </select>
        {tasks.length > 0 && <TaskView task={selectedTask} />}
      </div>
    </>
  )
}

export default App
