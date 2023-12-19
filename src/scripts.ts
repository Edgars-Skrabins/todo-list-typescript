import axios, {AxiosResponse} from 'axios';

let inEditMode = false;

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
            thumbnail: "assets/images/cat.png",
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

    const editButton: HTMLButtonElement = taskElement.querySelector(".js-btn-edit")
    editButton.addEventListener('click', () => {
        createEditDialog(task, taskElement);
    })
};

const createEditDialog = (task: Task, taskElement: HTMLElement) => {
    if (inEditMode) return;

    let taskName: HTMLElement = taskElement.querySelector('.tasks__task-name');
    let taskDescription: HTMLElement = taskElement.querySelector('.tasks__task-description');

    inEditMode = true;

    const dialogElement = document.createElement('div');
    dialogElement.className = 'edit-dialog-container';
    dialogElement.innerHTML = `
    <div class="edit-dialog-container">
        <form class="header__form">
            <label for="js-edit-taskname"> Task name </label>
            <input maxlength="20" type="text" class="header__input-text-name input js-edit-taskname" id="js-edit-taskname">

            <label for="js-edit-taskdescription"> Task description </label>
            <textarea maxlength="150" class="header__input-text-description input js-edit-taskdescription" id="js-edit-taskdescription"></textarea>

            <div class="row-buttons">
                <button class="button header__btn js-edit-cancel"> Cancel </button>
                <button class="button header__btn js-edit-confirm"> Confirm </button>
            </div>
        </form>
    </div>
    `;

    taskSection.appendChild(dialogElement);

    let newTaskName: HTMLInputElement = dialogElement.querySelector(`.js-edit-taskname`);
    let newTaskDescription: HTMLInputElement = dialogElement.querySelector(`.js-edit-taskdescription`);

    newTaskName.value = taskName.innerText;
    newTaskDescription.value = taskDescription.innerText;

    const cancelButton: HTMLButtonElement = dialogElement.querySelector('.js-edit-cancel');
    cancelButton.addEventListener('click', () => {
        removeEditDialog(dialogElement);
    });

    const confirmButton: HTMLButtonElement = dialogElement.querySelector('.js-edit-confirm');
    confirmButton.addEventListener('click', () => {
        updateTask(task, newTaskName.value, newTaskDescription.value, taskElement);
        removeEditDialog(dialogElement);
    });
}

const removeEditDialog = (dialogElement: HTMLElement) => {
    inEditMode = false;
    dialogElement.remove();
}

const updateTask = (task: Task, newName: string, newDescription: string, taskElement: HTMLElement) => {
    updateTaskHTML(taskElement, newName, newDescription);
    updateTaskInDB(task, newName, newDescription);
}

const updateTaskHTML = (taskElement: HTMLElement, newName: string, newDescription: string) => {
    const taskName: HTMLElement = taskElement.querySelector(`.tasks__task-name`);
    const taskDescription: HTMLElement = taskElement.querySelector(`.tasks__task-description`);

    taskName.innerText = newName;
    taskDescription.innerText = newDescription;
}

const updateTaskInDB = (task: Task, newName: string, newDescription: string) => {
    const apiUrl = `http://localhost:3004/tasks/${task.id}`;

    axios.put(apiUrl, {
        thumbnail: task.thumbnail,
        name: newName,
        description: newDescription,
        createdat: task.createdat,
        id: task.id
    })
        .then(response => {
            console.log("Task updated succesfully:", response.data);
        })
        .catch(error => {
            console.log("Error saving task:", error);
        })
}

const deleteTaskHTMLCard = (taskElement: HTMLDivElement) => {
    taskElement.remove();
}

const saveTaskToDB = (task: Task) => {
    const apiUrl = `http://localhost:3004/tasks/`;

    axios.post(apiUrl, {
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
    const apiUrl = `http://localhost:3004/tasks/${task.id}`;

    axios.delete(apiUrl)
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
