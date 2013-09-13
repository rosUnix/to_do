define('msg_view', ['app'], function (app) {

	return Backbone.View.extend({

		initialize: function (options) {
			this.parent = options.parent;
			this.broker = options.broker;

			this.broker.on('success:task:create', this.taskCreated, this);
			this.broker.on('success:tasks:save', this.tasksUpdated, this);
			this.broker.on('error:tasks', this.tasksError, this);
		},

		render: function (message) {
			var self = this;

			this.$el.html('<p>' + message + '</p>');
			this.$el.fadeOut(4000, function () { self.$el.remove(); });
		},

		taskCreated: function () {
			this.render('A new task has been created');
		},

		tasksUpdated: function (action) {
			this.render('Selected tasks has been ' + action);
		},

		tasksError: function (action) {
			this.render('Ups! Something was wrong. Task/s could not be ' + action);
		}
	});
});