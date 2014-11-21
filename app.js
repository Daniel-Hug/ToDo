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
			var s = +dueSec.textContent;
			var m = +dueInputM.value;
			var h = +dueInputH.value;
			if (s) {
				s--;
				if (!(s || m || h)) {
					pauseDue();
					dueInputM.value = '';
					dueSec.textContent = '';
					dueInputH.focus();
					if (confirm('Did you ' + titleEl.textContent + '?')) {
						facadeBox.checked = true;
						check.call(facadeBox);
					}
				}
				else dueSec.textContent = $.pad(s, 2);
			}
			else if (m) {
				dueInputM.value = $.pad(m - 1, 2);
				dueSec.textContent = 59;
			}
			else if (h) {
				dueInputH.value = h - 1;
				dueInputM.value = 59;
				dueSec.textContent = 59;
			}
			else pauseDue();
		}, 1000);


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
		var dueInputH = $.DOM.buildNode({ el: 'input', type: 'number', _className: 'inpt due-input-h', placeholder: 'hh', _value: taskObj.timeH || '', max: 99, on_input: [function() {
			taskObj.timeH = this.value;
			$.storage.set('ToDoList', tasks);
			if (+this.value) {
				if (!+dueInputM.value) dueInputM.value = '00';
				dueInputM.removeAttribute('min');
			} else {
				dueInputM.setAttribute('min', 1);
			}
		}] });
		var dueInputM = $.DOM.buildNode({ el: 'input', type: 'number', _className: 'inpt due-input-m', placeholder: 'mm', _value: $.pad(taskObj.timeM, 2) || '', min: 1, max: 99, _required: true, on_input: [function() {
			var timeM = parseInt(dueSec.textContent, 10);
			taskObj.timeM = timeM >= 1 ? this.value + 1 : this.value;
			$.storage.set('ToDoList', tasks);
		}] });
		var dueSec = $.DOM.buildNode({ el: 'span', _className: 'due-sec', kid: '00', _hidden: true });
		var dueStartBtn = $.DOM.buildNode({ el: 'button', _className: 'btn mini due-start', kid: '▶' });
		var duePauseBtn = $.DOM.buildNode({ el: 'button', _className: 'btn mini due-pause hidden', on_click: [pauseDue], kid: 'll' });
		var titleEl = $.DOM.buildNode({ _contentEditable: true, kid: taskObj.title, on_input: [titleEdit] });
		return $.DOM.buildNode({
			el: 'li', kids: [
				facadeBox,
				{ _className: 'facade mini'},
				{ el: 'button', _className: 'btn mini dltBtn icon-trash', on_click: [deleteTodo] },
				{ _className: 'title', kid: titleEl },
				{ el: 'form', _className: 'due-box', on_submit: [startDue], kids: [dueInputH, ':', dueInputM, dueSec, dueStartBtn, duePauseBtn]}
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
			dueSec.hidden = false;
			dueInputM.value = $.pad(dueInputM.value, 2);
			timer.start();
			if (!+dueInputH.value) dueInputH.value = '0';
			else dueInputH.value = parseInt(dueInputH.value, 10);
			dueStartBtn.classList.add('hidden');
			duePauseBtn.classList.remove('hidden');
			dueInputH.disabled = true;
			dueInputM.disabled = true;
		}

		function pauseDue(event) {
			if (event) event.preventDefault();
			timer.stop();
			if (+dueSec.textContent) {
				dueSec.textContent = '00'
				dueInputM.value = $.pad(+dueInputM.value + 1, 2);
			}
			dueSec.hidden = true;
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