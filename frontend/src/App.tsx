import { useState } from 'react';
import { useEffect } from 'react';
import './App.css'
import TaskView from './components/TaskView';
import { getTasks } from './api_util';

function App() {
  const [tasks, setTasks] = useState<string[]>([]);
  const [selectedTask, setSelectedTask] = useState<string>("");

  useEffect(() => {
    getTasks()
      .then((data) => {
        setTasks(data);
        setSelectedTask(data[0]);
      });
  }, []);
  
  return (
    <>
      <div>
        <h1>Quest Data Labeler</h1>
        <p>Select a task</p>
        <select onChange={(e) => setSelectedTask(e.target.value)}>
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
