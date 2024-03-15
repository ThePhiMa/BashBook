import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

export default function Home({ initialTodos }) {
  const [todos, setTodos] = useState(initialTodos);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [password, setPassword] = useState('');

  const predefinedPassword = "google1234"

  const handlePasswordInput = (e) => {
    setPassword(e.target.value);
  };

  const pwdModalRef = useRef();
  const openPWDModal = () => {
    pwdModalRef.current.showModal();
  }

  const checkPassword = (e) => {
    e.preventDefault();
    if (password === predefinedPassword) {
      pwdModalRef.current.close();
    } else {
      alert('Incorrect password');
    }
  };

  const delModalRef = useRef();
  const openDelModal = (id) => {
    setDeleteId(id);
    delModalRef.current.showModal();
  }

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

    delModalRef.current.close();
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

  useEffect(() => {
    pwdModalRef.current.showModal();
  }, []);

  return (
    <main className="max-w-4xl mx-auto py-2">
      <div className="text-center my-5 py-5 gap-4 rounded-lg bg-gray-800 font-mono my-100">
        <h1 className="text-5xl font-bold my-5">BashBook</h1>
        <div className="flex flex-col mx-40 mb-7 justify-between">
          <div className="flex-justify-between w-full flex items-center">
            <div className="flex-grow mr-10">
              <input className="w-full px-3 h-10"
                type="text"
                value={search}
                placeholder="Search..."
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="btn outline-dashed hover:outline w-40" type="button" onClick={() => setSearch('')}>Clear</button>
          </div>
          <div className="flex justify-between mt-5">
            <form onSubmit={handleSubmit} className="w-full flex items-center">
              <div className="flex-grow mr-10">
                <input
                  className="w-full px-3 h-10"
                  type="text"
                  value={input}
                  placeholder="New guest name..."
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>
              <button className="btn outline-dashed hover:outline w-40" type="submit">Add Guest</button>
            </form>
          </div>
        </div>
        <label>{todos.length} guests</label>
        <div className="divider"></div>
        <div className="overflow-x-auto">
          <table className="table table-zebra table-fixed text-center">
            <thead className="text-gray-400 uppercase bg-gray-800">
              <tr>
                <th>Is Checked In</th>
                <th className="bg-gray-700">Name</th>
                <th>Check In</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {todos
                .filter((todo) => todo.text.includes(search))
                .slice()
                .sort((a, b) => a.completed - b.completed)
                .map((todo) => (
                  <tr key={todo.id}>
                    <td>
                      <div>
                        {todo.completed ? <div className="text-green-500">&#x2B24;</div> : <div className="text-red-500">&#x2B24;</div>}
                      </div>
                    </td>
                    <td key={todo.id}>
                      <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
                        {todo.text}
                      </span>
                    </td>
                    <td>
                      {todo.completed ? (
                        <button className="btn text-red-800 bg-gray-800" onClick={() => handleToggleCompleted(todo.id)}>Check Out</button>
                      ) : (
                        <button className="btn text-green-500 bg-gray-800" onClick={() => handleToggleCompleted(todo.id)}>Check In</button>
                      )
                      }
                    </td>
                    <td>
                      <button className="text-red-900" onClick={() => openDelModal(todo.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          <dialog ref={delModalRef} id="del_modal" className="modal modal-bottom sm:modal-middle">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Hello!</h3>
              <p className="py-4">Do you want to delete this entry?</p>
              <div className="modal-action flex justify-between">
                <button className="btn bg-red-800" onClick={() => handleDelete(deleteId)}>Delete</button>
                <form method="dialog">
                  <button className="btn bg-gray-700">Cancel</button>
                </form>
              </div>
            </div>
          </dialog>
          <dialog ref={pwdModalRef} className="modal">
            <div className="modal-box">
              <h2>Enter Password</h2>
              <form onSubmit={checkPassword}>
                <input className="mr-5" type="password" value={password} onChange={handlePasswordInput} />
                <button className="btn btn-primary" type="submit">Submit</button>
              </form>
            </div>
          </dialog>
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