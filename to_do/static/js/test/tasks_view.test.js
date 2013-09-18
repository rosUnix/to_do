define(['require', 'mocha', 'tasks_view'], function (require, mocha, TasksView) {
	
	describe('TasksView', function() {
 
		describe('CreateTaskView', function() {
			it('should has no tasks in the initial collection', function() {
				var tasks_view = new TasksView({
					el: '<div id="task-list"></div>',
					parent: new Backbone.View(),
					broker: _.extend({}, Backbone.Events)
				});
				tasks_view.tasksCollection.length.should.equal(0);
			});
		});
	});
});