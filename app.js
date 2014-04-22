//(function() {
//	'use strict';

// Helper functions:
var $id = document.getElementById.bind(document);

function on(target, type, callback) {
	target.addEventListener(type, callback, false);
}

// localStorage + JSON wrapper:
var storage = {
	get: function(prop) {
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

// Loop through an array of data objects,
// render each data object as an element with data inserted using the renderer,
// append each element to a documentFragment, and return the documentFragment:
function renderMultiple(arr, renderer) {
	var renderedEls = [].map.call(arr, renderer);
	var docFrag = document.createDocumentFragment();
	for (var i = renderedEls.length; i--;) docFrag.appendChild(renderedEls[i]);
	return docFrag;
}


// Grab elements:
var newTaskForm = $id('newTaskForm');
var taskNameField = $id('taskNameField');
var taskList = $id('taskList');
var taskListTitle = $id('taskListTitle');
var printBtn = $id('printBtn');


// Pull in ToDo list data from localStorage:
taskListTitle.textContent = storage.get('ToDoTitle') || 'ToDo';
var tasks = storage.get('ToDoList') || [
	{done: false, title: 'Add tasks to your ToDo list.'},
	{done: false, title: 'Print them off.'},
	{done: false, title: "Mark em' off one by one."}
];


// render tasks to the page:
// <li>
//     <input type="checkbox" checked="{{done}}">
//     <div><span contenteditable="true">trousers</span></div>
// </li>
function renderTask(taskObj, i) {
	// Create elements:
	var li = document.createElement('li');
	var checkbox = document.createElement('input');
	var label = document.createElement('label');
	var span = document.createElement('span');

	// Add data:
	checkbox.type = 'checkbox';
	if (taskObj.done) checkbox.checked = true;
	span.textContent = taskObj.title;

	// Append children to li:
	label.appendChild(span);
	li.appendChild(checkbox);
	li.appendChild(label);

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
	
	return li;
}

taskList.appendChild(renderMultiple(tasks, renderTask));


// Allow changes to ToDo list title:
on(taskListTitle, 'input', function() {
	storage.set('ToDoTitle', taskListTitle.textContent);
});


// add task
on(newTaskForm, 'submit', function(event) {
	// Handle data:
	var taskObj = {title: taskNameField.value};
	tasks.push(taskObj);
	storage.set('ToDoList', tasks);

	// Render to DOM:
	taskList.appendChild(renderTask(taskObj, tasks.length));

	// Handle form:
	event.preventDefault();
	taskNameField.value = '';
});


// print:
on(printBtn, 'click', function() {
	window.print();
});
//})();