require.config({
    baseUrl: '/static/js',
    paths: {
        backbone: '../libs/js/backbone.min',
        underscore: '../libs/js/underscore.min',
        jquery: '../libs/js/jquery-1.10.2.min',
        chosen: '../libs/js/chosen.jquery.min',
        uniform: '../libs/js/jquery.uniform.min'
    },
    shim: {
        underscore: {
            exports: '_',
        },
        backbone: {
            deps: ['underscore', 'jquery'],
            exports: 'backbone'
        }
    }
});

require(['app'], function (app) {
    return new app({
        el: $('body')
    });
});