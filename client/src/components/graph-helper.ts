import * as d3 from 'd3';

// @ts-ignore
export const graphScrollable = (treeData) => {
    // Calculate total nodes, max label length;
    let maxLabelLength = 0;
    // variables for drag/drop
    // @ts-ignore
    let selectedNode = null;
    // @ts-ignore
    let draggingNode = null;
    // panning variables
    // @ts-ignore
    let panTimer;
    const panSpeed = 200;
    const panBoundary = 20; // Within 20px from edges will pan when dragging.
    // Misc. variables
    let i = 0;
    const duration = 750;
    // @ts-ignore
    let root;

    let dragStarted = false;

    // size of the diagram
    const viewerWidth = 500;
    const viewerHeight = 500;

    const tree = d3.tree().size([viewerHeight, viewerWidth]);
    let nodes = d3.hierarchy(treeData, d => d.children);
    // @ts-ignore
    nodes = tree(nodes);

    // define a d3 diagonal projection for use by the node paths later on.
    // @ts-ignore
    function diagonal(s, d) {
        return `M ${s.y} ${s.x} C ${(s.y + d.y) / 2} ${s.x}, ${(s.y + d.y) / 2} ${d.x}, ${d.y} ${d.x}`;
    }

    // A recursive helper function for performing some setup by walking through all nodes
    // @ts-ignore
    function visit(parent, visitFn, childrenFn) {
        if (!parent) return;

        visitFn(parent);

        const children = childrenFn(parent);
        if (children) {
            const count = children.length;
            for (let i = 0; i < count; i++) {
                visit(children[i], visitFn, childrenFn);
            }
        }
    }

    // Call visit function to establish maxLabelLength
    // @ts-ignore
    visit(treeData, function(d) {
        maxLabelLength = Math.max(d.name.length, maxLabelLength);
    },
    // @ts-ignore
    function(d) {
        return d.children && d.children.length > 0 ? d.children : null;
    });

    // sort the tree according to the node names

    // @ts-ignore
    function sortTree() {
        // @ts-ignore
        if (tree.root) tree.root.sort(function(a, b) {
            return b.name.toLowerCase() < a.name.toLowerCase() ? 1 : -1;
        });
    }
    // Sort the tree initially incase the JSON isn't in a sorted order.
    sortTree();

    // TODO: Pan function, can be better implemented.

    // @ts-ignore
    function pan(domNode, direction) {
        const speed = panSpeed;
        // @ts-ignore
        if (panTimer) {
            // @ts-ignore
            clearTimeout(panTimer);

            // @ts-ignore
            const translateCoords = svgGroup.attr("transform").transform();
            let translateX = 0;
            let translateY = 0;
            if (direction === 'left' || direction === 'right') {
                translateX = direction === 'left' ? translateCoords.translate[0] + speed : translateCoords.translate[0] - speed;
                translateY = translateCoords.translate[1];
            } else if (direction === 'up' || direction === 'down') {
                translateX = translateCoords.translate[0];
                translateY = direction === 'up' ? translateCoords.translate[1] + speed : translateCoords.translate[1] - speed;
            }
            // @ts-ignore
            const scale = zoomListener.scale();
            svgGroup.transition().attr("transform", "translate(" + translateX + "," + translateY + ")scale(" + scale + ")");
            d3.select(domNode).select('g.node').attr("transform", "translate(" + translateX + "," + translateY + ")");
            // @ts-ignore
            zoomListener.scale(zoomListener.scale());
            // @ts-ignore
            zoomListener.translate([translateX, translateY]);
            panTimer = setTimeout(function() {
                // @ts-ignore
                pan(domNode, speed, direction);
            }, 50);
        }
    }

    // Define the zoom function for the zoomable tree

    // @ts-ignore
    function zoom() {
        svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    // @ts-ignore
    const zoomListener = d3.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);

    // @ts-ignore
    function initiateDrag(d, domNode) {
        draggingNode = d;
        d3.select(domNode).select('.ghostCircle').attr('pointer-events', 'none');
        d3.selectAll('.ghostCircle').attr('class', 'ghostCircle show');
        d3.select(domNode).attr('class', 'node activeDrag');

        svgGroup.selectAll("g.node").sort(function(a, b) { // select the parent and sort the path's
            // @ts-ignore
            if (a.id !== draggingNode.id) return 1; // a is not the hovered element, send "a" to the back
            else return -1; // a is the hovered element, bring "a" to the front
        });
        // if nodes has children, remove the links and nodes
        // @ts-ignore
        if (nodes.length > 1) {
            // remove link paths
            // @ts-ignore
            const links = tree.links(nodes);
            svgGroup.selectAll("path.link")
                .data(links, function(d) {
                    // @ts-ignore
                    return d.target.id;
                }).remove();
            // remove child nodes
            svgGroup.selectAll("g.node")
                // @ts-ignore
                .data(nodes, function(d) {
                    // @ts-ignore
                    return d.id;
                // @ts-ignore
                }).filter(function(d, i) {
                    // @ts-ignore
                    if (d.id === draggingNode.id) {
                        return false;
                    }
                    return true;
                }).remove();
        }

        // remove parent link
        // @ts-ignore
        tree.links(tree.nodes(draggingNode.parent));
        svgGroup.selectAll('path.link').filter(function(d, i) {
            // @ts-ignore
            if (d.target.id === draggingNode.id) {
                return true;
            }
            return false;
        }).remove();

        dragStarted = false;
    }

    // define the baseSvg, attaching a class for styling and the zoomListener
    const baseSvg = d3.select("#tree-container").append("svg")
        .attr("width", viewerWidth)
        .attr("height", viewerHeight)
        .attr("class", "overlay")
        // @ts-ignore
        .call(zoomListener);

    // Define the drag listeners for drag/drop behaviour of nodes.
    // @ts-ignore
    const dragListener = d3.drag()
        // @ts-ignore
        .on("start", function(d) {
            // @ts-ignore
            if (d === root) {
                return;
            }
            // @ts-ignore
            dragStarted = true;
            // @ts-ignore
            nodes = tree.nodes(d);
            d3.event.sourceEvent.stopPropagation();
            // it's important that we suppress the mouseover event on the node being dragged. Otherwise it will absorb the mouseover event and the underlying node will not detect it d3.select(this).attr('pointer-events', 'none');
        })
        // @ts-ignore
        .on("drag", function(d) {
            // @ts-ignore
            if (d === root) {
                return;
            }
            if (dragStarted) {
                // @ts-ignore
                domNode = this;
                // @ts-ignore
                initiateDrag(d, domNode);
            }

            // get coords of mouseEvent relative to svg container to allow for panning
            // @ts-ignore
            const relCoords = d3.mouse($('svg').get(0));
            if (relCoords[0] < panBoundary) {
                panTimer = true;
                // @ts-ignore
                pan(this, 'left');
            // @ts-ignore
            } else if (relCoords[0] > ($('svg').width() - panBoundary)) {

                panTimer = true;
                // @ts-ignore
                pan(this, 'right');
            } else if (relCoords[1] < panBoundary) {
                panTimer = true;
                // @ts-ignore
                pan(this, 'up');
            // @ts-ignore
            } else if (relCoords[1] > ($('svg').height() - panBoundary)) {
                panTimer = true;
                // @ts-ignore
                pan(this, 'down');
            } else {
                try {
                    // @ts-ignore
                    clearTimeout(panTimer);
                } catch (e) {
                }
            }

            // @ts-ignore
            d.x0 += d3.event.dy;
            // @ts-ignore
            d.y0 += d3.event.dx;
            // @ts-ignore
            const node = d3.select(this);
            // @ts-ignore
            node.attr("transform", "translate(" + d.y0 + "," + d.x0 + ")");
            updateTempConnector();
        // @ts-ignore
        }).on("end", function(d) {
            // @ts-ignore
            if (d === root) {
                return;
            }
            // @ts-ignore
            domNode = this;
            // @ts-ignore
            if (selectedNode) {
                // now remove the element from the parent, and insert it into the new elements children
                // @ts-ignore
                var index = draggingNode.parent.children.indexOf(draggingNode);
                if (index > -1) {
                    // @ts-ignore
                    draggingNode.parent.children.splice(index, 1);
                }
                // @ts-ignore
                if (typeof selectedNode.children !== 'undefined' || typeof selectedNode._children !== 'undefined') {
                    // @ts-ignore
                    if (typeof selectedNode.children !== 'undefined') {
                        // @ts-ignore
                        selectedNode.children.push(draggingNode);
                    } else {
                        // @ts-ignore
                        selectedNode._children.push(draggingNode);
                    }
                } else {
                    // @ts-ignore
                    selectedNode.children = [];
                    // @ts-ignore
                    selectedNode.children.push(draggingNode);
                }
                // Make sure that the node being added to is expanded so user can see added node is correctly moved
                // @ts-ignore
                expand(selectedNode);
                sortTree();
                endDrag();
            } else {
                endDrag();
            }
        });

    // @ts-ignore
    function endDrag() {
        selectedNode = null;
        d3.selectAll('.ghostCircle').attr('class', 'ghostCircle');
        // @ts-ignore
        d3.select(domNode).attr('class', 'node');
        // now restore the mouseover event or we won't be able to drag a 2nd time
        // @ts-ignore
        d3.select(domNode).select('.ghostCircle').attr('pointer-events', '');
        updateTempConnector();
        // @ts-ignore
        if (draggingNode !== null) {
            // @ts-ignore
            update(root);
            // @ts-ignore
            centerNode(draggingNode);
            draggingNode = null;
        }
    }

    // Helper functions for collapsing and expanding nodes.

    // @ts-ignore
    /*function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }*/

    // @ts-ignore
    function expand(d) {
        if (d._children) {
            d.children = d._children;
            d.children.forEach(expand);
            d._children = null;
        }
    }

    // @ts-ignore
    const overCircle = function(d) {
        selectedNode = d;
        updateTempConnector();
    };
    // @ts-ignore
    const outCircle = function(d) {
        selectedNode = null;
        updateTempConnector();
    };

    // Function to update the temporary connector indicating dragging affiliation
    const updateTempConnector = function() {
        // @ts-ignore
        let data = [];
        // @ts-ignore
        if (draggingNode !== null && selectedNode !== null) {
            // have to flip the source coordinates since we did this for the existing connectors on the original tree
            data = [{
                source: {
                    // @ts-ignore
                    x: selectedNode.y0,
                    // @ts-ignore
                    y: selectedNode.x0
                },
                target: {
                    // @ts-ignore
                    x: draggingNode.y0,
                    // @ts-ignore
                    y: draggingNode.x0
                }
            }];
        }
        // @ts-ignore
        const link = svgGroup.selectAll(".templink").data(data);

        link.enter().append("path")
            .attr("class", "templink")
            // @ts-ignore
            .attr("d", d3.svg.diagonal())
            .attr('pointer-events', 'none');

        // @ts-ignore
        link.attr("d", d3.svg.diagonal());

        link.exit().remove();
    };

    // Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.

    // @ts-ignore
    function centerNode(source) {
        // @ts-ignore
        const scale = zoomListener.scaleExtent();
        let x = -source.y0;
        let y = -source.x0;
        x = x * scale[0] + viewerWidth / 2;
        y = y * scale[0] + viewerHeight / 2;
        d3.select('g').transition()
            .duration(duration)
            .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
        // @ts-ignore
        // zoomListener.scale(scale);
        // @ts-ignore
        zoomListener.translateTo(source, x, y);
    }

    // Toggle children function

    // @ts-ignore
    function toggleChildren(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else if (d._children) {
            d.children = d._children;
            d._children = null;
        }
        return d;
    }

    // Toggle children on click.

    // @ts-ignore
    function click(d) {
        if (d3.event.defaultPrevented) return; // click suppressed
        d = toggleChildren(d);
        update(d);
        centerNode(d);
    }

    // @ts-ignore
    function update(source) {
        // Compute the new height, function counts total children of root node and sets tree height accordingly.
        // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
        // This makes the layout more consistent.
        const levelWidth = [1];
        // @ts-ignore
        const childCount = function(level, n) {
            if (n.children && n.children.length > 0) {
                if (levelWidth.length <= level + 1) levelWidth.push(0);

                levelWidth[level + 1] += n.children.length;
                // @ts-ignore
                n.children.forEach(function(d) {
                    childCount(level + 1, d);
                });
            }
        };
        // @ts-ignore
        childCount(0, root);
        // @ts-ignore
        const newHeight = d3.max(levelWidth) * 25; // 25 pixels per line  
        // @ts-ignore
        tree.size([newHeight, viewerWidth]);

        // Compute the new tree layout.
        // @ts-ignore
        const links = nodes;

        // Set widths between levels based on maxLabelLength.
        // @ts-ignore
        nodes.children.forEach(function(d) {
            // @ts-ignore
            d.y = (d.depth * (maxLabelLength * 10)); //maxLabelLength * 10px
            // alternatively to keep a fixed scale one can set a fixed depth per level
            // Normalize for fixed-depth by commenting out below line
            // d.y = (d.depth * 500); //500px per level.
        });

        // Update the nodes…
        // @ts-ignore
        const node = svgGroup.selectAll("g.node")
            // @ts-ignore
            .data(nodes, function(d) {
                // @ts-ignore
                return d.id || (d.id = ++i);
            });

        // Enter any new nodes at the parent's previous position.
        const nodeEnter = node.enter().append("g")
            // @ts-ignore
            .call(dragListener)
            .attr("class", "node")
            // @ts-ignore
            .attr("transform", function(d) {
                return "translate(" + source.y0 + "," + source.x0 + ")";
            })
            .on('click', click);

        nodeEnter.append("circle")
            .attr('class', 'nodeCircle')
            .attr("r", 0)
            // @ts-ignore
            .style("fill", function(d) {
                // @ts-ignore
                return d._children ? "lightsteelblue" : "#fff";
            });

        nodeEnter.append("text")
            // @ts-ignore
            .attr("x", function(d) {
                // @ts-ignore
                return d.children || d._children ? -10 : 10;
            })
            .attr("dy", ".35em")
            .attr('class', 'nodeText')
            // @ts-ignore
            .attr("text-anchor", function(d) {
                // @ts-ignore
                return d.children || d._children ? "end" : "start";
            })
            // @ts-ignore
            .text(function(d) {
                // @ts-ignore
                return d.name;
            })
            .style("fill-opacity", 0);

        // phantom node to give us mouseover in a radius around it
        nodeEnter.append("circle")
            .attr('class', 'ghostCircle')
            .attr("r", 30)
            .attr("opacity", 0.2) // change this to zero to hide the target area
        .style("fill", "red")
            .attr('pointer-events', 'mouseover')
            // @ts-ignore
            .on("mouseover", function(node) {
                overCircle(node);
            })
            // @ts-ignore
            .on("mouseout", function(node) {
                outCircle(node);
            });

        // Update the text to reflect whether node has children or not.
        node.select('text')
            // @ts-ignore
            .attr("x", function(d) {
                // @ts-ignore
                return d.children || d._children ? -10 : 10;
            })
            // @ts-ignore
            .attr("text-anchor", function(d) {
                // @ts-ignore
                return d.children || d._children ? "end" : "start";
            })
            // @ts-ignore
            .text(function(d) {
                // @ts-ignore
                return d.name;
            });

        // Change the circle fill depending on whether it has children and is collapsed
        node.select("circle.nodeCircle")
            .attr("r", 4.5)
            // @ts-ignore
            .style("fill", function(d) {
                // @ts-ignore
                return d._children ? "lightsteelblue" : "#fff";
            });

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            // @ts-ignore
            .attr("transform", function(d) {
                // @ts-ignore
                return "translate(" + d.y + "," + d.x + ")";
            });

        // Fade the text in
        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            // @ts-ignore
            .attr("transform", function(d) {
                return "translate(" + source.y + "," + source.x + ")";
            })
            .remove();

        nodeExit.select("circle")
            .attr("r", 0);

        nodeExit.select("text")
            .style("fill-opacity", 0);

        // Update the links…
        var link = svgGroup.selectAll("path.link")
            // @ts-ignore
            .data(links, function(d) {
                // @ts-ignore
                return d.target.id;
            });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            // @ts-ignore
            .attr("d", function(d) {
                var o = {
                    x: source.x0,
                    y: source.y0
                };
                // @ts-ignore
                return diagonal({
                    source: o,
                    target: o
                });
            });

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            // @ts-ignore
            .attr("d", function(d) {
                var o = {
                    x: source.x,
                    y: source.y
                };
                // @ts-ignore
                return diagonal({
                    source: o,
                    target: o
                });
            })
            .remove();

        // Stash the old positions for transition.
        // @ts-ignore
        nodes.children.forEach(function(d) {
            // @ts-ignore
            d.x0 = d.x;
            // @ts-ignore
            d.y0 = d.y;
        });
    }

    // Append a group which holds all nodes and which the zoom Listener can act upon.
    const svgGroup = baseSvg.append('g');

    // Define the root
    root = nodes;
    // @ts-ignore
    root.x0 = viewerHeight / 2;
    // @ts-ignore
    root.y0 = 0;

    // Layout the tree initially and center on the root node.
    update(svgGroup);
    centerNode(svgGroup);
};

