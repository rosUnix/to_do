define('nav_view', ['app'], function (app) {

	var AddSearchNav = Backbone.View.expand({

			initialize: function (options) {
				// .default
			}
		}),

		EditRemoveNav = Backbone.View.expand({

			initialize: function (options) {
				// .item_selected
			}
		}),

		SaveCancelNav = Backbone.View.expand({

			initialize: function (options) {
				// .action_required
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
				'status': this.statusNavList[0]
			}, {
				'view': this.editRemove,
				'status': this.statusNavList[1]
			}, {
				'view': this.saveCancel,
				'status': this.statusNavList[1]
			}]);

			this.statusNav.bind('status:change', this.toggleNav, this);
		},

		toggleNav: function () {
			this.statusNav.findWhere({'status': this.statusNavList[2]}).get('view').show();
			this.statusNav.findWhere({'status': this.statusNavList[3]}).get('view').hide();
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