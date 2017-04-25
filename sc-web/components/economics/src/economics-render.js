Economics.Render = function () {
    this.scene = null;
};

Economics.Render.prototype = {

    init: function (params) {
        this.containerId = params.containerId;
        this.sandbox = params.sandbox;

        this.linkBorderWidth = 5;
        this.scale = 1;
        this.translate = [0, 0];
        this.translate_started = false;

        // disable tooltips
        $('#' + this.containerId).parent().addClass('ui-no-tooltip');

        var economicsViewer = $('#economics-viewer');
        this.d3_drawer = d3.select('#' + this.containerId)
            .append("svg:svg")
            .attr("pointer-events", "all")
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("class", "EconomicsSvg")
            .on('mousemove', function () {
                self.onMouseMove(this, self);
            })
            .on('mousedown', function () {
                self.onMouseDown(this, self)
            })
            .on('mouseup', function () {
                self.onMouseUp(this, self);
            })
            .on('dblclick', function () {
                self.onMouseDoubleClick(this, self);
            });

        this.scale = 1;
        var self = this;
        this.d3_container = this.d3_drawer.append('svg:g')
            .attr("class", "EconomicsSvg");

        this.initDefs();

        /* this.d3_container.append('svg:rect')
         .style("fill", "url(#backGrad)")
         .attr('width', '10000') //parseInt(this.d3_drawer.style("width")))
         .attr('height', '10000');//parseInt(this.d3_drawer.style("height")));
         */

        this.d3_drag_line = this.d3_container.append('svg:path')
                .attr('class', 'dragline hidden')
                .attr('d', 'M0,0L0,0');

        this.d3_accept_point = this.d3_container.append('svg:use')
            .attr('class', 'EconomicsAcceptPoint hidden')
            .attr('xlink:href', '#acceptPoint')
            .on('mouseover', function (d) {
                d3.select(this).classed('EconomicsAcceptPointHighlighted', true);
            })
            .on('mouseout', function (d) {
                d3.select(this).classed('EconomicsAcceptPointHighlighted', false);
            })
            .on('mousedown', function (d) {
                self.scene.listener.finishCreation();
                d3.event.stopPropagation();
            });
        this.d3_edges = this.d3_container.append('svg:g').selectAll('path');
        this.d3_links = this.d3_container.append('svg:g').selectAll('g');
        this.d3_actions = this.d3_container.append('svg:g').selectAll('g');
        this.d3_procedures = this.d3_container.append('svg:g').selectAll('g');
        this.d3_regulators = this.d3_container.append('svg:g').selectAll('g');
        this.d3_dragline = this.d3_container.append('svg:g');
        this.d3_line_points = this.d3_container.append('svg:g');

        this.line_point_idx = -1;
    },

    // -------------- Definitions --------------------
    initDefs: function () {
        // define arrow markers for graph links
        var defs = this.d3_drawer.append('svg:defs')

        EconomicsAlphabet.initSvgDefs(defs, this.containerId);

        var grad = defs.append('svg:radialGradient')
            .attr('id', 'backGrad')
            .attr('cx', '50%')
            .attr('cy', '50%')
            .attr('r', '100%').attr("spreadMethod", "pad");

        grad.append('svg:stop')
            .attr('offset', '0%')
            .attr('stop-color', 'rgb(255,253,252)')
            .attr('stop-opacity', '1')
        grad.append('svg:stop')
            .attr('offset', '100%')
            .attr('stop-color', 'rgb(245,245,245)')
            .attr('stop-opacity', '1')

        // line point control
        var p = defs.append('svg:g')
            .attr('id', 'linePoint')
        p.append('svg:circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 10);

        p = defs.append('svg:g')
            .attr('id', 'acceptPoint')
        p.append('svg:circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 10)
        p.append('svg:path')
            .attr('d', 'M-5,-5 L0,5 5,-5');
        p = defs.append('svg:g')
            .attr('id', 'removePoint')
        p.append('svg:circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 10)

        p.append('svg:path')
            .attr('d', 'M-5,-5L5,5M-5,5L5,-5');
    },

    classState: function (obj, base) {

        var res = 'sc-no-default-cmd ui-no-tooltip EconomicsElement';

        if (base)
            res += ' ' + base;

        if (obj.is_selected)
            res += ' EconomicsStateSelected';

        if (obj.is_highlighted)
            res += ' EconomicsStateHighlighted ';

        switch (obj.state) {
            case EconomicsObjectState.FromMemory:
                res += ' EconomicsStateFromMemory';
                break;
            case EconomicsObjectState.MergedWithMemory:
                res += ' EconomicsStateMergedWithMemory';
                break;
            case EconomicsObjectState.NewInMemory:
                res += ' EconomicsStateNewInMemory';
                break;
            default:
                res += ' EconomicsStateNormal';
        }
        ;

        return res;
    },

    classToogle: function (o, cl, flag) {

        var item = d3.select(o);
        var str = item.attr("class");
        var res = str ? str.replace(cl, '') : '';
        res = res.replace('  ', ' ');
        if (flag)
            res += ' ' + cl;
        item.attr("class", res);
    },

    // -------------- draw -----------------------
    update: function () {

        var self = this;

        function eventsWrap(selector) {
            selector.on('mouseover', function (d) {
                self.classToogle(this, 'EconomicsStateHighlighted', true);
                if (self.scene.onMouseOverObject(d))
                    d3.event.stopPropagation();
                })
                .on('mouseout', function (d) {
                    self.classToogle(this, 'EconomicsStateHighlighted', false);
                    if (self.scene.onMouseOutObject(d))
                        d3.event.stopPropagation();
                })
                .on('mousedown', function (d) {
                    self.scene.onMouseDownObject(d);
                    if (d3.event.stopPropagation())
                        d3.event.stopPropagation();
                })
                .on('mouseup', function (d) {
                    self.scene.onMouseUpObject(d);
                    if (d3.event.stopPropagation())
                        d3.event.stopPropagation();
                })
        };

        var links = this.scene.links.filter(function (object) {
            return !object.type;
        });

        // add links that haven't visual
        this.d3_links = this.d3_links.data(links, function (d) {
            return d.id;
        });

        g = this.d3_links.enter().append('svg:g')
            .attr("transform", function (d) {
                return 'translate(' + d.position.x + ', ' + d.position.y + ')';
            });
        g.append('svg:rect')
            .attr('class', function (d) {
                return self.classState(d, 'EconomicsLink');
            })
            .attr('class', 'sc-no-default-cmd ui-no-tooltip');

        g.append('svg:foreignObject')
            .attr('transform', 'translate(' + self.linkBorderWidth * 0.5 + ',' + self.linkBorderWidth * 0.5 + ')')
            .attr("width", "100%")
            .attr("height", "100%")
            .append("xhtml:link_body")
            .style("background", "transparent")
            .style("margin", "0 0 0 0")
            .html(function (d) {
                return '<div id="link_' + self.containerId + '_' + d.id + '" class=\"EconomicsLinkContainer\"><div id="' + d.containerId + '" style="display: inline-block;" class="impl"></div></div>';
            });

        eventsWrap(g);

        this.d3_links.exit().remove();

        var regulator = this.scene.links.filter(function (object) {
            return object.type === EconomicsLayoutObjectType.ModelRegulator;
        });


        this.d3_regulators = this.d3_regulators.data(regulator, function (d) {
            return d.id;
        });

        g = this.d3_regulators.enter().append('svg:g')
            .attr("transform", function (d) {
                return 'translate(' + d.position.x + ', ' + d.position.y + ')';
            });
        g.append('svg:rect')
            .attr('class', function (d) {
                return self.classState(d, 'EconomicsLink');
            })
            .attr('class', 'sc-no-default-cmd ui-no-tooltip')
            .style('fill','rgb(255,255,255)');

        g.append('svg:foreignObject')
            .attr('transform', 'translate(' + self.linkBorderWidth * 0.5 + ',' + self.linkBorderWidth * 0.5 + ')')
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("sc_addr", function (d) {
                return d.addr;
            })
            .attr('class', function () {
                return "sc-no-default-cmd ui-no-tooltip";
            })
            .append("xhtml:link_body")
            .style("background", "transparent")
            .style("margin", "0 0 0 0")
            .html(function (d) {
                var id = 'regulator_' + self.containerId + '_' + d.id;
                return '<div style="vertical-align: middle;" id="' + id + '" sc_addr="' + d.addr + '" class=\"EconomicsProcedure sc-no-default-cmd ui-no-tooltip \"><div id="' + id + '_text" style="display: inline-block;" sc_addr="' + d.addr + '" class="impl sc-no-default-cmd ui-no-tooltip "></div></div>';
            });

        eventsWrap(g);

        this.d3_regulators.exit().remove();


        var actions = this.scene.links.filter(function (object) {
            return object.type === EconomicsLayoutObjectType.ModelAction;
        });

        this.d3_actions = this.d3_actions.data(actions, function (d) {
            return d.id;
        });

        g = this.d3_actions.enter().append('svg:g')
            .attr("transform", function (d) {
                return 'translate(' + d.position.x + ', ' + d.position.y + ')';
            });
        g.append('svg:circle')
            .attr('class', function (d) {
                return self.classState(d, 'EconomicsLink');
            })
            .attr('class', 'sc-no-default-cmd ui-no-tooltip')
            .style('fill','rgb(204,218,169)');

        g.append('svg:foreignObject')
            .attr('transform', 'translate(' + self.linkBorderWidth * 0.5 + ',' + self.linkBorderWidth * 0.5 + ')')
            .attr("width", "100%")
            .attr("height", "100%")
            .append("xhtml:link_body")
            .style("background", "transparent")
            .style("margin", "0 0 0 0")
            .html(function (d) {
                var id = 'action_' + self.containerId + '_' + d.id;
                return '<div id="' + id + '" sc_addr="' + d.addr + '" class=\"EconomicsAction sc-no-default-cmd ui-no-tooltip \"><div id="' + id + '_text" style="display: inline-block;" sc_addr="' + d.addr + '" class="impl sc-no-default-cmd ui-no-tooltip "></div></div>';
            });


        eventsWrap(g);

        this.d3_actions.exit().remove();

        var procedures = this.scene.links.filter(function (object) {
            return object.type === EconomicsLayoutObjectType.ModelProcedure;
        });

        this.d3_procedures = this.d3_procedures.data(procedures, function (d) {
            return d.id;
        });

        g = this.d3_procedures.enter().append('svg:g')
            .attr("transform", function (d) {
                return 'translate(' + d.position.x + ', ' + d.position.y + ')';
            });
        g.append('svg:rect')
            .attr('class', function (d) {
                return self.classState(d, 'EconomicsLink');
            })
            .attr('class', 'sc-no-default-cmd ui-no-tooltip')
            .style('fill','rgb(149,174,206)');

        g.append('svg:line')
            .attr('class', "firstLine");

        g.append('svg:line')
            .attr('class', "secondLine");


        g.append('svg:foreignObject')
            .attr('transform', 'translate(' + self.linkBorderWidth * 0.5 + ',' + self.linkBorderWidth * 0.5 + ')')
            .attr("width", "100%")
            .attr("height", "100%")
            .attr("sc_addr", function (d) {
                return d.addr;
            })
            .attr('class', function () {
                return "sc-no-default-cmd ui-no-tooltip";
            })
            .append("xhtml:link_body")
            .style("background", "transparent")
            .style("margin", "0 0 0 0")
            .html(function (d) {
                var id = 'procedure_' + self.containerId + '_' + d.id;
                return '<div style="vertical-align: middle;" id="' + id + '" sc_addr="' + d.addr + '" class=\"EconomicsProcedure sc-no-default-cmd ui-no-tooltip \"><div id="' + id + '_text" style="display: inline-block;" sc_addr="' + d.addr + '" class="impl sc-no-default-cmd ui-no-tooltip "></div></div>';
            });


        eventsWrap(g);

        this.d3_procedures.exit().remove();

        // update edges visual
        this.d3_edges = this.d3_edges.data(this.scene.edges, function (d) {
            return d.id;
        });

        // add edges that haven't visual
        g = this.d3_edges.enter().append('svg:g')
            .attr('class', function (d) {
                return self.classState(d, 'EconomicsEdge');
            })
            .attr('pointer-events', 'visibleStroke');

        eventsWrap(g);

        this.d3_edges.exit().remove();

        this.updateObjects();
    },


    // -------------- update objects --------------------------
    updateObjects: function () {

        var self = this;

        this.d3_links.each(function (d) {

            if (!d.need_observer_sync && d.contentLoaded) return; // do nothing

            if (!d.contentLoaded) {
                var links = {};
                links[d.containerId] = d.sc_addr;
                self.sandbox.createViewersForScLinks(links);

                d.contentLoaded = true;
            }
            else
                d.need_observer_sync = false;

            var linkDiv = $(document.getElementById("link_" + self.containerId + "_" + d.id));
            if (!d.sc_addr) {
                linkDiv.find('.impl').html(d.content);
            } else {
                if (d.content != "") {
                    linkDiv.find('.impl').html(d.content);
                } else {
                    d.content = linkDiv.find('.impl').html();
                    if (d.content != "") {
                        d.setAutoType();
                    }
                }
            }

            var g = d3.select(this)

            g.select('rect')
                .attr('width', function (d) {
                    d.scale.x = Math.min(linkDiv.find('.impl').outerWidth(), 450) + 10;
                    return d.scale.x + self.linkBorderWidth;
                })
                .attr('height', function (d) {
                    d.scale.y = Math.min(linkDiv.outerHeight(), 350);
                    return d.scale.y + self.linkBorderWidth;
                })
                .attr('class', function (d) {
                    return self.classState(d, 'EconomicsLink');
                }).attr("sc_addr", function (d) {
                return d.sc_addr;
            });

            g.selectAll(function () {
                return this.getElementsByTagName("foreignObject");
            })
                .attr('width', function (d) {
                    return d.scale.x;
                })
                .attr('height', function (d) {

                    return d.scale.y;
                });

            g.attr("transform", function (d) {
                return 'translate(' + (d.position.x - (d.scale.x + self.linkBorderWidth) * 0.5) + ', ' + (d.position.y - (d.scale.y + self.linkBorderWidth) * 0.5) + ')';
            });

        });

        this.d3_regulators.each(function (d) {

            if (!d.need_observer_sync && d.contentLoaded) return; // do nothing

            var linkDiv = $(document.getElementById("regulator_" + self.containerId + "_" + d.id + "_text"));

            linkDiv.html(d.content);

            var g = d3.select(this);

            var width;
            var height;
            var offset = 15;

            g.select('rect')
                .attr('width', function (d) {
                    width = Math.min(linkDiv.outerWidth(), 300) + offset* 2;
                    width = Math.max(width, 120);
                    d.scale.x = width;
                    return d.scale.x ;
                })
                .attr('height', function (d) {
                    height = Math.min(linkDiv.outerHeight(), 200) + 10;
                    height = Math.max(height, 40);
                    d.scale.y = height;
                    return d.scale.y ;
                })
                .attr('rx',  height/2)
                .attr('class', function (d) {
                    return self.classState(d, 'EconomicsLink');
                })
                .attr("sc_addr", function (d) {
                    return d.addr;
                });

            g.selectAll(function () {
                return this.getElementsByTagName("foreignObject");
            })
                .attr('width', function (d) {
                    return d.scale.x;
                })
                .attr('height', function (d) {

                    return d.scale.y;
                });

            g.attr("transform", function (d) {
                return 'translate(' + (d.position.x - (d.scale.x + self.linkBorderWidth) * 0.5) + ', ' + (d.position.y - (d.scale.y + self.linkBorderWidth) * 0.5) + ')';
            });

        });

        this.d3_actions.each(function (d) {

            if (!d.need_observer_sync && d.contentLoaded) return; // do nothing

            var linkDiv = $(document.getElementById("action_" + self.containerId + "_" + d.id + "_text"));

            linkDiv.html(d.content);

            var g = d3.select(this);

            var radius;
            var offset = 19;

            g.select('circle')
                .attr('r', function (d) {
                    radius=linkDiv.outerHeight()/2+ offset* 2;
                    d.scale.y=radius;
                    d.scale.x=radius;
                    return radius;
                })
                .attr('cx', function (d) {
                    return d.scale.x;
                })
                .attr('cy', function (d) {
                    return d.scale.y;
                })
                .attr('class', function (d) {
                    return self.classState(d, 'EconomicsLink');
                })
                .attr("sc_addr", function (d) {
                return d.addr;
            });

            g.selectAll(function () {
                return this.getElementsByTagName("foreignObject");
            })
                .attr('width', function (d) {
                    return d.scale.x+(radius)/2+15;
                })
                .attr('height', function (d) {
                    return d.scale.y+radius;
                });

            g.attr("transform", function (d) {
                return 'translate(' + (d.position.x - (d.scale.x + self.linkBorderWidth) * 0.5) + ', ' + (d.position.y - (d.scale.y + self.linkBorderWidth) * 0.5) + ')';
            });

        });

        this.d3_procedures.each(function (d) {

            if (!d.need_observer_sync && d.contentLoaded) return; // do nothing

            var linkDiv = $(document.getElementById("procedure_" + self.containerId + "_" + d.id + "_text"));

            linkDiv.html(d.content);

            var g = d3.select(this);

            var width;
            var height;
            var offset = 15;

            g.select('rect')
                .attr('width', function (d) {
                    width = Math.min(linkDiv.outerWidth(), 300) + offset* 2;
                    width = Math.max(width, 120);
                    d.scale.x = width;
                    return d.scale.x ;
                })
                .attr('height', function (d) {
                    height = Math.min(linkDiv.outerHeight(), 200) + 10;
                    height = Math.max(height, 80);
                    d.scale.y = height;
                    return d.scale.y ;
                })
                .attr('class', function (d) {
                    return self.classState(d, 'EconomicsLink');
                })
                .attr("sc_addr", function (d) {
                return d.addr;
                });

            g.select('.firstLine')
                .attr('x1', function (d) {
                    return d.scale.x - offset;
                })
                .attr('x2', function (d) {
                    return d.scale.x - offset;
                })
                .attr('y1', function (d) {
                    return d.scale.y;
                })
                .attr('y2', function (d) {
                    return d.scale.y - height;
                })
                .style("stroke", "rgb(0,0,0)");

            g.select('.secondLine')
                .attr('x1', function (d) {
                    return d.scale.x - width + offset;
                })
                .attr('x2', function (d) {
                    return d.scale.x - width + offset;
                })
                .attr('y1', function (d) {
                    return d.scale.y;
                })
                .attr('y2', function (d) {
                    return d.scale.y - height;
                })
                .style("stroke", "rgb(0,0,0)");


            g.selectAll(function () {
                return this.getElementsByTagName("foreignObject");
            })
                .attr('width', function (d) {
                    return d.scale.x;
                })
                .attr('height', function (d) {

                    return d.scale.y;
                });

            g.attr("transform", function (d) {
                return 'translate(' + (d.position.x - (d.scale.x + self.linkBorderWidth) * 0.5) + ', ' + (d.position.y - (d.scale.y + self.linkBorderWidth) * 0.5) + ')';
            });

        });

        this.d3_edges.each(function (d) {

            if (!d.need_observer_sync) return; // do nothing
            d.need_observer_sync = false;

            if (d.need_update)
                d.update();
            var d3_edge = d3.select(this);
            EconomicsAlphabet.updateEdge(d, d3_edge, self.containerId);
            d3_edge.attr('class', function (d) {
                return self.classState(d, 'EconomicsEdge');
            })
                .attr("sc_addr", function (d) {
                    return d.sc_addr;
                });
        });

        this.updateLinePoints();
    },

    updateTexts: function () {
        this.d3_nodes.select('text').text(function (d) {
            return d.text;
        });
    },

    requestUpdateAll: function () {
        this.d3_links.each(function (d) {
            d.need_observer_sync = true;
        });
        this.d3_edges.each(function (d) {
            d.need_observer_sync = true;
            d.need_update = true;
        });
        this.update();
    },

    updateDragLine: function () {
        var self = this;

        this.d3_drag_line.classed('dragline', true);

        // remove old points
        drag_line_points = this.d3_dragline.selectAll('use.EconomicsRemovePoint');
        points = drag_line_points.data(this.scene.drag_line_points, function (d) {
            return d.idx;
        })
        points.exit().remove();

        points.enter().append('svg:use')
            .attr('class', 'EconomicsRemovePoint')
            .attr('xlink:href', '#removePoint')
            .attr('transform', function (d) {
                return 'translate(' + d.x + ',' + d.y + ')';
            })
            .on('mouseover', function (d) {
                d3.select(this).classed('EconomicsRemovePointHighlighted', true);
            })
            .on('mouseout', function (d) {
                d3.select(this).classed('EconomicsRemovePointHighlighted', false);
            })
            .on('mousedown', function (d) {
                self.scene.revertDragPoint(d.idx);
                d3.event.stopPropagation();
            });



        this.d3_accept_point.classed('hidden', true);

        if (this.scene.drag_line_points.length < 1) {
            this.d3_drag_line.classed('hidden', true);
        } else {

            this.d3_drag_line.classed('hidden', false);

            var d_str = '';
            // create path description
            for (idx in this.scene.drag_line_points) {
                var pt = this.scene.drag_line_points[idx];

                if (idx == 0)
                    d_str += 'M';
                else
                    d_str += 'L';
                d_str += pt.x + ',' + pt.y;
            }

            d_str += 'L' + this.scene.mouse_pos.x + ',' + this.scene.mouse_pos.y;

            // update drag line
            this.d3_drag_line.attr('d', d_str);
        }
    },

    updateLinePoints: function () {
        var self = this;
        var oldPoints;

        line_points = this.d3_line_points.selectAll('use');
        points = line_points.data(this.scene.line_points, function (d) {
            return d.idx;
        })
        points.exit().remove();

        if (this.scene.line_points.length == 0)
            this.line_points_idx = -1;

        points.enter().append('svg:use')
            .classed('EconomicsLinePoint', true)
            .attr('xlink:href', '#linePoint')
            .attr('transform', function (d) {
                return 'translate(' + d.pos.x + ',' + d.pos.y + ')';
            })
            .on('mouseover', function (d) {
                d3.select(this).classed('EconomicsLinePointHighlighted', true);
            })
            .on('mouseout', function (d) {
                d3.select(this).classed('EconomicsLinePointHighlighted', false);
            })
            .on('mousedown', function (d) {
                if (self.line_point_idx < 0) {
                    oldPoints = $.map(self.scene.selected_objects[0].points, function (vertex) {
                        return $.extend({}, vertex);
                    });
                    self.line_point_idx = d.idx;
                } else {
                    var newPoints = $.map(self.scene.selected_objects[0].points, function (vertex) {
                        return $.extend({}, vertex);
                    });
                    self.scene.commandManager.execute(new EconomicsCommandMovePoint(self.scene.selected_objects[0],
                        oldPoints,
                        newPoints,
                        self.scene),
                        true);
                    self.line_point_idx = -1;
                }
            })
            .on('dblclick', function (d) {
                self.line_point_idx = -1;
            });
        /*.on('mouseup', function(d) {
         self.scene.pointed_object = null;
         });*/

        line_points.each(function (d) {
            d3.select(this).attr('transform', function (d) {
                return 'translate(' + d.pos.x + ',' + d.pos.y + ')';
            });
        });
    },

    _changeContainerTransform: function (translate, scale) {
        this.d3_container.attr("transform", "translate(" + this.translate + ")scale(" + this.scale + ")");
    },

    changeScale: function (mult) {
        if (mult === 0)
            throw "Invalid scale multiplier";

        this.scale *= mult;
        var scale = Math.max(2, Math.min(0.1, this.scale));
        this._changeContainerTransform();
    },

    changeTranslate: function (delta) {

        this.translate[0] += delta[0] * this.scale;
        this.translate[1] += delta[1] * this.scale;

        this._changeContainerTransform();
    },

    // --------------- Events --------------------
    _correctPoint: function (p) {
        p[0] -= this.translate[0];
        p[1] -= this.translate[1];

        p[0] /= this.scale;
        p[1] /= this.scale;
        return p;
    },

    onMouseDown: function (window, render) {
        var point = this._correctPoint(d3.mouse(window));
        if (render.scene.onMouseDown(point[0], point[1]))
            return;

        this.translate_started = true;
    },

    onMouseUp: function (window, render) {

        if (this.translate_started) {
            this.translate_started = false;
            return;
        }

        var point = this._correctPoint(d3.mouse(window));

        if (this.line_point_idx >= 0) {
            this.line_point_idx = -1;
            d3.event.stopPropagation();
            return;
        }

        if (render.scene.onMouseUp(point[0], point[1]))
            d3.event.stopPropagation();
    },

    onMouseMove: function (window, render) {

        if (this.translate_started)
            this.changeTranslate([d3.event.movementX, d3.event.movementY]);

        var point = this._correctPoint(d3.mouse(window));

        if (this.line_point_idx >= 0) {
            this.scene.setLinePointPos(this.line_point_idx, {x: point[0], y: point[1]});
            d3.event.stopPropagation();
        }

        if (render.scene.onMouseMove(point[0], point[1]))
            d3.event.stopPropagation();
    },

    onMouseDoubleClick: function (window, render) {
        var point = this._correctPoint(d3.mouse(window));
        if (this.scene.onMouseDoubleClick(point[0], point[1]))
            d3.event.stopPropagation();
    },

    onKeyDown: function (event) {
        // do not send event to other listeners, if it processed in scene
        if (this.scene.onKeyDown(event))
            d3.event.stopPropagation();
    },

    onKeyUp: function (event) {
        // do not send event to other listeners, if it processed in scene
        if (this.scene.onKeyUp(event))
            d3.event.stopPropagation();
    },

    // ------- help functions -----------
    getContainerSize: function () {
        var el = document.getElementById(this.containerId);
        return [el.clientWidth, el.clientHeight];
    }

};
