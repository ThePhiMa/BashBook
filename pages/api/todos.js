// pages/api/todos.js
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    const filePath = path.join(process.cwd(), 'db.json');
    const todos = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (req.method === 'POST') {
        fs.writeFileSync(filePath, JSON.stringify(req.body.todos));
        res.status(200).json({ message: 'Success' });
    } else if (req.method === 'DELETE') {
        const id = req.body.id;
        const updatedTodos = todos.filter((todo) => todo.id !== id);
        fs.writeFileSync(filePath, JSON.stringify(updatedTodos));
        res.status(200).json({ message: 'Deleted' });
    }
}