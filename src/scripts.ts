import axios, {AxiosResponse} from 'axios';

type Task = {
    thumbnail: string;
    name: string;
    description: string;
    createdat: string;
    id: number;
}
let tasks: Task[] = []

// HTML ELEMENTS
const taskSection: HTMLElement = document.querySelector(".js-tasks");
const inputTaskName: HTMLInputElement = document.querySelector(".js-input-taskname");
const inputTaskDescription: HTMLTextAreaElement = document.querySelector(".js-input-taskdescription");
const createTaskBtn = document.querySelector(".js-btn-createtask");

// EVENTS
const populateHTMLElementEvents = () => {

    document.addEventListener("DOMContentLoaded", () => {
        axios.get("http://localhost:3004/tasks")
            .then(response => {
                loadSavedTasks(response)
            })
            .catch(error => {
                console.error("Could not fetch the data:", error)
            });
    });

    createTaskBtn.addEventListener("click", (event) => {
        event.preventDefault();

        const newTask: Task = {
            thumbnail: "assets/images/target.png",
            name: inputTaskName.value,
            description: inputTaskDescription.value,
            createdat: getCurrentDate(),
            id: Date.now()
        };

        if (newTask.name === "" || newTask.description === "") {
            alert("Description and Name field must not be empty!")
            return;
        }

        createTask(newTask);
    })
}
populateHTMLElementEvents()

const loadSavedTasks = (response: AxiosResponse) => {
    tasks = response.data;

    tasks.forEach((task) => {
        createTaskHTMLCard(task);
    })
}

const createTask = (task: Task) => {
    createTaskHTMLCard(task);
    saveTaskToDB(task);

    inputTaskName.value = "";
    inputTaskDescription.value = "";
}

const createTaskHTMLCard = (task: Task) => {
    const taskElement = document.createElement('div');
    taskElement.className = 'tasks__task';
    taskElement.innerHTML = `
        <div class="tasks__task-thumbnail-wrapper">
            <img src=${task.thumbnail} class="tasks__task-thumbnail">
        </div>
        <div class="tasks__task-name-wrapper">
            <h2 class="tasks__task-name">${task.name}</h2>
        </div>
        <div class="tasks__task-description-wrapper">
            <p class="tasks__task-description">${task.description}</p>
        </div>
        <div class="tasks__task-createdat-wrapper">
            <p class="tasks__task-createdat">Created at: ${task.createdat}</p>
        </div>
        <div class="row-buttons">
            <button class="button row-buttons-button js-btn-edit">Edit</button>
            <button class="button row-buttons-button js-btn-delete">Delete</button>
        </div>
    `;

    taskSection.appendChild(taskElement);

    const deleteButton: HTMLButtonElement = taskElement.querySelector('.js-btn-delete');

    deleteButton.addEventListener('click', () => {
        deleteTaskHTMLCard(taskElement)
        deleteTaskFromDB(task);
        taskElement.remove();
    });
};

const deleteTaskHTMLCard = (taskElement: HTMLDivElement) => {
    taskElement.remove();
}

const saveTaskToDB = (task: Task) => {

    axios.post("http://localhost:3004/tasks", {
        thumbnail: task.thumbnail,
        name: task.name,
        description: task.description,
        createdat: task.createdat,
        id: task.id
    })
        .then(response => {
            console.log("Task saved successfully:", response.data);
        })
        .catch(error => {
            console.error("Error saving task:", error);
        });
}

const deleteTaskFromDB = (task: Task) => {
    axios.delete(`http://localhost:3004/tasks/${task.id}`)
        .then(response => {
            console.log("Task deleted successfully:", response.data);
        })
        .catch(error => {
            console.error("Error deleting task:", error);
        });
};

const getCurrentDate = (): string => {
    const timeStamp = Date.now();
    const date = new Date(timeStamp);
    const formattedDate = date.toLocaleString();
    return formattedDate;
}
