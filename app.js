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
var newTaskForm = $id('new-task-form');
var taskNameField = $id('task-name-field');
var taskList = $id('task-list');
var taskListTitle = $id('task-list-title');
var printBtn = $id('print-button');


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
	var checkboxSpan = document.createElement('span');
	var titleBlock = document.createElement('span');
	var textSpan = document.createElement('span');
	checkbox.className = 'visuallyhidden';
	checkboxSpan.className = 'checkbox';
	titleBlock.className = 'title';

	// Add data:
	checkbox.type = 'checkbox';
	if (taskObj.done) checkbox.checked = true;
	textSpan.textContent = taskObj.title;

	// Append children to li:
	titleBlock.appendChild(textSpan);
	label.appendChild(checkbox);
	label.appendChild(checkboxSpan);
	label.appendChild(titleBlock);
	li.appendChild(label);

	// Allow changes to ToDo title:
	textSpan.contentEditable = true;
	on(textSpan, 'input', function() {
		tasks[i].title = this.textContent;
		storage.set('ToDoList', tasks);
	});
	on(titleBlock, 'click', function(event) {
		// Don't toggle checkbox when todo title is clicked:
		event.preventDefault();
		event.stopPropagation();
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