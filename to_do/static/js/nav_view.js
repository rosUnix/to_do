define('nav_view', ['app'], function (app) {

	var BaseNavView = Backbone.View.extend({
			initialize: function (options) {
				
				this.broker = options.broker;
				this.parent = options.parent;
				this.status = options.status;
			},

			statusChange: function (status) {
				// ['showing', 'hiding', 'toShow', 'toHide']
				if (status === 'toShow') {
					this.$el.show();
					this.status = 'showing';
				} else if (status === 'toHide') {
					this.$el.hide();
					this.status = 'hiding';
				}
			}
		}),

		AddSearchNav = BaseNavView.extend({

			initialize: function (options) {
				BaseNavView.prototype.initialize.call(this, options);
				_.bindAll(this, 'addTask', 'searchTasks');

				// Binding events fromt the user.
				this.$el.find('.add a').bind('click', this.addTask);
				this.$el.find('.search input').bind('keyup', this.searchTasks);

				// Binding show/hide events for AddSearch navigation
				this.broker.on('addSearch:show', function () {
					this.statusChange('toShow');
				}, this);
				this.broker.on('addSearch:hide', function () {
					this.statusChange('toHide');
				}, this);
			},

			addTask: function () {
				this.broker.trigger('addSearch:hide');
				this.broker.trigger('createForm:show');
				// Display form nav (with title and description)
			},

			searchTasks: function () {
				// Triggering search event to tasks_view module.
				this.broker.trigger('task:search', this.$el.find('.search input').val());
			}
		}),

		CreateFormNav = BaseNavView.extend({

			initialize: function (options) {
				BaseNavView.prototype.initialize.call(this, options);
				_.bindAll(this, 'submitTask', 'cancelTask');

				// Binding events from the user.
				this.$el.find('.save input').bind('click', this.submitTask);
				this.$el.find('.cancel a').bind('click', this.cancelTask);

				// Binding show/hide events for CreateForm navigation
				this.broker.on('createForm:show', function () {
					this.statusChange('toShow');
				}, this);
				this.broker.on('createForm:hide', function () {
					this.statusChange('toHide');
				}, this);
			},

			submitTask: function () {
				this.broker.trigger('createForm:hide');
				this.broker.trigger('addSearch:show');

				// Collect all datas to create a task.
				var datas = this._collectDatas();
				this.broker.trigger('task:create', datas);
			},

			cancelTask: function () {
				this.broker.trigger('createForm:hide');
				this.broker.trigger('addSearch:show');

				this._cleanForm();
			},

			_collectDatas: function () {},
			_cleanForm: function() {}
		}),

		EditRemoveNav = BaseNavView.extend({

			initialize: function (options) {
				BaseNavView.prototype.initialize.call(this, options);
				_.bindAll(this, 'editTasks', 'removeTasks', 'changeStatus');

				// Binding events from the user.
				this.$el.find('.edit a').bind('click', this.editTasks);
				this.$el.find('.remove a').bind('click', this.removeTasks);
				this.$el.find('.status a').bind('click', this.changeStatus);

				// Binding show/hide events for EditRemove navigation
				this.broker.on('editRemove:show', function () {
					this.statusChange('toShow');
				}, this);
				this.broker.on('editRemove:hide', function () {
					this.statusChange('toHide');
				}, this);
			},

			editTasks: function () {
				this.broker.trigger('editRemove:hide');
				this.broker.trigger('saveCancel:show', 'editing');

				// Get a list of all tasks selected (ID).
				var selectedTasks = [];
				// Change mode from read-only to form in each task.
				this.broker.trigger('tasks:edit:view', selectedTasks);
			},

			removeTasks: function () {
				this.broker.trigger('editRemove:hide');
				this.broker.trigger('saveCancel:show', 'removing');

				// Those tasks will be removed on the "save" action.
				// var selectedTasks = [];
				// this.broker.trigger('tasks:remove', selectedTasks);
			},

			changeStatus: function () {
				// Show dropdow and apply the new status to all items selected
			}
		}),

		SaveCancelNav = BaseNavView.extend({

			initialize: function (options) {
				BaseNavView.prototype.initialize.call(this, options);
				_.bindAll(this, 'saveTasks', 'cancelTasks', '_checkedItems');

				// Binding events from the user.
				this.$el.find('.save input').bind('click', this.saveTasks);
				this.$el.find('.cancel a').bind('click', this.cancelTasks);

				// Binding show/hide events for SaveCancel navigation
				this.broker.on('saveCancel:show', function (action) {
					this.statusChange('toShow');
					this.action = action;
				}, this);
				this.broker.on('saveCancel:hide', function () {
					this.statusChange('toHide');
				}, this);

				this.broker.on('task:select', this._checkedItems);
			},

			saveTasks: function () {
				this.broker.trigger('saveCancel:hide');
				this.broker.trigger('addSearch:show');

				var selectedList = [];
				if (this.action === 'editing') {
					// Collect all datas: id, title and description.
					this.broker.trigger('task:edit:save', selectedList);
				} else {
					// collect a list of ID only
					this.broker.trigger('task:remove', selectedList);
				}
			},

			cancelTasks: function () {
				// Come back each task to read-only mode
				this.broker.trigger('task:edit:save', []);

				this.broker.trigger('saveCancel:hide');

				if (this.itemsSelected === 'checked') {
					this.broker.trigger('editRemove:show');
				} else {
					this.broker.trigger('addSearch:show');
				}
			},

			_checkedItems: function (mode) {
				this.itemsSelected = mode;
			}

		});

	return Backbone.View.extend({

		initialize: function (options) {

			this.parent = options.parent;
			this.broker = options.broker;

			this.statusNavList = ['showing', 'hiding', 'toShow', 'toHide'];

			_.bindAll(this, 'selectedItem');

			this.addSearch = new AddSearchNav({
				parent: this,
				el: this.$el.find('.default'),
				broker: this.broker,
				status: this.statusNavList[0]
			});

			this.createForm = new CreateFormNav({
				parent: this,
				el: this.$el.find('.form'),
				broker: this.broker,
				status: this.statusNavList[1]
			});

			this.editRemove = new EditRemoveNav({
				parent: this,
				el: this.$el.find('.item_selected'),
				broker: this.broker,
				status: this.statusNavList[1]
			});

			this.saveCancel = new SaveCancelNav({
				parent: this,
				el: this.$el.find('.action_required'),
				broker: this.broker,
				status: this.statusNavList[1]
			});

			this.createForm.$el.hide();
			this.editRemove.$el.hide();
			this.saveCancel.$el.hide();

			this.broker.on('task:select', this.selectedItem);
		},

		selectedItem: function (mode) {
			if (mode === 'checked') {
				this.broker.trigger('addSearch:hide');
				this.broker.trigger('createForm:hide');
				this.broker.trigger('saveCancel:hide');

				this.broker.trigger('editRemove:show');
			} else if (mode === 'unchecked') {
				this.broker.trigger('editRemove:hide');
				this.broker.trigger('createForm:hide');
				this.broker.trigger('saveCancel:hide');

				this.broker.trigger('addSearch:show');
			}
		}
		
	});
});