export interface ITreeNode {
    name: string;
    children?: ITreeNode[];
}

interface IDecoratedHierarchyPointNode<T> extends d3.HierarchyPointNode<T> {
    _children?: IDecoratedHierarchyPointNode<T>[];
    x0: number;
    y0: number;
}

interface ITreePoint {
    x: number;
    y: number; 
}

type CustomTreeNode = IDecoratedHierarchyPointNode<ITreeNode>;
type SelectionCallback = d3.ValueFn<SVGGElement, CustomTreeNode, void>;

const TRANSITION_DURATION_MS = 750;
const DISTANCE_BETWEEN_LEVELS = 180;

const collapse = (d: IDecoratedHierarchyPointNode<ITreeNode>) => {
    if (d.children) {
        d._children = d.children
        d._children.forEach(collapse)
        delete d.children;
    }
};

// Creates a curved (diagonal) path from parent to the child nodes
const diagonal = (s: ITreePoint, d: ITreePoint) => {
    return `M ${s.y} ${s.x} C ${(s.y + d.y) / 2} ${s.x}, ${(s.y + d.y) / 2} ${d.x}, ${d.y} ${d.x}`;
};

const setColor = (d: CustomTreeNode) => d._children ? 'lightsteelblue' : '#fff';

const setTextAnchor = (d: CustomTreeNode) => d.children || d._children ? 'end' : 'start';

