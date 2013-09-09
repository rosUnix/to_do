define('app', ['Backbone', 'underscore', 'tasks_view', 'nav_view'], function (Backbone, _, TasksView, NavView) {
//define('app', ['Backbone', 'underscore', 'tasks_view'], function (Backbone, _) {

	return Backbone.View.extend({

		initialize: function (options) {
			console.log('JS has been set up correctly ^.^');

			var tasks, nav;

			this.broker = _.extend({}, Backbone.Events);

			tasks = new TasksView({
				parent: this,
				el: this.$el.find('.tasks-list'),
				broker: this.broker
			});

			nav = new NavView({
				parent: this,
				el: this.$el.find('nav'),
				broker: this.broker
			});
		}
	});
});