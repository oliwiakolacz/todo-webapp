const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const TASKS_FILE = path.join(__dirname, 'tasks.json');

app.use(express.static('public'));
app.use(express.json());

const tasksModule = {
    readTasks: (callback) => {
        fs.readFile(TASKS_FILE, 'utf8', (err, data) => {
            if (err) return callback(err);
            callback(null, JSON.parse(data));
        });
    },
    writeTasks: (tasks, callback) => {
        fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf8', callback);
    }
};

// --- ROUTING APLIKACJI ---

app.get('/api/tasks', (req, res) => {
    tasksModule.readTasks((err, tasks) => {
        if (err) return res.status(500).json({ error: 'Nie udało się odczytać zadań.' });
        res.json(tasks);
    });
});

app.post('/api/tasks', (req, res) => {
    const newTask = {
        id: Date.now(),
        name: req.body.name,
        description: req.body.description,
        dueDate: req.body.dueDate,
        email: req.body.email,
        completed: false
    };

    tasksModule.readTasks((err, tasks) => {
        if (err) return res.status(500).json({ error: 'Błąd serwera.' });
        tasks.push(newTask);
        tasksModule.writeTasks(tasks, (err) => {
            if (err) return res.status(500).json({ error: 'Nie udało się zapisać zadania.' });
            res.status(201).json(newTask);
        });
    });
});

app.put('/api/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id, 10);
    const { completed } = req.body;

    tasksModule.readTasks((err, tasks) => {
        if (err) return res.status(500).json({ error: 'Błąd serwera.' });
        
        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) {
            return res.status(404).json({ error: 'Zadanie nie znalezione.' });
        }

        tasks[taskIndex].completed = completed;

        tasksModule.writeTasks(tasks, (err) => {
            if (err) return res.status(500).json({ error: 'Nie udało się zaktualizować zadania.' });
            res.json(tasks[taskIndex]);
        });
    });
});


app.delete('/api/tasks/:id', (req, res) => {
    const taskId = parseInt(req.params.id, 10);

    tasksModule.readTasks((err, tasks) => {
        if (err) return res.status(500).json({ error: 'Błąd serwera.' });
        const updatedTasks = tasks.filter(t => t.id !== taskId);
        
        if (tasks.length === updatedTasks.length) {
             return res.status(404).json({ error: 'Zadanie nie znalezione.' });
        }

        tasksModule.writeTasks(updatedTasks, (err) => {
            if (err) return res.status(500).json({ error: 'Nie udało się usunąć zadania.' });
            res.status(204).send();
        });
    });
});


app.listen(PORT, () => {
    console.log(`Serwer działa na http://localhost:${PORT}`);
});
