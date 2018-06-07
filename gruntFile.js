module.exports = function (grunt) {

    // #! Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        /*jshint: {
            files: {
                src: ['js/withPricelist/main.js', 'js/withPricelist/withPricelist.js']
            },
            options: {
                curly: true,
                eqeqeq: true,
                eqnull: true,
                browser: true,
                globals: {
                    jQuery: true
                },
            },
        },*/
        /*concat: {
            target: {
                src: [
                    '<%= baseUrl %>bower_components/bootstrap/dist/css/bootstrap.min.css',
                    '<%= baseUrl %>bower_components/bootstrap-datepicker/dist/css/bootstrap-datepicker3.min.css'
                ],
                dest: '<%= baseUrl %>css/bower_components.min.css',
            },
        },*/
        cssmin: {
            options: {
                mergeIntoShorthands: false,
                roundingPrecision: -1,
                sourceMap: true
            },
            target: {
                files: {
                    '<%= baseUrl %>css/withPricelist.min.css': [
                        '<%= baseUrl %>bower_components/bootstrap/dist/css/bootstrap.min.css',
                        '<%= baseUrl %>bower_components/bootstrap-datepicker/dist/css/bootstrap-datepicker3.min.css',
                        '<%= baseUrl %>css/main.css',
                    ]
                }
            },
            main: {
                files: {
                    '<%= baseUrl %>css/main.min.css': [
                        '<%= baseUrl %>css/main.css',
                    ]
                }
            },
            skinLtb: {
                files: {
                    '<%= baseUrl %>css-skins/listTb.min.css': [
                        '<%= baseUrl %>css-skins/listTb.css',
                    ]
                }
            },
            skinLtbmain: {
                files: {
                    '<%= baseUrl %>css-skins/listTb_main.min.css': [
                        '<%= baseUrl %>css-skins/listTb.css',
                        '<%= baseUrl %>css/main.css',
                    ]
                }
            }
        },
        copy: {
            main: {
                files: [
                    // includes files within path
                    {
                        expand: true,
                        cwd: '<%= baseUrl %>bower_components/bootstrap/fonts',
                        src: '**',
                        dest: '<%= baseUrl %>fonts/',
                        filter: 'isFile'
                    },
                ]
            }
        },
        baseUrl: 'js/withPricelist/'
    });

    // #! Load the plugin that provides the "jshint" task and other
    // grunt.loadNpmTasks('grunt-contrib-jshint');
    // grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // #! Default task(s).
    grunt.registerTask('default', ['cssmin', 'copy']);

};