export const graphSimple = (ref: SVGSVGElement, treeData: ITreeNode) => {
    // Set the dimensions and margins of the diagram
    const width = ref.width ? ref.width.baseVal.value : 0;
    const height = ref.height ? ref.height.baseVal.value : 0;

    const zoomHandler = () => {
        // D3 uses live-binding to attach an event object to "d3"
        // ES6 "import" breaks that, so we have to "require" the event to get at it
        const event = require('d3').event
        svg.attr('transform', event.transform);
    }

    // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    const zoomListener = d3.zoom<SVGGElement, CustomTreeNode>().scaleExtent([0.1, 3]).on('zoom', zoomHandler);

    const svg = d3.select<SVGGElement, CustomTreeNode>(ref).append('g').attr('class', 'graph').call(zoomListener);
    const treeLayout = d3.tree<ITreeNode>().size([height, width]);
    const root = d3.hierarchy(treeData, (d: ITreeNode) => d.children) as CustomTreeNode;

    // Typescript does not acknowledge that the root node has an x0 and y0 property
    // yet, if you do not set that, the edges of your graph will initially register
    // as being in place, while the nodes will animate from off canvas
    root.x0 = height / 2;
    root.y0 = 0;

    // Collapse after the second level
    if (root.children) root.children.forEach(collapse);

    // Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.
    // @ts-ignore
    const centerNode = (source: TransitionLike<SVGGElement, CustomTreeNode>) => {
        const scale = zoomListener.scaleExtent();

        let x = -source.y0 || 0;
        let y = -source.x0 || 0;
        x = x * scale[0] + width / 2;
        y = y * scale[0] + height / 2;

        d3.select('g').transition()
            .duration(TRANSITION_DURATION_MS)
            .attr('transform', `translate(${x},${y})scale(${scale})`);

        zoomListener.translateTo(source, x, y);
    };

    // Toggle children on click.
    const click: SelectionCallback = (d) => {
        if (d.children) {
            d._children = d.children;
            delete d.children;
        } else {
            d.children = d._children;
            delete d._children;
        }

        update(d);
    };

    const update = (source: CustomTreeNode) => {
        // Assigns the x and y position for the nodes
        const treeData = treeLayout(root) as CustomTreeNode;

        // Compute the new tree layout.
        const nodes = treeData.descendants(),
        links = treeData.descendants().slice(1);

        // Normalize for fixed-depth.
        nodes.forEach(d => d.y = d.depth * DISTANCE_BETWEEN_LEVELS);

        // ****************** Nodes section ***************************

        // Update the nodes...
        // @ts-ignore // Oh my goodness, getting the types defined for the callback are thorny...
        const node = svg.selectAll('g.node').data(nodes, (d, i: number) => d.id || (d.id = i));

        // Enter any new modes at the parent's previous position.
        const nodeEnter = node.enter().append('g')
            .attr('class', 'node')
            .attr('transform', () => `translate(${source.y0},${source.x0})`)
            // @ts-ignore
            .attr('id', (d) => {
                // debugger;
                return `id-${typeof d.id === 'undefined' ? -1 : d.id}`;
            })
            .on('click', click);

        // Add Circle for the nodes
        nodeEnter.append('circle')
            .attr('class', 'node')
            .attr('r', 1e-6)
            .style('fill', setColor);

        // Add labels for the nodes
        nodeEnter.append('text')
            .attr('dy', '.35em')
            .attr('x', (d: CustomTreeNode) => d.children || d._children ? -13 : 13)
            .attr('text-anchor', setTextAnchor)
            .text((d: CustomTreeNode) => d.data.name);

        // UPDATE
        // @ts-ignore
        const nodeUpdate = nodeEnter.merge(node);

        // Transition to the proper position for the node
        nodeUpdate.transition()
            .duration(TRANSITION_DURATION_MS)
            .attr('transform', (d: CustomTreeNode) => `translate(${d.y},${d.x})`);

        // Update the node attributes and style
        nodeUpdate.select('circle.node')
            .attr('r', 10)
            .style('fill', setColor)
            .attr('cursor', 'pointer');

        // Remove any exiting nodes
        const nodeExit = node.exit().transition()
            .duration(TRANSITION_DURATION_MS)
            .attr('transform', () => `translate(${source.y},${source.x})`)
            .remove();

        // On exit reduce the node circles size to 0
        nodeExit.select('circle').attr('r', 1e-6);

        // On exit reduce the opacity of text labels
        nodeExit.select('text').style('fill-opacity', 1e-6);

        // ****************** links section ***************************

        // Update the links...
        // @ts-ignore
        const link = svg.selectAll('path.link').data(links, (d) => d.id);

        // Enter any new links at the parent's previous position.
        const linkEnter = link.enter().insert('path', 'g')
            .attr('class', 'link')
            .attr('d', () => {
                const o = { x: source.x0, y: source.y0 };
                return diagonal(o, o);
            });

        // UPDATE
        // @ts-ignore
        const linkUpdate = linkEnter.merge(link);

        // Transition back to the parent element position
        linkUpdate.transition()
            .duration(TRANSITION_DURATION_MS)
            .attr('d', (d: CustomTreeNode) => diagonal(d, d.parent || d));

        // Remove any exiting links
        link.exit().transition()
            .duration(TRANSITION_DURATION_MS)
            .attr('d', () => {
                const o = { x: source.x, y: source.y };
                return diagonal(o, o);
            })
            .remove();

        // Store the old positions for transition.
        nodes.forEach((d) => {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    };

    update(root);
    centerNode(d3.select('g.graph'));
};
