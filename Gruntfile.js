/*global module:false*/
module.exports = function(grunt) {
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.initConfig({
        jshint: {
            all: ['Gruntfile.js', 'src/storage.js', 'test/spec.js']
        },
        qunit: {
            all: ['test/qunit.html']
        },
        uglify: {
            main: {
                files: {
                    'dist/storage.min.js': ['src/storage.js']
                }
            }
        },
        copy: {
            main: {
                files: [
                    {src: 'src/storage.js', dest: 'dist/', expand: true, flatten: true}
                ]
            }
        },
        watch: {
            src: {
                files: ['src/storage.js', 'test/spec.js'],
                tasks: ['jshint', 'qunit']
            }
        }
    });

    grunt.registerTask('test', ['jshint', 'qunit']);
    grunt.registerTask('default', ['test', 'publish']);
    grunt.registerTask('publish', ['uglify', 'copy']);
};