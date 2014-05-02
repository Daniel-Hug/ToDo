(function() {
	'use strict';

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
	//     <label>
	//         <input type="checkbox" class="visuallyhidden" checked="{{done}}">
	//         <div class="checkbox"></div>
	//         <div class="title">
	//             <div contenteditable="true">trousers</div>
	//         </div>
	//     </label>
	// </li>
	function renderTask(taskObj) {
		// Create elements:
		var li = document.createElement('li');
		var checkbox = document.createElement('input');
		var label = document.createElement('label');
		var checkboxDiv = document.createElement('div');
		var deleteBtn = document.createElement('button');
		var titleWrap = document.createElement('div');
		var title = document.createElement('div');
		checkbox.className = 'visuallyhidden';
		checkboxDiv.className = 'checkbox';
		deleteBtn.className = 'icon-trash';
		titleWrap.className = 'title';

		// Add data:
		checkbox.type = 'checkbox';
		if (taskObj.done) checkbox.checked = true;
		title.textContent = taskObj.title;

		// Append children to li:
		titleWrap.appendChild(title);
		label.appendChild(checkbox);
		label.appendChild(checkboxDiv);
		label.appendChild(deleteBtn);
		label.appendChild(titleWrap);
		li.appendChild(label);

		// Allow changes to ToDo title:
		title.contentEditable = true;
		on(title, 'input', function() {
			taskObj.title = this.textContent;
			storage.set('ToDoList', tasks);
		});

		// Don't toggle checkbox when todo title or delete button is clicked:
		[titleWrap, deleteBtn].forEach(function(el) {
			on(el, 'click', function(event) {
				event.preventDefault();
				event.stopPropagation();
			});
		});

		on(deleteBtn, 'click', function() {
			var taskIndex = tasks.indexOf(taskObj);
			tasks.splice(taskIndex, 1);
			li.parentNode.removeChild(li);
			storage.set('ToDoList', tasks);
		});

		// Let ToDos be checked off:
		on(checkbox, 'change', function() {
			taskObj.done = this.checked;
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
})();