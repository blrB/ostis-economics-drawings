module.exports = function () {

    var kb = 'kb/economics_drawings/';
    var components = 'sc-web/components/economics/';
    var clientJsDirPath = '../sc-web/client/static/components/js/';
    var clientCssDirPath = '../sc-web/client/static/components/css/';
    var clientHtmlDirPath = '../sc-web/client/static/components/html/';
    var clientImgDirPath = '../sc-web/client/static/components/images/';
    var commonJsDirPath = '../sc-web/client/static/common/';

    return {
        concat: {
            economicscmp: {
                src: [
                    components + 'src/clarificationOfQuestion.js',
                    components + 'src/economics-keynode-handler.js',
                    components + 'src/economics.js',
                    components + 'src/economics-debug.js',
                    components + 'src/economics-math.js',
                    components + 'src/economics-model-objects.js',
                    components + 'src/economics-alphabet.js',
                    components + 'src/economics-render.js',
                    components + 'src/economics-scene.js',
                    components + 'src/economics-legend.js',
                    components + 'src/economics-layout.js',
                    components + 'src/economics-tree.js',
                    components + 'src/economics-struct.js',
                    components + 'src/economics-object-creator.js',
                    components + 'src/economics-template-finder.js',
                    components + 'src/economics-component.js',
                    components + 'src/listener/economics-mode-edge.js',
                    components + 'src/listener/economics-mode-link.js',
                    components + 'src/listener/economics-mode-select.js',
                    components + 'src/command/append-object.js',
                    components + 'src/command/command-manager.js',
                    components + 'src/command/create-edge.js',
                    components + 'src/command/create-link.js',
                    components + 'src/command/change-idtf.js',
                    components + 'src/command/change-content.js',
                    components + 'src/command/change-type.js',
                    components + 'src/command/delete-objects.js',
                    components + 'src/command/move-object.js',
                    components + 'src/command/move-line-point.js',
                    components + 'src/command/get-node-from-memory.js',
                    components + 'src/command/wrapper-command.js'],
                dest: clientJsDirPath + 'economics/economics.js'
            }
        },
        copy: {
            economicsIMG: {
                cwd: components + 'static/components/images/economics',
                src: ['**'],
                dest: clientImgDirPath + 'economics/',
                expand: true
            },
            economicsCSS: {
                cwd: components + 'static/components/css/',
                src: ['economics.css'],
                dest: clientCssDirPath,
                expand: true,
                flatten: true
            },
            economicsJs: {
                cwd: components + 'static/common/js/',
                src: ['**'],
                dest: commonJsDirPath,
                expand: true,
                flatten: false
            },
            economicsHTML: {
                cwd: components + 'static/components/html/',
                src: ['*.html'],
                dest: clientHtmlDirPath,
                expand: true,
                flatten: true
            },
            kb: {
                cwd: kb,
                src: ['**'],
                dest: '../kb/economics_drawings/',
                expand: true
            }
        },
        watch: {
            economicscmp: {
                files: components + 'src/**',
                tasks: ['concat:economicscmp']
            },
            economicsIMG: {
                files: [components + 'static/components/images/**'],
                tasks: ['copy:economicsIMG']
            },
            economicsCSS: {
                files: [components + 'static/components/css/**'],
                tasks: ['copy:economicsCSS']
            },
            economicsHTML: {
                files: [components + 'static/components/html/**',],
                tasks: ['copy:economicsHTML']
            },
            copyKB: {
                files: [kb + '**',],
                tasks: ['copy:kb']
            },
            economicsJs: {
                files: [components + 'static/common/js/**',],
                tasks: ['copy:economicsJs']
            }
        },
        exec: {
            updateCssAndJs: 'sh add-css-and-js.sh'
        }
    }
};