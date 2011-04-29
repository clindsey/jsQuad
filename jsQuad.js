/*
Title: jsQuad.js
Author: Patrick DeHaan <me@pdehaan.com>
Brief:  MX-CIF Quadtrees implementation in javascript.
*/
var jsQuad = (function() {

var selection = [];

var Node = function(xMin, yMin, xMax, yMax, maxDepth, parent) {
	this.xMin = xMin;
	this.yMin = yMin;
	this.xMax = xMax;
	this.yMax = yMax;
	this.x = (xMax+xMin)/2;
	this.y = (yMax+yMin)/2;
	this.maxDepth = maxDepth === undefined ? 4 : maxDepth;
	this.children = [];
	this.q1 = null;
	this.q2 = null;
	this.q3 = null;
	this.q4 = null;
	this.parent = parent === undefined ? null : parent;
};
var subdivide = function(node) {
	var depth = node.maxDepth-1;
	if (depth < 0) { return false; }
	var xMin = node.xMin, yMin = node.yMin,
		xMax = node.xMax, yMax = node.yMax,
		x = node.x, y = node.y;
	node.q1 = new Node(x, y, xMax, yMax, depth, node);
	node.q2 = new Node(xMin, y, x, yMax, depth, node);
	node.q3 = new Node(xMin, yMin, x, y, depth, node);
	node.q4 = new Node(x, yMin, xMax, y, depth, node);
};
Node.prototype = {
	insert: function(child) {
		var node = this;
		if (child.QTenclosed(node.xMin,node.yMin,node.xMax,node.yMax)) {
			if (node.q1 === null && node.maxDepth > 0) {
				subdivide(node);
			}
			if (node.q1 !== null) {
				var q = child.QTquadrant(node.x, node.y);
				if (q == 1) {
					node.q1.insert(child);
				} else if (q == 2) {
					node.q2.insert(child);
				} else if (q == 3) {
					node.q3.insert(child);
				} else if (q == 4) {
					node.q4.insert(child);
				} else {
					node.children.push(child);
					child.QTsetParent(node);
				}
			} else {
				node.children.push(child);
				child.QTsetParent(node);
			}
		} else {
			node.children.push(child);
			child.QTsetParent(node);
		}
	},
	reinsert: function(child, isParent) {
		var parent = child.QTgetParent();
		parent._remove(child);
		parent._reinsert(child);
	},
	_reinsert: function(child) {
		if (child.QTenclosed(this.xMin, this.yMin, this.xMax, this.yMax)) {
			this.insert(child);
		} else {
			if (this.parent === null) { return; } // todo: throw perhaps
			this.parent._reinsert(child);
		}
	},
	remove: function(child, isParent) {
		child.QTgetParent().remove(child, true);
	},
	_remove: function(child) {
		for (var i=0; i<this.children.length;i++) {
			if (this.children[i] === child) {
				this.children.splice(i,1);
			}
		}
	},
	getSelection: function() {
		return selection;
	},
	getChildren: function() {
		selection.length = 0;
		this.selectChildren();
		return selection;
	},
	selectChildren: function() {
		selection.push.apply(selection, this.children);
		if (this.q1 !== null) {
			this.q1.selectChildren();
			this.q2.selectChildren();
			this.q3.selectChildren();
			this.q4.selectChildren();
		}
	},
	getEnclosed: function(xMin, yMin, xMax, yMax) {
		selection.length = 0;
		this.selectEnclosed(xMin, yMin, xMax, yMax);
		return selection;
	},
	selectEnclosed: function(xMin, yMin, xMax, yMax) {
		// move along if there isn't even a boundary overlap
		if (this.xMax < xMin || this.xMin > xMax || this.yMax < yMin || this.yMin > yMax) {
			return;
		}
		
		// entire node is enclosed, select everything
		if (xMin <= this.xMin && xMax >= this.xMax && yMin <= this.yMin && yMax >= this.yMax) {
			// node is entirely enclosed, select all children
			this.selectChildren();
		}
		// node is partially enclosed, search children and sub-nodes
		else {
			// search subnodes if we have them
			if (this.q1 !== null) {
				this.q1.selectEnclosed(xMin, yMin, xMax, yMax);
				this.q2.selectEnclosed(xMin, yMin, xMax, yMax);
				this.q3.selectEnclosed(xMin, yMin, xMax, yMax);
				this.q4.selectEnclosed(xMin, yMin, xMax, yMax);
			}
			// find enclosed children
			for (var i=0; i<this.children.length; i++) {
				if (this.children[i].QTenclosed(xMin, yMin, xMax, yMax)) {
					selection.push(this.children[i]);
				}
			}
		}
	},
	getOverlapping: function(xMin, yMin, xMax, yMax) {
		selection.length = 0;
		this.selectOverlapping(xMin, yMin, xMax, yMax);
		return selection;
	},
	selectOverlapping: function(xMin, yMin, xMax, yMax) {
		// move along if there isn't even a boundary overlap
		if (this.xMax < xMin || this.xMin > xMax || this.yMax < yMin || this.yMin > yMax) {
			return;
		}
		
		// entire node is enclosed, select everything
		if (xMin <= this.xMin && xMax >= this.xMax && yMin <= this.yMin && yMax >= this.yMax) {
			// node is entirely enclosed, select all children
			this.selectChildren();
		}
		// node is partially enclosed, search children and sub-nodes
		else {
			// search subnodes if we have them
			if (this.q1 !== null) {
				this.q1.selectOverlapping(xMin, yMin, xMax, yMax);
				this.q2.selectOverlapping(xMin, yMin, xMax, yMax);
				this.q3.selectOverlapping(xMin, yMin, xMax, yMax);
				this.q4.selectOverlapping(xMin, yMin, xMax, yMax);
			}
			// find enclosed children
			for (var i=0; i<this.children.length; i++) {
				if (this.children[i].QToverlaps(xMin, yMin, xMax, yMax)) {
					selection.push(this.children[i]);
				}
			}
		}
	}
};

return Node; })();