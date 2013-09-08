define('tasks_view', ['app'], function (app) {

	var TaskModel = Backbone.Model.extend({
			defaults: {
				'selected': false
			},
			url: function () {
				var id = this.get('id') ? this.get('id') : '';
				return '/task/' + id;
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
				'<p><input type="checkbox" name="task" value="<%= id %>" /></p>' +
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
				} else {
					this.$el.html(_.template(this.template, this.model.toJSON()));
				}

				this.$el.attr('task_id', this.model.get('id'));
				return this;
			},

			selectTask: function (e) {
				this.model.set('selected', !this.model.get('selected'));
			}
		});


	return Backbone.View.extend({
		noTaskTemplate: '<li class="no-task">There is not task to do! YaY! </li>',

		initialize: function (options) {
			var self = this;
			this.parent = options.parent;
			this.broker = options.broker;

			_.bindAll(this, 'selectItems');

			// Define a collection where will be stored the list of tasks.
			this.tasksCollection = new TasksCollection();

			// Getting the list! Make an initial request to the backend
			// to store all task in the collection as models.
			this.tasksCollection.fetch({
				success: function () {
					if (self.$el.children().length !== self.tasksCollection.length &&
						!self.$el.find('.no-task').length) {
						self.render();
					} else {
						self.tasksCollection.each(function (model) {
							// Binding events. Need to create the views.
							var view = new TaskView({
								el: self.$el.find('[task_id=' + model.get('id') + ']'),
								model: model,
								className: 'backbone tag ' + model.get('status')
							});
						}, this);
					}
				}
			});

			this.tasksCollection.bind('change:selected', this.selectItems);

			// Binding events!
			this.broker.on('task:create', this.addTask, this);
			this.broker.on('tasks:edit:view', this.editTasks, this);
			this.broker.on('tasks:edit:save', this.saveTasks, this);
			this.broker.on('tasks:status:change', this.changeStatusTasks, this);
			this.broker.on('tasks:remove', this.removeTasks, this);
		},

		render: function () {
			this.$el.children().remove();
			this.tasksCollection.each(function (model) {
				
				var view = new TaskView({
					model: model,
					className: 'backbone tag ' + model.get('status')
				});

				this.$el.append(view.render().el);
			}, this);

			if (!this.tasksCollection.length) {
				this.$el.append(this.noTaskTemplate);
			}

			return this;
		},

		selectItems: function (model) {
			// If an item has been checked and it's the first one: trigger an event to enable editRemove mode.

			if (model.get('selected') && this.tasksCollection.where({selected: true}).length === 1) {
				this.broker.trigger('task:select', 'checked');
			}

			// Else, if an item has been unchecked and it was the last element checked: trigger an event to disable
			// editRemove mode.

			else if (!model.get('selected') && !this.tasksCollection.where({selected: true}).length) {
				this.broker.trigger('task:select', 'unchecked');
			}

			if (this.editingFormEnable) {
				var self = this, view;

				// Anytime the user check or uncheck an item and the 'editingForm' view for a task is enable
				// we need to: check/uncheck the item and re-render the view to form/read-only mode.

				view = new TaskView({
					el: self.$el.find('[task_id=' + model.get('id') + ']'),
					model: model,
					className: 'backbone task editing ' + model.get('status')
				});

				if (model.get('selected')) {
					view.render('form');
				} else {
					view.render();
				}
			}
		},

		addTask: function (object) {
			var self = this;
			this.tasksCollection.create(object, {
				wait: true,
				success: function (model) {
					var view = new TaskView({
						model: model,
						className: 'backbone tag ' + model.get('status')
					});

					self.$el.prepend(view.render().el);
				}
			});
		},

		editTasks: function () {
			var self = this, view;

			_.each(this.tasksCollection.where({selected:true}), function (model) {
				
				// Create a view with them.
				// re-render with a form: remove what is inside <li> and replace it for a form (only title)

				view = new TaskView({
					el: self.$el.find('[task_id=' + model.get('id') + ']'),
					model: model,
					className: 'backbone task editing ' + model.get('status')
				});

				view.render('form');
			});

			this.editingFormEnable = true;
		},

		saveTasks: function (action) {
			var self = this,
				view;

			_.each(this.tasksCollection.where({selected:true}), function (model) {
				view = new TaskView({
					el: self.$el.find('[task_id=' + model.get('id') + ']'),
					model: model,
					className: 'backbone task editing ' + model.get('status')
				});

				if (action === 'saving') {
					// Save the model with the new title.
					model.set('title', view.$el.find('[name=task_title_' + model.get('id') + ']').val());
					model.save();
				}

				view.render();
			});

			this.editingFormEnable = false;
		},
		changeStatusTasks: function (listTasks) {},
		removeTasks: function (listTasks) {}
	});

});