var EconomicsEditMode = {
    EconomicsModeSelect: 0,
    EconomicsModeEdge: 1,
    EconomicsModeLink: 2,

    /**
     * Check if specified mode is valid
     */
    isValid: function (mode) {
        return (mode >= this.EconomicsModeSelect) && (mode <= this.EconomicsModeLink);
    }
};

var EconomicsModalMode = {
    EconomicsModalNone: 0,
    EconomicsModalIdtf: 1,
    EconomicsModalType: 2,
    EconomicsModalLegend: 3
};

var KeyCode = {
    Escape: 27,
    Enter: 13,
    Delete: 46,
    Key1: 49,
    Key2: 50,
    Key3: 51,
    Key4: 52,
    Key5: 53,
    KeyMinusFirefox: 173,
    KeyMinus: 189,
    KeyMinusNum: 109,
    KeyEqualFirefox: 61,
    KeyEqual: 187,
    KeyPlusNum: 107,
    A: 65,
    C: 67,
    I: 73,
    T: 84,
    Z: 90
};

var EconomicsTypeEdge = {
    Arrow: 1,
    Regulator: 2
};

Economics.Scene = function (options) {

    this.listener_array = [new EconomicsSelectListener(this),
        new EconomicsEdgeListener(this),
        new EconomicsLinkListener(this)];
    this.listener = this.listener_array[0];
    this.commandManager = new EconomicsCommandManager();
    this.render = options.render;
    this.edit = options.edit;
    this.links = [];
    this.edges = [];

    // this.actions = [];
    // this.procedures = [];
    // this.arrows = [];

    this.objects = Object.create(null);
    this.edit_mode = EconomicsEditMode.EconomicsModeSelect;

    // object, that placed under mouse
    this.pointed_object = null;
    // object, that was mouse pressed
    this.focused_object = null;

    // list of selected objects
    this.selected_objects = [];

    // drag line points
    this.drag_line_points = [];
    // points of selected line object
    this.line_points = [];

    // mouse position
    this.mouse_pos = new Economics.Vector3(0, 0, 0);

    // edge source and target
    this.edge_data = {source: null, target: null};

    // bus source
    this.bus_data = {source: null, end: null};

    // callback for selection changed
    this.event_selection_changed = null;
    // callback for modal state changes
    this.event_modal_changed = null;

    /* Flag to lock any edit operations
     * If this flag is true, then we doesn't need to process any editor operatons, because
     * in that moment shows modal dialog
     */
    this.modal = EconomicsModalMode.EconomicsModalNone;
};

