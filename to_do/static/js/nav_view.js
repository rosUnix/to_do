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

		AddTaskNav = BaseNavView.extend({

			initialize: function (options) {
				BaseNavView.prototype.initialize.call(this, options);
				_.bindAll(this, 'addTask');

				// Binding events fromt the user.
				this.$el.find('.add a').bind('click', this.addTask);

				// Binding show/hide events for AddTask navigation
				this.broker.on('addTask:show', function () {
					this.statusChange('toShow');
				}, this);
				this.broker.on('addTask:hide', function () {
					this.statusChange('toHide');
				}, this);
			},

			addTask: function (e) {
				e.preventDefault();

				this.broker.trigger('addTask:hide');
				this.broker.trigger('createForm:show');
				// Display form nav (with title and description)
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

			submitTask: function (e) {
				e.preventDefault();

				this.broker.trigger('createForm:hide');
				this.broker.trigger('addTask:show');

				// Collect all datas to create a task.
				var datas = this._collectDatas();
				this.broker.trigger('task:create', datas);

				this._cleanForm();
			},

			cancelTask: function (e) {
				e.preventDefault();

				this.broker.trigger('createForm:hide');
				this.broker.trigger('addTask:show');

				this._cleanForm();
			},

			_collectDatas: function () {
				var datas = {};

				datas.title = this.$el.find('[name=title]').val();
				datas.status = 'waiting';

				return datas;
			},

			_cleanForm: function() {
				this.$el.find('[name=title]').val('');
			}
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

			editTasks: function (e) {
				e.preventDefault();

				this.broker.trigger('editRemove:hide');
				this.broker.trigger('saveCancel:show', 'editing');

				this.broker.trigger('tasks:edit:view');
			},

			removeTasks: function (e) {
				e.preventDefault();

				this.broker.trigger('editRemove:hide');
				this.broker.trigger('saveCancel:show', 'removing');
			},

			changeStatus: function (e) {
				e.preventDefault();

				// Show dropdow and apply the new status to all items selected
				this.broker.trigger('editRemove:hide');
				this.broker.trigger('selectStatus:show');
			}
		}),

		SelectStatusNav = BaseNavView.extend({
			initialize: function (options) {
				BaseNavView.prototype.initialize.call(this, options);
				_.bindAll(this, 'changingStatus', 'saveTasks', 'cancelTasks');

				this.$el.find('.select select').bind('change', this.changingStatus);
				this.$el.find('.save input').bind('click', this.saveTasks);
				this.$el.find('.cancel a').bind('click', this.cancelTasks);

				this.broker.on('selectStatus:show', function () {
					this.statusChange('toShow');
				}, this);
				this.broker.on('selectStatus:hide', function () {
					this.statusChange('toHide');
				}, this);

				this.broker.on('task:select', this._checkedItems);
			},

			changingStatus: function (e) {
				e.preventDefault();

				if (this.$el.find('.select select').val()) {
					this.broker.trigger('tasks:status:change', this.$el.find('select').val());
				} else {
					this.broker.trigger('tasks:status:change', undefined);
				}
			},

			saveTasks: function (e) {
				e.preventDefault();

				this.broker.trigger('selectStatus:hide');
				this.broker.trigger('tasks:edit:save', 'saving');
				this.broker.trigger('editRemove:show');

				this._cleanForm();
			},

			cancelTasks: function (e) {
				e.preventDefault();

				this.broker.trigger('selectStatus:hide');
				this.broker.trigger('tasks:edit:save', 'canceling');
				this.broker.trigger('editRemove:show');

				this._cleanForm();
			},

			_cleanForm: function () {
				this.$el.find('.select select').val('');
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

			saveTasks: function (e) {
				e.preventDefault();

				this.broker.trigger('saveCancel:hide');

				if (this.action === 'editing') {
					// Collect all datas: id, title and description.
					this.broker.trigger('editRemove:show');
					this.broker.trigger('tasks:edit:save', 'saving');
				} else {
					// collect a list of ID only
					this.broker.trigger('addTask:show');
					this.broker.trigger('tasks:remove', 'saving');
				}
			},

			cancelTasks: function (e) {
				e.preventDefault();

				// Come back each task to read-only mode
				if (this.action === 'editing') {
					this.broker.trigger('tasks:edit:save', 'canceling');
				} else {
					this.broker.trigger('tasks:remove', 'canceling');
				}

				this.broker.trigger('saveCancel:hide');

				if (this.itemsSelected === 'checked') {
					this.broker.trigger('editRemove:show');
				} else {
					this.broker.trigger('addTask:show');
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

			this.addTask = new AddTaskNav({
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

			this.selectStatus = new SelectStatusNav({
				parent: this,
				el: this.$el.find('.change_status'),
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
			this.selectStatus.$el.hide();
			this.saveCancel.$el.hide();

			this.broker.on('task:select', this.selectedItem);
		},

		selectedItem: function (mode) {
			if (mode === 'checked') {

				this.broker.trigger('addTask:hide');
				this.broker.trigger('createForm:hide');
				this.broker.trigger('selectStatus:hide');
				this.broker.trigger('saveCancel:hide');
				this.broker.trigger('editRemove:show');

			} else if (mode === 'unchecked') {

				this.broker.trigger('editRemove:hide');
				this.broker.trigger('createForm:hide');
				this.broker.trigger('selectStatus:hide');
				this.broker.trigger('saveCancel:hide');
				this.broker.trigger('addTask:show');
			}
		}
		
	});
});