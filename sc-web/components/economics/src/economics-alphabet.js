var EconomicsAlphabet = {
    
    scType2Str: {},
    
    /**
     * Initialize all definitions, for svg drawer
     */
    initSvgDefs: function(defs, containerId) {
        
        this.initTypesMapping();
        
        // edge markers
        defs.append('svg:marker')
            .attr('id', 'end-arrow-access_' + containerId).attr('viewBox', '0 -5 10 10').attr('refX', 0)
            .attr('markerWidth', 5).attr('markerHeight', 10).attr('orient', 'auto')
          .append('svg:path')
            .attr('d', 'M0,-4L10,0L0,4').attr('fill', '#000');
            
        defs.append('svg:marker')
            .attr('id', 'end-arrow-common_' + containerId).attr('viewBox', '0 -5 10 10').attr('refX', 0)
            .attr('markerWidth', 1.5).attr('markerHeight', 6).attr('orient', 'auto')
          .append('svg:path')
            .attr('d', 'M0,-4L10,0L0,4').attr('fill', '#000');
            
        // nodes
        defs.append('svg:circle').attr('id', 'economics.node.const.outer').attr('cx', '0').attr('cy', '0').attr('r', '10');
        defs.append('svg:rect').attr('id', 'economics.node.var.outer').attr('x', '-10').attr('y', '-10').attr('width', '20').attr('height', '20');
            
        defs.append('svg:clip-path')
            .attr('id', 'economics.node.const.clip')
            .append('svg:use')
                .attr('xlink:href', '#economics.node.const.clip');
        
        defs.append('svg:clip-path')
            .attr('id', 'economics.node.var.clip')
            .append('svg:use')
                .attr('xlink:href', '#economics.node.var.clip');
                
                
        //  ----- define constant nodes -----      
        var g = defs.append('svg:g').attr('id', 'economics.node');
        g.append('svg:circle').attr('cx', '0').attr('cy', '0').attr('r', '5');
        g.append('svg:text').attr('x', '7').attr('y', '15').attr('class', 'EconomicsText');
        
        g = defs.append('svg:g').attr('id', 'economics.node.const');
        g.append('svg:use').attr('xlink:href', '#economics.node.const.outer');
        this.appendText(g);
        
        g = defs.append('svg:g').attr('id', 'economics.node.const.tuple');
        g.append('svg:use').attr('xlink:href', '#economics.node.const.outer');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3');
        this.appendText(g);
        
        g = defs.append('svg:g').attr('id', 'economics.node.const.struct');
        g.append('svg:use').attr('xlink:href', '#economics.node.const.outer');
        g.append('svg:circle').attr('cx', '0').attr('cy', '0').attr('r', '3').attr('stroke', 'none').attr('fill', '#000');
        this.appendText(g);
        
        g = defs.append('svg:g').attr('id', 'economics.node.const.role');
        g.append('svg:use').attr('xlink:href', '#economics.node.const.outer');
        g.append('svg:line').attr('x1', '0').attr('x2', '0').attr('y1', '-10').attr('y2', '10').attr('stroke-width', '3');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3');
        this.appendText(g);
        
        g = defs.append('svg:g').attr('id', 'economics.node.const.norole');
        g.append('svg:use').attr('xlink:href', '#economics.node.const.outer');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3').attr('transform', 'rotate(45, 0, 0)');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3').attr('transform', 'rotate(-45, 0, 0)');
        this.appendText(g);
        
        g = defs.append('svg:g').attr('id', 'economics.node.const.class');
        g.append('svg:use').attr('xlink:href', '#economics.node.const.outer');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3').attr('transform', 'rotate(45, 0, 0)');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3').attr('transform', 'rotate(-45, 0, 0)');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3');
        this.appendText(g);
        
        g = defs.append('svg:g').attr('id', 'economics.node.const.abstract');//.attr('clip-path', 'url(#economics.node.const.clip)');
        g.append('svg:use').attr('xlink:href', '#economics.node.const.outer');
        var g2 = g.append('svg:g').attr('stroke-width', '1');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '-6').attr('y2', '-6');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '-3').attr('y2', '-3');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '3').attr('y2', '3');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '6').attr('y2', '6');
        this.appendText(g);
        
        g = defs.append('svg:g').attr('id', 'economics.node.const.material');//.attr('clip-path', 'url(#economics.node.const.clip)');
        g.append('svg:use').attr('xlink:href', '#economics.node.const.outer');
        var g2 = g.append('svg:g').attr('stroke-width', '1').attr('transform', 'rotate(-45, 0, 0)');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '-6').attr('y2', '-6');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '-3').attr('y2', '-3');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '3').attr('y2', '3');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '6').attr('y2', '6');
        this.appendText(g);
        
        
        //  ----- define variable nodes -----
        g = defs.append('svg:g').attr('id', 'economics.node.var');
        g.append('svg:use').attr('xlink:href', '#economics.node.var.outer');
        this.appendText(g);
        
        g = defs.append('svg:g').attr('id', 'economics.node.var.tuple');
        g.append('svg:use').attr('xlink:href', '#economics.node.var.outer');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3');
        this.appendText(g);
        
        g = defs.append('svg:g').attr('id', 'economics.node.var.struct');
        g.append('svg:use').attr('xlink:href', '#economics.node.var.outer');
        g.append('svg:circle').attr('cx', '0').attr('cy', '0').attr('r', '3').attr('stroke', 'none').attr('fill', '#000');
        this.appendText(g);
        
        g = defs.append('svg:g').attr('id', 'economics.node.var.role');
        g.append('svg:use').attr('xlink:href', '#economics.node.var.outer');
        g.append('svg:line').attr('x1', '0').attr('x2', '0').attr('y1', '-10').attr('y2', '10').attr('stroke-width', '3');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3');
        this.appendText(g);
        
        g = defs.append('svg:g').attr('id', 'economics.node.var.norole');
        g.append('svg:use').attr('xlink:href', '#economics.node.var.outer');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3').attr('transform', 'rotate(45, 0, 0)');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3').attr('transform', 'rotate(-45, 0, 0)');
        this.appendText(g);
        
        g = defs.append('svg:g').attr('id', 'economics.node.var.class');
        g.append('svg:use').attr('xlink:href', '#economics.node.var.outer');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3').attr('transform', 'rotate(45, 0, 0)');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3').attr('transform', 'rotate(-45, 0, 0)');
        g.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0').attr('stroke-width', '3');
        this.appendText(g);
        
        g = defs.append('svg:g').attr('id', 'economics.node.var.abstract');//.attr('clip-path', 'url(#economics.node.var.clip)');
        g.append('svg:use').attr('xlink:href', '#economics.node.var.outer');
        var g2 = g.append('svg:g').attr('stroke-width', '1');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '-6').attr('y2', '-6');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '-3').attr('y2', '-3');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '3').attr('y2', '3');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '6').attr('y2', '6');
        this.appendText(g);

        g = defs.append('svg:g').attr('id', 'economics.node.var.material');//.attr('clip-path', 'url(#economics.node.var.clip)');
        g.append('svg:use').attr('xlink:href', '#economics.node.var.outer');
        var g2 = g.append('svg:g').attr('stroke-width', '1').attr('transform', 'rotate(-45, 0, 0)');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '-6').attr('y2', '-6');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '-3').attr('y2', '-3');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '0').attr('y2', '0');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '3').attr('y2', '3');
        g2.append('svg:line').attr('x1', '-10').attr('x2', '10').attr('y1', '6').attr('y2', '6');
        this.appendText(g);
      
        g = defs.append('svg:g').attr('id', 'economics.link');
        g.append('svg:rect').attr('fill', '#aaa').attr('stroke-width', '6');
    },
    
    /**
     * Append sc.g-text to definition
     */
    appendText: function(def, x, y) {
       def.append('svg:text')
           .attr('x', '17')
           .attr('y', '21')
           .attr('class', 'EconomicsText')
    },
     
    /**
     * Return definition name by sc-type
     */
    getDefId: function(sc_type) {
        if (this.scType2Str.hasOwnProperty(sc_type)) {
            return this.scType2Str[sc_type];
        }
        
        return 'economics.node';
    },
     
    /**
     * Initialize sc-types mapping
     */
    initTypesMapping: function() {
        this.scType2Str[sc_type_node] = 'economics.node';
        this.scType2Str[sc_type_node | sc_type_const] = 'economics.node.const';
        this.scType2Str[sc_type_node | sc_type_const | sc_type_node_material] = 'economics.node.const.material';
        this.scType2Str[sc_type_node | sc_type_const | sc_type_node_abstract] = 'economics.node.const.abstract';
        this.scType2Str[sc_type_node | sc_type_const | sc_type_node_class] = 'economics.node.const.class';
        this.scType2Str[sc_type_node | sc_type_const | sc_type_node_struct] = 'economics.node.const.struct';
        this.scType2Str[sc_type_node | sc_type_const | sc_type_node_norole] = 'economics.node.const.norole';
        this.scType2Str[sc_type_node | sc_type_const | sc_type_node_role] = 'economics.node.const.role';
        this.scType2Str[sc_type_node | sc_type_const | sc_type_node_tuple] = 'economics.node.const.tuple';

        this.scType2Str[sc_type_node | sc_type_var] = 'economics.node.var';
        this.scType2Str[sc_type_node | sc_type_var | sc_type_node_material] = 'economics.node.var.material';
        this.scType2Str[sc_type_node | sc_type_var | sc_type_node_abstract] = 'economics.node.var.abstract';
        this.scType2Str[sc_type_node | sc_type_var | sc_type_node_class] = 'economics.node.var.class';
        this.scType2Str[sc_type_node | sc_type_var | sc_type_node_struct] = 'economics.node.var.struct';
        this.scType2Str[sc_type_node | sc_type_var | sc_type_node_norole] = 'economics.node.var.norole';
        this.scType2Str[sc_type_node | sc_type_var | sc_type_node_role] = 'economics.node.var.role';
        this.scType2Str[sc_type_node | sc_type_var | sc_type_node_tuple] = 'economics.node.var.tuple';
        
        this.scType2Str[sc_type_link] = 'economics.link';
      },
      
    /**
     * All sc.g-edges represented by group of paths, so we need to update whole group.
     * This function do that work
     * @param egde {Economics.ModelEdge} Object that represent sc.g-edge
     * @param d3_group {} Object that represents svg group
     */
    updateEdge: function(edge, d3_group, containerId) {
        
        // first of all we need to determine if edge has an end marker
        var has_marker = edge.hasArrow();
        
        // now calculate target and source positions
        var pos_src = edge.source_pos.clone();
        var pos_trg = edge.target_pos.clone();
        
        // if we have an arrow, then need to fix end position
        if (has_marker) {
            var prev_pos = pos_src;
            if (edge.points.length > 0) {
                prev_pos = new Economics.Vector3(edge.points[edge.points.length - 1].x, edge.points[edge.points.length - 1].y, 0);
            }
            
            var dv = pos_trg.clone().sub(prev_pos);
            var len = dv.length();
            dv.normalize();
            pos_trg = prev_pos.clone().add(dv.multiplyScalar(len - 10));
        }
        
        // make position path
        var position_path = 'M' + pos_src.x + ',' + pos_src.y;
        for (idx in edge.points) {
            position_path += 'L' + edge.points[idx].x + ',' + edge.points[idx].y;
        }
        position_path += 'L' + pos_trg.x + ',' + pos_trg.y;
        
        var sc_type_str = edge.sc_type.toString();
        if (d3_group['sc_type'] != sc_type_str) {
            d3_group.attr('sc_type', sc_type_str);
            
            // remove old
            d3_group.selectAll('path').remove();
            
            d3_group.append('svg:path').classed('EconomicsEdgeSelectBounds', true).attr('d', position_path);
            
            // if it accessory, then append main line
            if (edge.sc_type & sc_type_arc_access) {
                
                var main_style = 'EconomicsEdgeAccessPerm';
                if (edge.sc_type & sc_type_arc_temp) {
                    main_style = edge.sc_type & sc_type_var ? 'EconomicsEdgeAccessTempVar' : 'EconomicsEdgeAccessTemp';
                }
                
                var p = d3_group.append('svg:path')
                    .classed(main_style, true)
                    .classed('EconomicsEdgeEndArrowAccess', true)
                    .style("marker-end", "url(#end-arrow-access_" + containerId + ")")
                    .attr('d', position_path);
                    
                if (edge.sc_type & sc_type_constancy_mask) {
                    p.classed('EconomicsEdgeVarDashAccessPerm', (edge.sc_type & sc_type_var) && (edge.sc_type & sc_type_arc_perm));
                } else {
                    d3_group.append('svg:path')
                        .classed('EconomicsEdgeAccessComonDash', true)
                        .attr('d', position_path);
                }

                if (edge.sc_type & sc_type_arc_neg) {
                    d3_group.append('svg:path')
                        .classed('EconomicsEdgePermNegDash', true)
                        .attr('d', position_path);
                }
            } else if (edge.sc_type & (sc_type_arc_common | sc_type_edge_common)) {

                if (edge.sc_type & sc_type_edge_common){
                    d3_group.append('svg:path')
                        .classed('EconomicsEdgeCommonBack', true)
                        .attr('d', position_path);
                }

                if (edge.sc_type & sc_type_arc_common) {
                    d3_group.append('svg:path')
                        .classed('EconomicsEdgeCommonBack', true)
                        .classed('EconomicsEdgeEndArrowCommon', edge.sc_type & sc_type_arc_common)
                        .style("marker-end", "url(#end-arrow-common_" + containerId + ")")
                        .attr('d', position_path);
                }
                
                d3_group.append('svg:path')
                    .classed('EconomicsEdgeCommonForeground', true)
                    .attr('d', position_path)
                    
                if (edge.sc_type & sc_type_constancy_mask) {
                    if (edge.sc_type & sc_type_var) {
                        d3_group.append('svg:path')
                            .classed('EconomicsEdgeCommonForegroundVar', true)
                            .classed('EconomicsEdgeVarDashCommon', true)
                            .attr('d', position_path);
                    }
                } else {
                    d3_group.append('svg:path')
                        .classed('EconomicsEdgeAccessPerm', true)
                        .classed('EconomicsEdgeVarDashCommon', true)
                        .attr('d', position_path);
                }
                
            } else {
                // unknown
                d3_group.append('svg:path')
                    .classed('EconomicsEdgeUnknown', true)
                    .attr('d', position_path);
            }
            
        } else { 
            // update existing
            d3_group.selectAll('path')
                .attr('d', position_path);
        }
        
        // now we need to draw fuz markers (for now it not supported)
        if (edge.sc_type & sc_type_arc_fuz) {
            d3_group.selectAll('path').attr('stroke', '#f00');
            d3_group.append('svg:path')
                .classed('EconomicsEdgeFuzDash', true)
                .attr('d', position_path)
                .attr('stroke', '#f00');
        }
        
    },
	
	updateBus: function(bus, d3_group) {
                
        var pos_src = bus.source_pos.clone();
        
        // make position path
        var position_path = 'M' + pos_src.x + ',' + pos_src.y;
        for (idx in bus.points) {
            position_path += 'L' + bus.points[idx].x + ',' + bus.points[idx].y;
        }
        
        if (d3_group[0][0].childElementCount == 0) {
            
            d3_group.append('svg:path').classed('EconomicsBusPath', true).attr('d', position_path);
            
            // if it accessory, then append main line
            
            
        } else { 
            // update existing
            d3_group.selectAll('path')
                .attr('d', position_path);
        }
        
    }
};
