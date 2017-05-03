var Economics = Economics || {version: "0.1.0"};

Economics.Editor = function () {

    this.render = null;
    this.scene = null;
};

Economics.Editor.prototype = {


    init: function (params) {
        this.typesMap = {
            'economics-type-node': sc_type_node,
            'economics-type-node-const': sc_type_node | sc_type_const,
            'economics-type-node-const-group': sc_type_node | sc_type_const | sc_type_node_class,
            'economics-type-node-const-abstract': sc_type_node | sc_type_const | sc_type_node_abstract,
            'economics-type-node-const-material': sc_type_node | sc_type_const | sc_type_node_material,
            'economics-type-node-const-norole': sc_type_node | sc_type_const | sc_type_node_norole,
            'economics-type-node-const-role': sc_type_node | sc_type_const | sc_type_node_role,
            'economics-type-node-const-struct': sc_type_node | sc_type_const | sc_type_node_struct,
            'economics-type-node-const-tuple': sc_type_node | sc_type_const | sc_type_node_tuple,
            'economics-type-node-var': sc_type_node | sc_type_var,
            'economics-type-node-var-group': sc_type_node | sc_type_var | sc_type_node_class,
            'economics-type-node-var-abstract': sc_type_node | sc_type_var | sc_type_node_abstract,
            'economics-type-node-var-material': sc_type_node | sc_type_var | sc_type_node_material,
            'economics-type-node-var-norole': sc_type_node | sc_type_var | sc_type_node_norole,
            'economics-type-node-var-role': sc_type_node | sc_type_var | sc_type_node_role,
            'economics-type-node-var-struct': sc_type_node | sc_type_var | sc_type_node_struct,
            'economics-type-node-var-tuple': sc_type_node | sc_type_var | sc_type_node_tuple,
            'economics-type-edge-common': sc_type_edge_common,
            'economics-type-arc-common': sc_type_arc_common,
            'economics-type-arc-common-access': sc_type_arc_access,
            'economics-type-edge-const': sc_type_edge_common | sc_type_const,
            'economics-type-arc-const': sc_type_arc_common | sc_type_const,
            'economics-type-arc-const-perm-pos-access': sc_type_arc_access | sc_type_const | sc_type_arc_pos | sc_type_arc_perm,
            'economics-type-arc-const-perm-neg-access': sc_type_arc_access | sc_type_const | sc_type_arc_neg | sc_type_arc_perm,
            'economics-type-arc-const-perm-fuz-access': sc_type_arc_access | sc_type_const | sc_type_arc_fuz | sc_type_arc_perm,
            'economics-type-arc-const-temp-pos-access': sc_type_arc_access | sc_type_const | sc_type_arc_pos | sc_type_arc_temp,
            'economics-type-arc-const-temp-neg-access': sc_type_arc_access | sc_type_const | sc_type_arc_neg | sc_type_arc_temp,
            'economics-type-arc-const-temp-fuz-access': sc_type_arc_access | sc_type_const | sc_type_arc_fuz | sc_type_arc_temp,
            'economics-type-edge-var': sc_type_edge_common | sc_type_var,
            'economics-type-arc-var': sc_type_arc_common | sc_type_var,
            'economics-type-arc-var-perm-pos-access': sc_type_arc_access | sc_type_var | sc_type_arc_pos | sc_type_arc_perm,
            'economics-type-arc-var-perm-neg-access': sc_type_arc_access | sc_type_var | sc_type_arc_neg | sc_type_arc_perm,
            'economics-type-arc-var-perm-fuz-access': sc_type_arc_access | sc_type_var | sc_type_arc_fuz | sc_type_arc_perm,
            'economics-type-arc-var-temp-pos-access': sc_type_arc_access | sc_type_var | sc_type_arc_pos | sc_type_arc_temp,
            'economics-type-arc-var-temp-neg-access': sc_type_arc_access | sc_type_var | sc_type_arc_neg | sc_type_arc_temp,
            'economics-type-arc-var-temp-fuz-access': sc_type_arc_access | sc_type_var | sc_type_arc_fuz | sc_type_arc_temp
        };

        this.render = new Economics.Render();
        this.scene = new Economics.Scene({render: this.render, edit: this});
        this.scene.init();

        this.render.scene = this.scene;
        this.render.init(params);

        this.containerId = params.containerId;

        if (params.autocompletionVariants)
            this.autocompletionVariants = params.autocompletionVariants;
        if (params.translateToSc)
            this.translateToSc = params.translateToSc;
        if (params.resolveControls)
            this.resolveControls = params.resolveControls;

        this.canEdit = params.canEdit ? true : false;
        this.finder = params.finder;
        this.initUI();

    },

    /**
     * Initialize user interface
     */
    initUI: function () {
        var self = this;
        var container = '#' + this.containerId;
        $(container).prepend('<div id="tools-' + this.containerId + '"></div>');
        var tools_container = '#tools-' + this.containerId;
        $(tools_container).load('static/components/html/economics-tools-panel.html', function () {
            $.ajax({
                url: "static/components/html/economics-types-panel-nodes.html",
                dataType: 'html',
                success: function (response) {
                    self.node_types_panel_content = response;
                },
                error: function () {
                    EconomicsDebug.error("Error to get nodes type change panel");
                },
                complete: function () {
                    $.ajax({
                        url: "static/components/html/economics-types-panel-edges.html",
                        dataType: 'html',
                        success: function (response) {
                            self.edge_types_panel_content = response;
                        },
                        error: function () {
                            EconomicsDebug.error("Error to get edges type change panel");
                        },
                        complete: function () {
                            self.bindToolEvents();
                        }
                    });
                }
            });
            if (!self.canEdit) {
                self.hideTool(self.toolEdge());
                self.hideTool(self.toolIntegrate());
                self.hideTool(self.toolUndo());
                self.hideTool(self.toolRedo());
            }
            if (self.resolveControls)
                self.resolveControls(tools_container);
            self.hideTool(self.toolIntegrate());
        });
        this.scene.event_selection_changed = function () {
            self.onSelectionChanged();
        };
        this.scene.event_modal_changed = function () {
            self.onModalChanged();
        };
        this.keyboardCallbacks = {
            'onkeydown': function (event) {
                self.scene.onKeyDown(event)
            },
            'onkeyup': function (event) {
                self.scene.onKeyUp(event);
            }
        };
        this.openComponentCallbacks = function () {
            self.render.requestUpdateAll();
        }
    },

    hideTool: function (tool) {
        tool.addClass('hidden');
    },

    showTool: function (tool) {
        tool.removeClass('hidden');
    },

    toggleTool: function (tool) {
        tool.toggleClass('hidden');
    },

    tool: function (name) {
        return $('#' + this.containerId).find('#economics-tool-' + name);
    },

    toolSelect: function () {
        return this.tool('select');
    },

    toolEdge: function () {
        return this.tool('edge');
    },

    toolLink: function () {
        return this.tool('link');
    },

    toolUndo: function () {
        return this.tool('undo');
    },

    toolRedo: function () {
        return this.tool('redo');
    },

    toolChangeIdtf: function () {
        return this.tool('change-idtf');
    },

    toolChangeType: function () {
        return this.tool('change-type');
    },

    toolSetContent: function () {
        return this.tool('set-content');
    },

    toolDelete: function () {
        return this.tool('delete');
    },
    toolLegend: function () {
        return this.tool('legend');
    },
    toolClear: function () {
        return this.tool('clear');
    },

    toolIntegrate: function () {
        return this.tool('integrate');
    },

    toolZoomIn: function () {
        return this.tool('zoomin');
    },

    toolZoomOut: function () {
        return this.tool('zoomout');
    },

    /**
     * Bind events to panel tools
     */
    bindToolEvents: function () {

        var self = this;
        var container = '#' + this.containerId;
        var cont = $(container);

        this.toolSelect().click(function () {
            self.scene.setEditMode(EconomicsEditMode.EconomicsModeSelect);
        });

        this.toolEdge().click(function () {
            self.scene.setEditMode(EconomicsEditMode.EconomicsModeEdge);
        });

        this.toolLink().click(function () {
            self.scene.setEditMode(EconomicsEditMode.EconomicsModeLink);
        });

        this.toolUndo().click(function () {
            self.scene.commandManager.undo();
            self.scene.updateRender();
        });

        this.toolRedo().click(function () {
            self.scene.commandManager.redo();
            self.scene.updateRender();
        });

        this.toolLegend().click(function () {
            var tool = $(this);

            function stop_modal() {
                tool.popover('destroy');
                EconomicsLegend.legendVisibel = false;
            }

            if (EconomicsLegend.legendVisibel)
                stop_modal();
            else {
                tool.popover({
                    container: container,
                    title: ' ',
                    html: true,
                    display: true
                }).popover('show');
                cont.find('.popover-title').append('<button id="scgg-type-close" type="button" class="close">&times;</button>');
                cont.find('.popover-content ').append(EconomicsLegend.createTable(self.scene));
                EconomicsLegend.legendVisibel = true;
            }
            $(container + ' #scgg-type-close').click(function () {
                stop_modal();
            });

        });

        this.toolChangeIdtf().click(function () {
            self.scene.setModal(EconomicsModalMode.EconomicsModalIdtf);
            $(this).popover({container: container});
            $(this).popover('show');

            var tool = $(this);

            function stop_modal() {
                self.scene.setModal(EconomicsModalMode.EconomicsModalNone);
                tool.popover('destroy');
                self.scene.updateObjectsVisual();
            }

            var input = $(container + ' #economics-change-idtf-input');
            // setup initial value
            input.val(self.scene.selected_objects[0].text);

            // Fix for chrome: http://stackoverflow.com/questions/17384464/jquery-focus-not-working-in-chrome
            setTimeout(function () {
                input.focus();
            }, 1);
            input.keypress(function (e) {
                if (e.keyCode == KeyCode.Enter || e.keyCode == KeyCode.Escape) {

                    if (e.keyCode == KeyCode.Enter) {
                        var obj = self.scene.selected_objects[0];
                        if (obj.text != input.val()) {
                            self.scene.commandManager.execute(new EconomicsCommandChangeIdtf(obj, input.val()));
                        }
                    }
                    stop_modal();
                    e.preventDefault();
                }

            });

            if (self.autocompletionVariants) {
                var types = {
                    local: function (text) {
                        return "[" + text + "]";
                    },
                    remote: function (text) {
                        return "<" + text + ">";
                    }

                };

                input.typeahead({
                        minLength: 1,
                        highlight: true
                    },
                    {
                        name: 'idtf',
                        source: function (str, callback) {
                            self._idtf_item = null;
                            self.autocompletionVariants(str, callback, {editor: self});
                        },
                        displayKey: 'name',
                        templates: {
                            suggestion: function (item) {
                                var decorator = types[item.type];
                                if (decorator)
                                    return decorator(item.name);

                                return item.name;
                            }
                        }
                    }
                ).bind('typeahead:selected', function (evt, item, dataset) {
                    if (item && item.addr) {
                        self._idtf_item = item;
                    }
                    evt.stopPropagation();
                    $('.typeahead').val('');
                });
            }

            // process controls
            $(container + ' #economics-change-idtf-apply').click(function () {
                var obj = self.scene.selected_objects[0];
                if (obj.text != input.val() && !self._idtf_item) {
                    self.scene.commandManager.execute(new EconomicsCommandChangeIdtf(obj, input.val()));
                }
                if (self._idtf_item) {
                    window.sctpClient.get_element_type(self._idtf_item.addr).done(function (t) {
                        self.scene.commandManager.execute(new EconomicsCommandGetNodeFromMemory(obj,
                            t,
                            input.val(),
                            self._idtf_item.addr,
                            self.scene));
                        stop_modal();
                    });
                } else
                    stop_modal();
            });
            $(container + ' #economics-change-idtf-cancel').click(function () {
                stop_modal();
            });

        });

        this.toolChangeType().click(function () {
            self.scene.setModal(EconomicsModalMode.EconomicsModalType);

            var tool = $(this);

            function stop_modal() {
                self.scene.setModal(EconomicsModalMode.EconomicsModalNone);
                tool.popover('destroy');
                self.scene.event_selection_changed();
                self.scene.updateObjectsVisual();
            }

            var obj = self.scene.selected_objects[0];

            el = $(this);
            el.popover({
                content: (obj instanceof Economics.ModelEdge) ? self.edge_types_panel_content : self.node_types_panel_content,
                container: container,
                title: 'Change type',
                html: true,
                delay: {show: 500, hide: 100}
            }).popover('show');

            cont.find('.popover-title').append('<button id="economics-type-close" type="button" class="close">&times;</button>');

            $(container + ' #economics-type-close').click(function () {
                stop_modal();
            });

            $(container + ' .popover .btn').click(function () {
                var newType = self.typesMap[$(this).attr('id')];
                var command = [];
                self.scene.selected_objects.forEach(function (obj) {
                    if (obj.sc_type != newType) {
                        command.push(new EconomicsCommandChangeType(obj, newType));
                    }
                });
                self.scene.commandManager.execute(new EconomicsWrapperCommand(command));
                self.scene.updateObjectsVisual();
                stop_modal();
            });
        });


        this.toolSetContent().click(function () {
            var tool = $(this);

            function stop_modal() {
                self.scene.setModal(EconomicsModalMode.EconomicsModalNone);
                tool.popover('destroy');
                self.scene.updateObjectsVisual();
            }

            self.scene.setModal(EconomicsModalMode.EconomicsModalIdtf);
            $(this).popover({container: container});
            $(this).popover('show');

            var input = $(container + ' #economics-set-content-input');
            var input_content = $(container + " input#content[type='file']");
            var input_content_type = $(container + " #economics-set-content-type");
            input.val(self.scene.selected_objects[0].content);
            input_content_type.val(self.scene.selected_objects[0].contentType);
            setTimeout(function () {
                input.focus();
            }, 1);
            input.keypress(function (e) {
                if (e.keyCode == KeyCode.Enter || e.keyCode == KeyCode.Escape) {
                    if (e.keyCode == KeyCode.Enter) {
                        var obj = self.scene.selected_objects[0];
                        if (obj.content != input.val() || obj.contentType != input_content_type.val()) {
                            self.scene.commandManager.execute(new EconomicsCommandChangeContent(obj,
                                input.val(),
                                input_content_type.val()));
                        }
                    }
                    stop_modal();
                    e.preventDefault();
                }
            });
            // process controls
            $(container + ' #economics-set-content-apply').click(function () {
                var obj = self.scene.selected_objects[0];
                var file = input_content[0].files[0];
                if (file != undefined) {
                    var fileReader = new FileReader();
                    if (file.type === 'text/html') {
                        fileReader.onload = function () {
                            if (obj.content != this.result || obj.contentType != 'html') {
                                self.scene.commandManager.execute(new EconomicsCommandChangeContent(obj,
                                    this.result,
                                    'html'));
                            }
                            stop_modal();
                        };
                        fileReader.readAsText(file);
                    } else {
                        fileReader.onload = function () {
                            if (obj.content != this.result || obj.contentType != 'html') {
                                self.scene.commandManager.execute(new EconomicsCommandChangeContent(obj,
                                    '<img src="' + this.result + '" alt="Image">',
                                    'html'));
                            }
                            stop_modal();
                        };
                        fileReader.readAsDataURL(file);
                    }
                } else {
                    if (obj.content != input.val() || obj.contentType != input_content_type.val()) {
                        self.scene.commandManager.execute(new EconomicsCommandChangeContent(obj,
                            input.val(),
                            input_content_type.val()));
                    }
                    stop_modal();
                }
            });
            $(container + ' #economics-set-content-cancel').click(function () {
                stop_modal();
            });
        });

        this.toolDelete().click(function () {
            if (self.scene.selected_objects.length > 0) {
                self.scene.deleteObjects(self.scene.selected_objects.slice(0, self.scene.selected_objects.length));
                self.scene.clearSelection();
            }
        });

        this.toolClear().click(function () {
            self.scene.selectAll();
            self.toolDelete().click();
        });

        this.toolIntegrate().click(function () {
            // self._disableTool(self.toolIntegrate());
            // if (self.translateToSc)
            //     self.translateToSc(self.scene, function() {
            //         self._enableTool(self.toolIntegrate());
            //     });
            // TODO
        });

        this.toolZoomIn().click(function () {
            self.render.changeScale(1.1);
        });

        this.toolZoomOut().click(function () {
            self.render.changeScale(0.9);
        });

        // initial update
        self.onModalChanged();
        self.onSelectionChanged();
    },

    /**
     * Function that process selection changes in scene
     * It updated UI to current selection
     */
    onSelectionChanged: function () {
        if (this.canEdit) {
            this.hideTool(this.toolChangeIdtf());
            this.hideTool(this.toolSetContent());
            this.hideTool(this.toolChangeType());
            this.hideTool(this.toolDelete());
            if (this.scene.selected_objects.length > 1) {
                if (this.scene.isSelectedObjectAllArcsOrAllNodes() && !this.scene.isSelectedObjectAllHaveScAddr()) {

                }
            } else if (this.scene.selected_objects.length == 1 && !this.scene.selected_objects[0].sc_addr) {
                if (this.scene.selected_objects[0] instanceof Economics.ModelEdge) {

                } else if (this.scene.selected_objects[0] instanceof Economics.ModelLink) {
                    this.showTool(this.toolSetContent());
                }
            }
            if (this.scene.selected_objects.length > 0) this.showTool(this.toolDelete());
        }
    },


    /**
     * Function, that process modal state changes of scene
     */
    onModalChanged: function () {
        var self = this;

        function update_tool(tool) {
            if (self.scene.modal != EconomicsModalMode.EconomicsModalNone)
                self._disableTool(tool);
            else
                self._enableTool(tool);
        }

        update_tool(this.toolSelect());
        update_tool(this.toolEdge());
        update_tool(this.toolLink());
        update_tool(this.toolUndo());
        update_tool(this.toolRedo());
        update_tool(this.toolChangeIdtf());
        update_tool(this.toolChangeType());
        update_tool(this.toolSetContent());
        update_tool(this.toolDelete());
        update_tool(this.toolClear());
        update_tool(this.toolZoomIn());
        update_tool(this.toolZoomOut());
        update_tool(this.toolIntegrate());
    },

    collectIdtfs: function (keyword) {
        var self = this;
        var selected_obj = self.scene.selected_objects[0];
        var relative_objs = undefined;

        if (selected_obj instanceof Economics.ModelNode) {
            relative_objs = self.scene.nodes;
        }
        if (!relative_objs)
            return [];

        var match = function (text) {
            var pattern = new RegExp(keyword, 'i');
            if (text && pattern.test(text))
                return true;
            return false;
        }

        var contains = function (value, array) {
            var len = array.length;
            while (len--) {
                if (array[len].name === value.name)
                    return true
            }
            return false;
        }
        var matches = [];
        $.each(relative_objs, function (index, item) {
            if (match(item['text'])) {
                var obj = {
                    name: item['text'],
                    type: 'local'
                }
                if (!contains(obj, matches))
                    matches.push(obj);
            }

        });
        return matches;
    },

    /**
     * function(keyword, callback, args)
     * here is default implementation
     * */

    autocompletionVariants: function (keyword, callback, args) {
        var self = this;
        callback(self.collectIdtfs(keyword));
    },

    // -------------------------------- Helpers ------------------
    /**
     * Change specified tool state to disabled
     */
    _disableTool: function (tool) {
        tool.attr('disabled', 'disabled');
    },

    /**
     * Change specified tool state to enabled
     */
    _enableTool: function (tool) {
        tool.removeAttr('disabled');
    }
};
