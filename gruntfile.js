module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    nodewebkit: {
      options: {
        build_dir: './dist',
        mac: true,
        win: true,
        linux32: false,
        linux64: false
      },
      src: ['./app/**/**/*']
    },
    less: {
      development: {
        options: {
          compress: false
        },
        files: {
          "app/assets/css/app.css": "app/assets/css/*.less"
        }
      }
    },
    jade: {
      options:{
        pretty: true
      },
      compile: {
        files: {
          "app/index.html": ["app/index.jade"]
        }
      }
    },
    coffee: {
      glob_to_multiple: {
        expand: true,
        flatten: true,
        cwd: 'app/assets/js',
        src: ['*.coffee'],
        dest: 'app/assets/js/',
        ext: '.js'
      }
    },
    watch: {
      styles: {
        files: ['app/assets/css/**.less'], // which files to watch
        tasks: ['less'],
      },
      templates: {
        files: ['app/index.jade'],
        tasks: ['jade']
      },
      scripts: {
        files: ['app/assets/js/**.coffee'],
        tasks: ['coffee']
      }
    }

  })
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-node-webkit-builder');
    // grunt.registerTask('default', ['nodewebkit']);
  };