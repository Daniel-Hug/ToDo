(function() {
	'use strict';


	// Set list title
	var taskListTitle = $.id('task-list-title');
	taskListTitle.textContent = $.storage.get('ToDoTitle') || 'ToDo';


	// Pull in ToDo list data from localStorage
	window.tasks = $.storage.get('ToDoList') || [
		{done: false, title: 'add tasks to your ToDo list'},
		{done: false, title: 'print them off'},
		{done: false, title: "mark em' off one by one"}
	];


	// task renderer
	function renderTask(taskObj) {
		var timer = $.interval(function tick() {
			var m = +dueInputM.value;
			var h = +dueInputH.value;
			if (m) {
				if (!(--m || h)) {
					pauseDue();
					dueInputH.value = '';
					dueInputM.value = '';
					dueInputH.focus();
					if (confirm('Did you ' + titleEl.textContent + '?')) {
						facadeBox.checked = true;
						check.call(facadeBox);
					}
				}
				else dueInputM.value = $.pad(m, 2);
			}
			else if (h) {
				dueInputH.value = h - 1;
				dueInputM.value = 59;
			}
			else pauseDue();
		}, 1000 * 60);


		// Create ToDo DOM
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
		var facadeBox = $.DOM.buildNode({ el: 'input', type: 'checkbox', _className: 'facade-box', _checked: !!taskObj.done, on_change: [check] });
		var dueInputH = $.DOM.buildNode({ el: 'input', type: 'number', _className: 'inpt due-input-h', placeholder: 'hh', max: 99, on_input: [function() {
			if (this.value) {
				if (!+dueInputM.value) dueInputM.value = '00';
				dueInputM.removeAttribute('min');
			} else {
				dueInputM.setAttribute('min', 1);
			}
		}] });
		var dueInputM = $.DOM.buildNode({ el: 'input', type: 'number', _className: 'inpt due-input-m', placeholder: 'mm', min: 1, max: 99, _required: true });
		var dueSec = $.DOM.buildNode({ el: 'span', _className: 'due-sec' });
		var dueStartBtn = $.DOM.buildNode({ el: 'button', _className: 'btn mini due-start', kid: '▶' });
		var duePauseBtn = $.DOM.buildNode({ el: 'button', _className: 'btn mini due-pause hidden', on_click: [pauseDue], kid: 'll' });
		var titleEl = $.DOM.buildNode({ _contentEditable: true, kid: taskObj.title, on_input: [titleEdit] });
		return $.DOM.buildNode({
			el: 'li', kids: [
				facadeBox,
				{ _className: 'facade mini'},
				{ el: 'button', _className: 'btn mini dltBtn icon-trash', on_click: [deleteTodo] },
				{ _className: 'title', kid: titleEl },
				{ el: 'form', _className: 'due-box', on_submit: [startDue], kids: [dueInputH, ':', dueInputM, dueStartBtn, duePauseBtn]}
			]
		});


		// handle ToDo edit, check, & delete
		function titleEdit() {
			taskObj.title = this.textContent;
			$.storage.set('ToDoList', tasks);
		}

		function check() {
			pauseDue();
			taskObj.done = this.checked;
			$.storage.set('ToDoList', tasks);
		}

		function deleteTodo() {
			var taskIndex = tasks.indexOf(taskObj);
			tasks.splice(taskIndex, 1);
			var li = this.parentNode;
			li.parentNode.removeChild(li);
			$.storage.set('ToDoList', tasks);
		}


		function startDue(event) {
			event.preventDefault();
			if (timer.going) return;
			dueInputM.value = $.pad(dueInputM.value, 2);
			timer.start();
			dueStartBtn.classList.add('hidden');
			duePauseBtn.classList.remove('hidden');
			dueInputH.disabled = true;
			dueInputM.disabled = true;
		}

		function pauseDue(event) {
			if (event) event.preventDefault();
			timer.stop();
			duePauseBtn.classList.add('hidden');
			dueStartBtn.classList.remove('hidden');
			dueInputH.disabled = false;
			dueInputM.disabled = false;
		}
	}


	// start task rendering
	var taskList = $.id('task-list');
	taskList.appendChild($.renderMultiple(tasks, renderTask));


	// Allow changes to list title
	$.on(taskListTitle, 'input', function() {
		$.storage.set('ToDoTitle', taskListTitle.textContent);
	});


	// handle new task entries
	var taskNameField = $.id('task-name-field');
	$.on($.id('new-task-form'), 'submit', function(event) {
		// Handle data
		var taskObj = {title: taskNameField.value};
		tasks.push(taskObj);
		$.storage.set('ToDoList', tasks);

		// Render to DOM
		taskList.appendChild(renderTask(taskObj, tasks.length));

		// Handle form
		event.preventDefault();
		taskNameField.value = '';
	});


	// print
	$.on($.id('print-button'), 'click', function() {
		window.print();
	});
})();