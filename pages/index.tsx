import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

export default function Home({ initialTodos }) {
  const [todos, setTodos] = useState(initialTodos);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTodos = [...todos, { id: uuidv4(), text: input, completed: false }];
    setTodos(newTodos);
    setInput('');
  };

  const handleDelete = (idToDelete) => {
    setTodos(todos.filter((todo) => todo.id !== idToDelete));

    fetch('/api/todos', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: idToDelete }),
    });
  };

  const handleToggleCompleted = (idToToggle) => {
    setTodos(todos.map((todo) =>
      todo.id === idToToggle ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  useEffect(() => {
    fetch('/api/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ todos }),
    });
  }, [todos]);

  return (
    <main className="max-w-4xl mx-auto mt-4 base-300">
      <div className="text-center my-5 flex flex-col gap-4">
        <h1 className="text-2xl font-bold">BashBook</h1>
        <input
          type="text"
          placeholder="Search..."
          onChange={(e) => setSearch(e.target.value)}
        />
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button class="btn btn-primary" type="submit">Add Guest</button>
        </form>
        <label>{todos.length} guests</label>
        <div class="divider"></div>
        <div class="overflow-x-auto">
          <table class="table table-zebra table-fixed">
            <thead>
              <tr>
                <th>Name</th>
                <th>Is Checked In</th>
                <th>Check In</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {todos
                .filter((todo) => todo.text.includes(search))
                .map((todo) => (
                  <tr>
                    <th>
                      {todo.completed ? <label>	&#x2611;</label> : ''}
                    </th>
                    <th key={todo.id}>
                      <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
                        {todo.text}
                      </span>
                    </th>
                    <th>
                      <button onClick={() => handleToggleCompleted(todo.id)}>
                        {todo.completed ? 'Mark as normal' : 'Mark checked in'}
                      </button>
                    </th>
                    <th>
                      <button onClick={() => handleDelete(todo.id)}>Delete</button>
                    </th>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </main >
  );
}

export async function getServerSideProps() {
  const filePath = path.join(process.cwd(), 'db.json');
  const todos = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  return {
    props: {
      initialTodos: todos,
    },
  };
}