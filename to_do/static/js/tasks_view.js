define('tasks_view', ['app'], function (app) {

	var TaskModel = Backbone.Model.extend({
			defaults: {
				'selected': false
			},
			url: function () {
				var id = this.has('id') ? this.get('id') : '';
				return '/task/' + id;
			},
			initialize: function () {
				this.bind('remove', function () {
					this.destroy();
				}, this);

				this.bind('change:title', function () {
					this.save();
				}, this);

				this.bind('change:status', function () {
					this.save();
				}, this);
			}
		}),

		TasksCollection = Backbone.Collection.extend({
			model: TaskModel,
			url: function () {
				return 'tasks/';
			}
		}),

		TaskView = Backbone.View.extend({
			tagName: 'li',
			template: '' +
				'<p><input type="checkbox" ' +
				'<% if (selected) { %> checked <% } %>' +
				' name="task" value="<%= id %>" /></p>' +
				'<p><%= title %></p>',
			formTemplate: '' +
				'<p><input type="checkbox" checked name="task" value="<%= id %>" /></p>' +
				'<p><input type="text" name="task_title_<%= id %>" value="<%= title %>" /></p>',

			events: { 'click :checkbox': 'selectTask' },

			initialize: function () {
				_.bindAll(this, 'selectTask');
			},

			render: function (status) {
				if (status.editMode && this.model.get('selected')) {
					this.$el.html(_.template(this.formTemplate, this.model.toJSON()));
				} else {
					this.$el.html(_.template(this.template, this.model.toJSON()));

					if (status.statusMode) {
						this.$el.attr('class', (status.statusSelected || this.model.get('status')));
					}
				}

				// this.$el.attr('task_id', this.model.get('id'));
				return this;
			},

			selectTask: function (e) {
				e.preventDefault();

				// Update selected attribute of a model. That will trigger 'change:selected' event
				// which was binded with 'selectItems' function on the main view.
				this.model.set('selected', !this.model.get('selected'));
			}
		});


	return Backbone.View.extend({
		noTaskTemplate: '<li class="no-task">There is not task to do! YaY! </li>',

		initialize: function (options) {
			var self = this;
			this.parent = options.parent;
			this.broker = options.broker;

			_.bindAll(this, 'selectItems', '_tasksFetched');

			// Define a collection where will be stored a view for each task.
			this._viewsCollection = new Backbone.Collection();

			// Define a collection where will be stored the list of tasks.
			this.tasksCollection = new TasksCollection();

			// Getting the list! Make an initial request to the backend
			// to store all task in the collection as models.
			this.tasksCollection.fetch({
				success: function () {
					self._tasksFetched();
				}
			});

			// Binding events trigger by the user.
			this.tasksCollection.bind('change:selected', this.selectItems);

			// Binding public events to our general Backbone.Event object.
			// Those will be triggered by nav_view.
			this.broker.on('task:create', this.addTask, this);
			this.broker.on('tasks:edit:view', this.editTasks, this);
			this.broker.on('tasks:edit:save', this.saveTasks, this);
			this.broker.on('tasks:status:change', this.changeStatusTasks, this);
			this.broker.on('tasks:remove', this.removeTasks, this);

			this.broker.on('tasks:cancel', this.cancelAction, this);
		},

		_tasksFetched: function () {

			// If there's no tasks in the database we need to display any message
			// telling it. If it gets some tasks we need to create and store a view for each one.

			if (this.$el.children().length !== this.tasksCollection.length &&
				!this.$el.find('.no-task').length) {
				this.render();

			} else {
				this.tasksCollection.each(function (model) {
					// Binding events. Need to create the views.
					this._viewsCollection.add({
						'id': model.get('id'),
						'view': this._getOrCreateTaskView(model)
					});
				}, this);
			}
		},

		_selectedTasks: function () {
			return this.tasksCollection.where({selected:true});
		},

		_areTasksSelected: function () {
			return Boolean(this._selectedTasks().length);
		},

		_getOrCreateTaskView: function (model) {

			if (this._viewsCollection.findWhere({'id': model.get('id')}))
				return this._viewsCollection.findWhere({'id': model.get('id')}).get('view');
			// Create and return a new task with the model provided.
			return new TaskView({
				el: this.$el.find('[task_id=' + model.get('id') + ']'),
				model: model,
				// TO-DO: check if we still need new_status
				className: model.get('status')
			});
		},

		render: function () {
			var self = this;

			// Rendering the entire list of tasks
			// Or a message if there's no tasks.

			this.$el.children().remove();
			this._viewsCollection.reset([]);

			this.tasksCollection.each(function (model) {

				var view = new TaskView({
					model: model,
					className: 'backbone tag ' + model.get('status')
				});

				self._viewsCollection.add({
					'id': model.get('id'),
					'view': view
				});

				// T0-DO: Changing render
				this.$el.append(view.render({
					'editMode': self._editingFormEnable,
					'statusMode': self._changingStatusEnable
				}).el);
			}, this);

			if (!this.tasksCollection.length) {
				this.$el.append(this.noTaskTemplate);
			}

			return this;
		},

		selectItems: function (model) {
			var self = this, view = this._getOrCreateTaskView(model);

			// If an item has been checked and it's the first one: trigger an event to enable editRemove bar mode.
			// Else, if an item has been unchecked and it was the last element checked: trigger an event to disable
			// editRemove mode and enable addTask instead.

			if (model.get('selected') && this.tasksCollection.where({selected: true}).length === 1) {
				this.broker.trigger('task:select', 'checked');
			} else if (!model.get('selected') && !this._areTasksSelected()) {
				this.broker.trigger('task:select', 'unchecked');

				this._editingFormEnable = false;
			}

			// Anytime the user check or uncheck an item and the 'editingForm' view or 'changeStatus' is enable
			// we need to: check/uncheck the item and re-render the view to form/read-only mode and/or restore
			// the original status of the task.

			view.render({
				'editMode': this._editingFormEnable,
				'statusMode': this._changingStatusEnable,
				'statusSelected': this.parent.$('.select select').val()
			});
		},

		addTask: function (object) {
			var self = this, view;

			// To create a task it needs all the datas (get them in object)
			// and syncronized _viewsCollection with the new view created.
			// Also, append the task to the list generated rendering the view.

			this.tasksCollection.create(object, {
				wait: true,
				success: function (model) {
					view = new TaskView({
						model: model,
						className: model.get('status')
					});

					self._viewsCollection.add({
						'id': model.get('id'),
						'view': view
					});

					if (self.$el.find('.no-task').length) {
						self.$el.children().remove();
					}
					// T0-DO: Changing render
					self.$el.prepend(view.render({
						'editMode': self._editingFormEnable,
						'statusMode': self._changingStatusEnable
					}).el);

					self.broker.trigger('success:task:create');
				},
				error: function () {
					self.broker.trigger('error:tasks', 'created');
				}
			});
		},

		editTasks: function () {
			var self = this;

			// Event triggered by nav_view. For each task selected in the list it needs to
			// re-render in 'edit' mode. Also need to know that 'EditMode' is enable.

			this._editingFormEnable = true;
			this._changingStatusEnable = false;

			_.each(this._selectedTasks(), function (model) {
				self._getOrCreateTaskView(model).render({
					'editMode': self._editingFormEnable,
				});
			});

		},

		saveTasks: function (newStatus) {
			var self = this, view, title, changed = false;

			// Event triggered by nav_view. For each task selected in the list it needs to
			// collect the new datas, they could be 'title' or 'status' and save them in the
			// model of this task. After that, need to render the view to update HTML.
			// Otherwise, if the event is to CANCEL the action, we need to set up 'title'
			// and 'status' to the default value of the task and render it.
			// Also, saving any action means that any 'editMode' has been disabled.

			this._editingFormEnable = false;
			this._changingStatusEnable = false;

			_.each(this._selectedTasks(), function (model) {
				view = self._getOrCreateTaskView(model);

				title = view.$el.find('[name=task_title_' + model.get('id') + ']').val();
				if (title && view.model.get('title') !== title) {
					view.model.set('title', title);
				} else if (newStatus) {
					view.model.set('status', newStatus);
					// view.render('class');
					// view.model.unset('new_status', {silence: true});
				}

				view.model.set('selected', false);

				// T0-DO: Changing render
				// view.render({
				//	'editMode': self.editingFormEnable,
				//	'statusMode': self.changingStatusEnable
				// });
			});

			this.broker.trigger('success:tasks:save', 'updated');

		},

		removeTasks: function (action) {
			var self = this, view;

			// Event triggered by nav_view. For each task selected it needs to remove the DOM
			// from the list of tasks and also, need to remove the view/model from all collections.
			// If the main collection (tasksCollection) is empty it needs to render a message telling
			// that there's no tasks on the list.
			// Also, after removing tasks or canceling the current action it needs to disable any
			// 'editMode' in the main view.

			this._editingFormEnable = false;
			this._changingStatusEnable = false;

			_.each(this._selectedTasks(), function (model) {
				self._getOrCreateTaskView(model).remove();
				self._viewsCollection.remove(self._viewsCollection.findWhere({'id': model.get('id')}));
			});

			this.tasksCollection.remove(this._selectedTasks());

			if (!this.tasksCollection.length) {
				this.render();
			}

			this.broker.trigger('success:tasks:save', 'removed');
		},

		changeStatusTasks: function (newStatus) {
			var self = this, view;

			// Event triggered by nav_view. For each task selected it needs to re-render
			// the view appling the new status selected. That doesn't means to save the new
			// status for each tasks (that will be done on saveTasks function)
			// If there's no status in the task it will set up the current one.
			// Also, there's a 'editMode' enable because it's enable the form to change status
			// of some tasks.

			this._editingFormEnable = false;
			this._changingStatusEnable = true;

			_.each(this._selectedTasks(), function (model) {
				view = self._getOrCreateTaskView(model);

				// TO-DO: Check if we still need new_status;
				// if (newStatus) {
				//	view.model.set('new_status', status);
				// } else {
				//	view.model.unset('new_status');
				// }

				// T0-DO: Changing render
				view.render({
					'editMode': self._editingFormEnable,
					'statusMode': self._changingStatusEnable,
					'statusSelected': newStatus
				});
			});
		},

		cancelAction: function () {
			var self = this, view;

			this._editingFormEnable = false;
			this._changingStatusEnable = false;

			_.each(this.tasksColleciton.where({selected:true}), function (model) {
				view = self._getOrCreateTaskView(model);

				// TO-DO: Check if we still need new_status;
				// view.model.unset('new_status', {silence: true});
				// T0-DO: Changing render

				view.render({
					'editMode': self._editingFormEnable,
					'statusMode': self._changingStatusEnable
				});
			});
		}
		
	});

});