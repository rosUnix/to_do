define('app', ['Backbone', 'underscore', 'tasks_view', 'nav_view', 'msg_view'], function (Backbone, _, TasksView, NavView, MsgView) {

	return Backbone.View.extend({

		initialize: function (options) {
			console.log('JS has been set up correctly ^.^');

			var tasks, nav, msg;

			this.broker = _.extend({}, Backbone.Events);

			tasks = new TasksView({
				parent: this,
				el: this.$('.tasks-list'),
				broker: this.broker
			});

			nav = new NavView({
				parent: this,
				el: this.$('nav'),
				broker: this.broker
			});

			msg = new MsgView({
				parent: this,
				el: this.$('.messages'),
				broker: this.broker
			});
		}
	});
});
