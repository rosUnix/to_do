define('tasks_view', ['app'], function (app) {

	var TaskModel = Backbone.Model.extend({
			defaults: {
				'selected': false
			},
			url: function () {
				var id = this.get('id') ? this.get('id') : '';
				return '/task/' + id;
			},
			initialize: function () {
				this.bind('remove', function () {
					this.destroy();
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

			initialize: function () {
				_.bindAll(this, 'selectTask');
				this.$el.find('input').bind('click', this.selectTask);
			},

			render: function (action) {
				if (action === 'form') {
					this.$el.html(_.template(this.formTemplate, this.model.toJSON()));

				} else if (action === 'class') {
					this.className = this.model.get('new_status') || this.model.get('status');
					this.$el.attr('class', this.className);
				}

				if (action !== 'form') {
					this.$el.html(_.template(this.template, this.model.toJSON()));
				}

				this.$el.attr('task_id', this.model.get('id'));

				this.$el.find('input:checkbox').unbind('click').bind('click', this.selectTask);
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
						'view': this._getTaskView(model)
					});
				}, this);
			}
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

				this.$el.append(view.render().el);
			}, this);

			if (!this.tasksCollection.length) {
				this.$el.append(this.noTaskTemplate);
			}

			return this;
		},

		selectItems: function (model) {
			var self = this, view = this._viewsCollection.findWhere({'id': model.get('id')}).get('view');

			// If an item has been checked and it's the first one: trigger an event to enable editRemove bar mode.
			// Else, if an item has been unchecked and it was the last element checked: trigger an event to disable
			// editRemove mode and enable addTask instead.

			if (model.get('selected') && this.tasksCollection.where({selected: true}).length === 1) {
				this.broker.trigger('task:select', 'checked');
			} else if (!model.get('selected') && !this.tasksCollection.where({selected: true}).length) {
				this.broker.trigger('task:select', 'unchecked');

				this.editingFormEnable = false;
				this.changingStatusEnable = false;
			}

			// Anytime the user check or uncheck an item and the 'editingForm' view or 'changeStatus' is enable
			// we need to: check/uncheck the item and re-render the view to form/read-only mode and/or restore
			// the original status of the task.

			if (this.editingFormEnable && model.get('selected')) {
				view.render('form');
			} else if (this.changingStatusEnable && model.get('selected')) {
				view.model.set('new_status', this.parent.$el.find('.select select').val());
				view.render('class');
			} else if (this.changingStatusEnable && !model.get('selected')) {
				view.model.set('new_status', undefined);
				view.render('class');
			} else {
				view.render();
			}
		},

		addTask: function (object) {
			var self = this, view;

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

					self.$el.prepend(view.render().el);
				}
			});
		},

		editTasks: function () {
			var self = this, view;

			_.each(this.tasksCollection.where({selected:true}), function (model) {
				
				// Create a view with them.
				// re-render with a form: remove what is inside <li> and replace it for a form (only title)

				view = self._viewsCollection.findWhere({'id': model.get('id')}).get('view');
				view.render('form');
			});

			this.editingFormEnable = true;
		},

		saveTasks: function (action) {
			var self = this,
				view, title;

			_.each(this.tasksCollection.where({selected:true}), function (model) {
				view = self._viewsCollection.findWhere({'id': model.get('id')}).get('view');

				if (action === 'saving') {
					title = view.$el.find('[name=task_title_' + model.get('id') + ']').val();
					if (title) view.model.set('title', title);

					if (view.model.get('new_status')) {
						view.model.set('status', view.model.get('new_status'));
						view.render('class');
						view.model.set('new_status', undefined);
					}
					view.model.save();

				} else {
					// When cancel, need to set the original status on the view.
					view.model.set('new_status', undefined);
					view.render('class');
				}

				view.render();
			});

			this.editingFormEnable = false;
			this.changingFormEnable = false;
		},

		removeTasks: function (action) {
			var self = this,
				view;

			if (action === 'saving') {
				_.each(this.tasksCollection.where({selected:true}), function (model) {
					view = self._viewsCollection.findWhere({'id': model.get('id')}).get('view');
					view.remove();
				});

				this.tasksCollection.remove(this.tasksCollection.where({selected:true}));

				if (!this.tasksCollection.length) {
					this.render();
				}
			}

			this.editingFormEnable = false;
			this.changingFormEnable = false;
		},

		changeStatusTasks: function (newStatus) {
			var self = this,
				view;

			_.each(this.tasksCollection.where({selected:true}), function (model) {
				view = self._viewsCollection.findWhere({'id': model.get('id')}).get('view');

				if (!newStatus) {
					view.model.set('new_status', undefined);
				} else {
					view.model.set('new_status', newStatus);
				}

				view.render('class');
			});

			this.changingStatusEnable = true;
		},

		_getTaskView: function (model) {
			return new TaskView({
				el: this.$el.find('[task_id=' + model.get('id') + ']'),
				model: model,
				className: (model.get('new_status') || model.get('status'))
			});
		}
	});

});