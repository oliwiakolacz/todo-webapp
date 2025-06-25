document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const emailInput = document.getElementById('task-email');
    const nameInput = document.getElementById('task-name');
    const emailError = document.getElementById('email-error');
    const nameError = document.getElementById('name-error');

    const validateEmail = (email) => {
        if (email.length === 0) return true;
        const re = /\S+@\S+\.\S+/;
        return re.test(email);
    };

    const fetchTasks = async () => {
        const response = await fetch('/api/tasks');
        const tasks = await response.json();
        renderTasks(tasks);
    };

    const renderTasks = (tasks) => {
        taskList.innerHTML = '';
        if (tasks.length === 0) {
            taskList.innerHTML = '<p>Brak zadań do wyświetlenia.</p>';
            return;
        }
        tasks.forEach(task => {
            const taskElement = document.createElement('article');
            taskElement.classList.add('task-item');
            if (task.completed) {
                taskElement.classList.add('completed');
            }
            taskElement.dataset.id = task.id;

            taskElement.innerHTML = `
                <div class="task-item-details">
                     <input type="checkbox" ${task.completed ? 'checked' : ''}>
                     <div>
                        <strong>${task.name}</strong>
                        <p>${task.description || ''}</p>
                        <small>Termin: ${task.dueDate || 'brak'}</small>
                     </div>
                </div>
                <button class="delete-btn">Usuń</button>
            `;
            taskList.appendChild(taskElement);
        });
    };
    
    taskForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        nameError.style.display = 'none';
        emailError.style.display = 'none';
        
        let isValid = true;
        if (nameInput.value.length < 3) {
            nameError.textContent = 'Nazwa musi mieć co najmniej 3 znaki.';
            nameError.style.display = 'block';
            isValid = false;
        }
        if (!validateEmail(emailInput.value)) {
            emailError.textContent = 'Wprowadź poprawny adres e-mail.';
            emailError.style.display = 'block';
            isValid = false;
        }

        if (!isValid) return;

        const newTask = {
            name: nameInput.value,
            description: document.getElementById('task-description').value,
            dueDate: document.getElementById('task-due-date').value,
            email: emailInput.value,
        };

        await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTask),
        });

        taskForm.reset();
        fetchTasks();
    });

    taskList.addEventListener('click', async (e) => {
        const taskId = e.target.closest('.task-item').dataset.id;

        if (e.target.classList.contains('delete-btn')) {
            await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
            fetchTasks();
        }

        if (e.target.type === 'checkbox') {
            const isCompleted = e.target.checked;
            await fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: isCompleted })
            });
            fetchTasks();
        }
    });

    fetchTasks();
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(reg => console.log('Service Worker zarejestrowany:', reg))
            .catch(err => console.log('Błąd rejestracji Service Worker:', err));
    });
}
