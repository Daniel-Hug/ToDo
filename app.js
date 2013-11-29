// Helper functions:
var $id = document.getElementById.bind(document);

function on(eventTarget, type, callback) {
	eventTarget.addEventListener(type, callback, false);
}

// localStorage + JSON wrapper:
var storage = {
	get: function(prop, isJSON) {
		return JSON.parse(localStorage.getItem(prop));
	},
	set: function(prop, val) {
		localStorage.setItem(prop, JSON.stringify(val));
	},
	has: function(prop) {
		return localStorage.hasOwnProperty(prop);
	},
	remove: function(prop) {
		localStorage.removeItem(prop);
	},
	clear: function() {
		localStorage.clear();
	}
};

function getElementIndex(el) {
    var i = 0;
    while ( (el = el.previousElementSibling) ) i++;
    return i;
}


// Grab elements:
var newTaskForm = $id('newTaskForm');
var taskNameField = $id('taskNameField');
var taskList = $id('taskList');
var taskListTitle = $id('taskListTitle');
var printBtn = $id('printBtn');


// Pull in ToDo list data from localStorage:
taskListTitle.textContent = localStorage.ToDoTitle || "ToDo";
var tasks = storage.get('ToDoList') || [
	{title: "Add tasks to your ToDo list."},
	{title: "Print them off."},
	{title: "Mark em' off one by one."}
];


// render tasks to the page:
function renderTask(taskObj, i) {
	var li = document.createElement('li');
	var checkbox = document.createElement('input');
	var label = document.createElement('label');
	var span = document.createElement('span');
	checkbox.type = 'checkbox';
	if (taskObj.done) checkbox.checked = true;
	span.textContent = taskObj.title;
	label.appendChild(span);
	li.appendChild(checkbox);
	li.appendChild(label);
	taskList.appendChild(li);

	// Allow changes to ToDo title:
	span.contentEditable = true;
	on(span, 'input', function() {
		tasks[i].title = this.textContent;
		storage.set('ToDoList', tasks);
	});

	// Let ToDos be checked off:
	on(checkbox, 'change', function() {
		tasks[i].done = this.checked;
		storage.set('ToDoList', tasks);
	});
}

tasks.forEach(renderTask);


// Allow changes to ToDo list title:
on(taskListTitle, 'input', function() {
	storage.set('ToDoTitle', taskListTitle.textContent);
});


// add task
on(newTaskForm, 'submit', function(event) {
	event.preventDefault();
	var taskObj = {title: taskNameField.value};
	renderTask(taskObj, tasks.length);
	tasks.push(taskObj);
	storage.set('ToDoList', tasks);
	taskNameField.value = "";
	taskNameField.focus();
});


// print:
on(printBtn, 'click', function(event) {
	window.print();
});