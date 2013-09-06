define('app', ['Backbone', 'underscore'], function (Backbone, _) {
//define('app', ['Backbone', 'underscore', 'tasks_view'], function (Backbone, _) {

	return Backbone.View.extend({

		initialize: function (options) {
			console.log('JS has been set up correctly ^.^');

			// var self = this, mainView;
			// debugger;
			// mainView = new TasksView({
			//		parent: self,
			//		el: this.$el
			// });

			// this.broker = _.extend({}, Backbone.Events.extend({
			//	registerEvent: function (event, function, who) {
					
			//	}
			// });
		}
	});
});