require.config({
	baseUrl: '/static/js',
	paths: {
		Backbone: '/static/libs/js/backbone.min',
        underscore: '/static/libs/js/underscore.min',
        jquery: '/static/libs/js/jquery-1.10.2.min',
        mocha: '/static/libs/js/test/mocha',
        chai: '/static/libs/js/test/chai',
	},
	shim: {
		underscore: {
            exports: '_',
        },
        Backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        }
	}
});

require(['require', 'chai', 'mocha'], function (require, chai) {
	var should = chai.should();

	mocha.setup('bdd');

	require(['test/tasks_view.test'], function (Main) {
		mocha.run();
	});
});