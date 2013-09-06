define('tasks_view', ['app'], function (app) {

	var TaskModel = Backbone.Model.extend({
			url: function () {
				return '/task/' + this.get('id');
			}
		}),

		TasksCollection = Backbone.Collection.extend({
			url: function () {
				return 'tasks/';
			}
		}),

		TaskView = Backbone.View.extend({
			tagName: 'li',
			template: '' +
				'<p><input type="checkbox" name="task" value="<%= id %>" /></p>' +
				'<p><%= title %></p>' +
				'<p><%= desc %></p>' +
				'<p><%= created_at %></p>',

			initialize: function () {},
			render: function () {

				this.$el.html(_.template(this.template, this.model.toJSON()));
				this.$el.attr('task_id', this.model.get('id'));
				return this;
			},
		});


	return Backbone.View.extend({
		noTaskTemplate: '<li class="no-task">There is not task to do! YaY! </li>',

		initialize: function (options) {
			var self = this;
			this.parent = options.parent;
			this.broker = options.broker;

			// Define a collection where will be stored the list of tasks.
			this.tasksCollection = new TasksCollection({
				model: TaskModel
			});

			// Getting the list! Make an initial request to the backend
			// to store all task in the collection as models.
			this.tasksCollection.fetch({
				success: function () {
					if (self.$el.children().length !== self.tasksCollection.length &&
						!self.$el.find('.no-task').length) {
						self.render();
					}
				}
			});

			// Binding events!
			this.broker.on('task:create', this.addTask, this);
			this.broker.on('task:edit:view', this.editTasks, this);
			this.broker.on('task:edit:save', this.saveTasks, this);
			this.broker.on('task:status:change', this.changeStatusTasks, this);
			this.broker.on('task:remove', this.removeTasks, this);
			this.broker.on('task:search', this.searchTasks, this);
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

		addTask: function (object) {
			this.tasksCollection.create(object, {
				wait: true,
				success: this._syncModel(model, response)
			});
		},

		editTasks: function (listTasks) {},
		saveTasks: function (listTasks) {},
		changeStatusTasks: function (listTasks) {},
		removeTasks: function (listTasks) {},
		searchTasks: function (query) {}
	});

});