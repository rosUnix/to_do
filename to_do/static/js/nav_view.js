define('nav_view', ['app'], function (app) {

	var NavView = Backbone.View.expand({
			initialize: function (options) {
				this.broker = options.broker;
				this.parent = options.parent;
				this.status = options.status;

				this.broker.on('status:change', this.statusChange, this);
			},

			statusChange: function (status) {
				this.status = this.parent.statusNavList[status];
			}
		}),

		AddSearchNav = NavView.expand({

			initialize: function (options) {
				this.$el.find('.add a').bind('click', this.addTask, this);
				this.$el.find('.search input').bind('keyup', this.searchTasks, this);

				this.broker.on('addSearch:show', function () {
					this.broker.trigger('status:change', 2);
				}, this);
			},

			addTask: function () {
				this.broker.trigger('status:change', 3);
				this.broker.trigger('addSearch:hide');
				// Display form nav (with title and description)
			},

			searchTasks: function () {
				this.broker.trigger('task:search', this.$el.find('.search input').val());
			}
		}),

		EditRemoveNav = NavView.expand({

			initialize: function (options) {
				this.$el.find('.edit a').bind('click', this.editTasks, this);
				this.$el.find('.remove a').bind('click', this.removeTasks, this);
				this.$el.find('.status a').bind('click', this.changeStatus, this);
			},

			editTasks: function () {
				this.broker.trigger('status:change', 3);
				this.broker.trigger('editTasks:hide');

				// Get a list of all tasks selected.
				var selectedTasks = [];
				this.broker.trigger('tasks:edit:view', selectedTasks);
			},

			removeTasks: function () {
				this.broker.trigger('status:change', 3);
				this.broker.trigger('editTasks:hide');

				var selectedTasks = [];
				this.broker.trigger('tasks:remove', selectedTasks);
			}
		}),

		SaveCancelNav = NavView.expand({

			initialize: function (options) {
				this.$el.find('.save input').bind('click', this.saveTasks, this);
				this.$el.find('.cancel a').bind('click', this.cancelTasks, this);
			},

			saveTasks: function () {
				this.broker.trigger('status:change', 3);
				this.broker.trigger('addSearch:show');

				var selectedList = [];
				// Collect all tasks selected with all metadata (as JSON)
				// if there's a "form" for each tasks. Otherwise, store only id (removing)
				this.broker.trigger('task:edit:save', selectedList);
			},

			cancelTasks: function () {
				this.broker.trigger('status:change', 3);
				this.broker.trigger('addSearch:show');
			}

		});

	return Backbone.View.expand({

		initialize: function (options) {

			this.parent = options.parent;
			this.broker = options.broker;

			this.statusNavList = ['showing', 'hiding', 'toShow', 'toHide'];

			this.addSearch = new AddSearchNav({
				parent: this,
				el: this.$el.find('.default'),
				broker: this.broker,
				status: this.statusNavList[0]
			});

			this.editRemove = new EditRemoveNav({
				parent: this,
				el: this.$el.find('.item_selected'),
				broker: this.broker,
				status: this.statusNavList[0]
			});

			this.saveCancel = new SaveCancelNav({
				parent: this,
				el: this.$el.find('.action_required'),
				broker: this.broker,
				status: this.statusNavList[0]
			});

			this.statusNav = new Backbone.Collection([{
				'view': this.addSearch,
				'status': this.addSearch.status
			}, {
				'view': this.editRemove,
				'status': this.editRemove.status
			}, {
				'view': this.saveCancel,
				'status': this.saveCancel.status
			}]);

			this.statusNav.bind('status:change', this.toggleNav, this);
		},

		toggleNav: function () {
			this.statusNav.findWhere({'status': this.statusNavList[2]}).get('view').show();
			this.statusNav.findWhere({'status': this.statusNavList[2]}).set('status', this.statusNavList[0]);
			this.statusNav.findWhere({'status': this.statusNavList[3]}).get('view').hide();
			this.statusNav.findWhere({'status': this.statusNavList[3]}).set('status', this.statusNavList[1]);
		},

		changeStatus: function (cid, status) {
			var self = this;
			this.statusNav.each(function (model) {
				if (model.get('view').cid === cid) {
					model.set('status', self.statusNavList[status]);
				}
			});
		}
		
	});
});