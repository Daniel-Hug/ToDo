(function() {
	'use strict';


	// Pull in ToDo list data from localStorage:
	var taskListTitle = $.id('task-list-title');
	taskListTitle.textContent = $.storage.get('ToDoTitle') || 'ToDo';
	window.tasks = $.storage.get('ToDoList') || [
		{done: false, title: 'Add tasks to your ToDo list.'},
		{done: false, title: 'Print them off.'},
		{done: false, title: "Mark em' off one by one."}
	];


	// render tasks to the page:
	// <li>
	//     <div>
	//         <input type="checkbox" class="facade-box" {{bindAttr checked="done"}}">
	//         <div class="facade"></div>
	//         <button class="icon-trash"></button>
	//         <div class="title">
	//             <div contenteditable="true">{{title}}</div>
	//         </div>
	//     </div>
	// </li>
	function renderTask(taskObj) {
		// Create ToDo DOM:
		return $.DOM.buildNode({
			el: 'li', kid: {
				el: 'div', kids: [
					{ el: 'input', type: 'checkbox', _className: 'facade-box', _checked: !!taskObj.done, on_change: [check] },
					{ _className: 'facade'},
					{ el: 'button', _className: 'icon-trash', on_click: [deleteTodo] },
					{ _className: 'title', kid: 
						{ _contentEditable: true, kid: taskObj.title, on_input: [titleInput] }
					}
				]
			}
		});


		// Allow changes to ToDo title:
		function titleInput() {
			taskObj.title = this.textContent;
			$.storage.set('ToDoList', tasks);
		}

		function deleteTodo() {
			var taskIndex = tasks.indexOf(taskObj);
			tasks.splice(taskIndex, 1);
			var li = this.parentNode.parentNode;
			li.parentNode.removeChild(li);
			$.storage.set('ToDoList', tasks);
		}

		// Let ToDos be checked off:
		function check() {
			taskObj.done = this.checked;
			$.storage.set('ToDoList', tasks);
		}
	}

	var taskList = $.id('task-list');
	taskList.appendChild($.renderMultiple(tasks, renderTask));


	// Allow changes to ToDo list title:
	$.on(taskListTitle, 'input', function() {
		$.storage.set('ToDoTitle', taskListTitle.textContent);
	});


	// add task
	var taskNameField = $.id('task-name-field');
	$.on($.id('new-task-form'), 'submit', function(event) {
		// Handle data:
		var taskObj = {title: taskNameField.value};
		tasks.push(taskObj);
		$.storage.set('ToDoList', tasks);

		// Render to DOM:
		taskList.appendChild(renderTask(taskObj, tasks.length));

		// Handle form:
		event.preventDefault();
		taskNameField.value = '';
	});


	// print:
	$.on($.id('print-button'), 'click', function() {
		window.print();
	});
})();