Economics.Scene.prototype = {

    constructor: Economics.Scene,

    init: function () {
        this.layout_manager = new Economics.LayoutManager();
        this.layout_manager.init(this);
        EconomicsLegend.loadIdf();
    },

    appendLink: function (link) {
        this.links.push(link);
        link.scene = this;
    },

    appendEdge: function (edge) {
        this.edges.push(edge);
        edge.scene = this;
    },

    appendObject: function (obj) {
        if (obj instanceof Economics.ModelLink) {
            this.appendLink(obj);
        } else if (obj instanceof Economics.ModelEdge) {
            this.appendEdge(obj);
        }
    },

    /**
     * Remove object from scene.
     * @param {Economics.ModelObject} obj Object to remove
     */
    removeObject: function (obj) {
        var self = this;

        function remove_from_list(obj, list) {
            var idx = list.indexOf(obj);
            if (idx < 0) {
                EconomicsDebug.error("Can't find object for remove");
                return;
            }
            if (self.pointed_object == obj) {
                self.pointed_object = null;
            }
            list.splice(idx, 1);
        }

        if (obj instanceof Economics.ModelLink) {
            remove_from_list(obj, this.links);
        } else if (obj instanceof Economics.ModelEdge) {
            remove_from_list(obj, this.edges);
        }
    },

    // --------- objects destroy -------

    /**
     * Delete objects from scene
     * @param {Array} objects Array of sc.g-objects to delete
     */
    deleteObjects: function (objects) {
        var self = this;

        function collect_objects(container, root) {
            if (container.indexOf(root) >= 0)
                return;

            container.push(root);
            for (idx in root.edges) {
                if (self.edges.indexOf(root.edges[idx]) > -1) collect_objects(container, root.edges[idx]);
            }

        }

        // collect objects for remove
        var objs = [];

        // collect objects for deletion
        for (var idx in objects)
            collect_objects(objs, objects[idx]);

        this.commandManager.execute(new EconomicsCommandDeleteObjects(objs, this));

        this.updateRender();
    },

    /**
     * Updates render
     */
    updateRender: function () {
        this.render.update();
    },

    /**
     * Updates render objects state
     */
    updateObjectsVisual: function () {

        this.render.updateObjects();
    },

    // --------- layout --------
    layout: function () {
        this.layout_manager.doLayout();
        this.render.update();
    },

    onLayoutTick: function () {
    },

    /**
     * Returns size of container, where graph drawing
     */
    getContainerSize: function () {
        return this.render.getContainerSize();
    },

    /**
     * Return array that contains sc-addrs of all objects in scene
     */
    getScAddrs: function () {
        var keys = new Array();
        for (key in this.objects) {
            keys.push(key);
        }
        return keys;
    },

    getObjectByScAddr: function (addr) {
        var object = this.links.find(function (item) {
            return item.labelAddr == addr;
        });

        if (object) {
            return object;
        } else {
            var regulator = this.links.filter(function (object) {
                return object.type === EconomicsLayoutObjectType.ModelRegulator;
            });
            return regulator.find(function (item) {
                return item.addr == addr;
            });
        }
    },

    /**
     * Selection all object
     */
    selectAll: function () {
        var self = this;
        var allObjects = [this.edges, this.links];
        allObjects.forEach(function (setObjects) {
            setObjects.forEach(function (obj) {
                if (!obj.is_selected) {
                    self.selected_objects.push(obj);
                    obj._setSelected(true);
                }
            });
        });
        this.updateObjectsVisual();
        this._fireSelectionChanged();
    },

    /**
     * Append selection to object
     */
    appendSelection: function (obj) {
        if (obj.is_selected) {
            var idx = this.selected_objects.indexOf(obj);
            this.selected_objects.splice(idx, 1);
            obj._setSelected(false);
        } else {
            this.selected_objects.push(obj);
            obj._setSelected(true);
        }
        this.selectionChanged();
    },

    /**
     * Remove selection from object
     */
    removeSelection: function (obj) {

        var idx = this.selected_objects.indexOf(obj);

        if (idx == -1 || !obj.is_selected) {
            EconomicsDebug.error('Trying to remove selection from unselected object');
            return;
        }

        this.selected_objects.splice(idx, 1);
        obj._setSelected(false);

        this.selectionChanged();
    },

    /**
     * Clear selection list
     */
    clearSelection: function () {

        var need_event = this.selected_objects.length > 0;

        for (idx in this.selected_objects) {
            this.selected_objects[idx]._setSelected(false);
        }

        this.selected_objects.splice(0, this.selected_objects.length);

        if (need_event) this.selectionChanged();
    },

    selectionChanged: function () {
        this._fireSelectionChanged();

        this.line_points.splice(0, this.line_points.length);
        // if selected any of line objects, then create controls to control it
        if (this.selected_objects.length == 1) {
            var obj = this.selected_objects[0];

            if (obj instanceof Economics.ModelEdge) {
                for (idx in obj.points) {
                    this.line_points.push({pos: obj.points[idx], idx: idx});
                }
            }
        }

        this.updateObjectsVisual();
    },

    // -------- input processing -----------
    onMouseMove: function (x, y) {
        if (this.modal != EconomicsModalMode.EconomicsModalNone) return false; // do nothing
        else return this.listener.onMouseMove(x, y);
    },

    onMouseDown: function (x, y) {
        if (this.modal != EconomicsModalMode.EconomicsModalNone) return false; // do nothing
        else return this.listener.onMouseDown(x, y);
    },

    onMouseUp: function (x, y) {
        if (this.modal != EconomicsModalMode.EconomicsModalNone) return false; // do nothing
        if (!this.pointed_object) {
            this.clearSelection();
        }
        this.focused_object = null;
        return false;
    },

    onMouseDoubleClick: function (x, y) {
        if (this.modal != EconomicsModalMode.EconomicsModalNone) return false; // do nothing
        else this.listener.onMouseDoubleClick(x, y);
    },

    onMouseOverObject: function (obj) {
        if (this.modal != EconomicsModalMode.EconomicsModalNone) return false; // do nothing
        this.pointed_object = obj;
    },

    onMouseOutObject: function (obj) {
        if (this.modal != EconomicsModalMode.EconomicsModalNone) return false; // do nothing
        this.pointed_object = null;
    },

    onMouseDownObject: function (obj) {
        if (this.modal != EconomicsModalMode.EconomicsModalNone) return false; // do nothing
        else this.listener.onMouseDownObject(obj);
    },

    onMouseUpObject: function (obj) {
        return this.listener.onMouseUpObject(obj);
    },

    onKeyDown: function (event) {
        if (this.modal == EconomicsModalMode.EconomicsModalNone && !$("#search-input").is(":focus")) {
            if ((event.which == KeyCode.Z) && event.ctrlKey && event.shiftKey) {
                this.commandManager.redo();
                this.updateRender();
            } else if (event.ctrlKey && (event.which == KeyCode.Z)) {
                this.commandManager.undo();
                this.updateRender();
            } else if ((event.which == KeyCode.A) && event.ctrlKey) {
                this.selectAll();
            } else if (event.which == KeyCode.Key1) {
                this.edit.toolSelect().click()
            } else if (event.which == KeyCode.Key2) {
                this.edit.toolEdge().click()
            } else if (event.which == KeyCode.Key3) {
                this.edit.toolLink().click()
            } else if (event.which == KeyCode.Delete) {
                this.edit.toolDelete().click();
            } else if (event.which == KeyCode.I) {
                if (!this.edit.toolChangeIdtf().hasClass("hidden"))
                    this.edit.toolChangeIdtf().click();
            } else if (event.which == KeyCode.C) {
                if (!this.edit.toolSetContent().hasClass("hidden"))
                    this.edit.toolSetContent().click();
            } else if (event.which == KeyCode.T) {
                if (!this.edit.toolChangeType().hasClass("hidden"))
                    this.edit.toolChangeType().click();
            } else if (event.which == KeyCode.KeyMinusFirefox || event.which == KeyCode.KeyMinus ||
                event.which == KeyCode.KeyMinusNum) {
                this.edit.toolZoomOut().click();
            } else if (event.which == KeyCode.KeyEqualFirefox || event.which == KeyCode.KeyEqual ||
                event.which == KeyCode.KeyPlusNum) {
                this.edit.toolZoomIn().click();
            } else {
                this.listener.onKeyDown(event);
            }
        }
        return false;
    },

    onKeyUp: function (event) {
        if (this.modal == EconomicsModalMode.EconomicsModalNone && !$("#search-input").is(":focus")) {
            this.listener.onKeyUp(event);
        }
        return false;
    },

    // -------- edit --------------
    /**
     * Setup new edit mode for scene. Calls from user interface
     * @param {EconomicsEditMode} mode New edit mode
     */
    setEditMode: function (mode) {

        if (this.edit_mode == mode) return; // do nothing

        this.edit_mode = mode;
        this.listener = this.listener_array[mode];

        this.focused_object = null;
        this.edge_data.source = null;
        this.edge_data.target = null;

        this.bus_data.source = null;

        this.resetEdgeMode();
    },

    /**
     * Changes modal state of scene. Just for internal usage
     */
    setModal: function (value) {
        this.modal = value;
        this._fireModalChanged();
    },

    /**
     * Reset edge creation mode state
     */
    resetEdgeMode: function () {
        this.drag_line_points.splice(0, this.drag_line_points.length);
        this.render.updateDragLine();

        this.edge_data.source = this.edge_data.target = null;
    },

    /**
     * Revert drag line to specified point. All drag point with index >= idx will be removed
     * @param {Integer} idx Index of drag point to revert.
     */
    revertDragPoint: function (idx) {

        if (this.edit_mode != EconomicsEditMode.EconomicsModeEdge) {
            EconomicsDebug.error('Work with drag point in incorrect edit mode');
            return;
        }

        this.drag_line_points.splice(idx, this.drag_line_points.length - idx);

        if (this.drag_line_points.length >= 2)
            this.bus_data.end = this.drag_line_points[this.drag_line_points.length - 1];
        else
            this.bus_data.end = null;

        if (this.drag_line_points.length == 0) {
            this.edge_data.source = this.edge_data.target = null;
            this.bus_data.source = null;
        }
        this.render.updateDragLine();
    },

    /**
     * Update selected line point position
     */
    setLinePointPos: function (idx, pos) {
        if (this.selected_objects.length != 1) {
            EconomicsDebug.error('Invalid state. Trying to update line point position, when there are no selected objects');
            return;
        }

        var edge = this.selected_objects[0];
        if (!(edge instanceof Economics.ModelEdge)) {
            EconomicsDebug.error("Unknown type of selected object");
            return;
        }

        if (edge.points.length <= idx) {
            EconomicsDebug.error('Invalid index of line point');
            return;
        }
        edge.points[idx].x = pos.x;
        edge.points[idx].y = pos.y;

        edge.requestUpdate();
        edge.need_update = true;
        edge.need_observer_sync = true;

        this.updateObjectsVisual();
    },

    // ------------- events -------------
    _fireSelectionChanged: function () {
        if (this.event_selection_changed)
            this.event_selection_changed();
    },

    _fireModalChanged: function () {
        if (this.event_modal_changed)
            this.event_modal_changed();
    },

    isSelectedObjectAllArcsOrAllNodes: function () {
        var objects = this.selected_objects;
        var typeMask = objects[0].sc_type & sc_type_arc_mask ? sc_type_arc_mask :
            objects[0].sc_type & sc_type_node ?
                sc_type_node : 0;
        return (objects.every(function (obj) {
            return (obj.sc_type & typeMask);
        }))
    },

    isSelectedObjectAllHaveScAddr: function () {
        return (this.selected_objects.some(function (obj) {
            return obj.sc_addr;
        }))
    }
};
