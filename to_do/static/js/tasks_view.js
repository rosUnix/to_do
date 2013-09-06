define('tasks_view', ['app'], function (app) {

	var task_model = Backbone.Model.extend({}),
			// url: function () {
			// 	return 'task/' + this.get('id');
			// }
		// }),

		task_view = Backbone.View.extend({
			tagName: 'li',
			template: '',

			initialize: function () {},
			render: function () {
				this.$el.html(this.template(this.model.toJSON()));
				return this;
			},
		});

	return Backbone.View.extend({
		tagName: 'ul',
		noTaskTemplate: '<li class="no-task">There is not task to do! YaY! </li>',

		initialize: function (options) {
			this.parent = options.parent;

			// Set up listing tasks.
			// Fetch collection of tasks.

			this.tasksCollection = Backbone.Collection.extend({
				model: task_model,
				url: '/tasks'
			});


			// this.tasksCollection = Backbone.Collection.extend({
			// 	model: task_model,
			// 	url: 'tasks/'
			// });

			this.tasksCollection.fetch();

			if (this.$el.children().length !== this.tasksCollection.length && !this.$el.find('no-task').length) {
				this.render();
			}

			this.bind('sync', function (e) {
				console.log('sync event!');
			});
		},

		render: function () {
			this.$el.remove();
			this.tasksCollection.each(function (model) {
				var view = new task_view({model: model});
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

		_syncModel: function (model, response) {
			model.syncNew(response);
		}
	});

});