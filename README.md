jsQuad
===
Author: Patrick DeHaan <me@pdehaan.com>

Brief:  MX-CIF Quadtrees implementation in javascript.

Overview
===
MX-CIF quadtrees store region bounded objects in the smallest sub-node that fully encloses them. Nodes may have any number of children and may or may not have four quadrant sub-nodes. The current implementation does not support placing a given object into a multiple trees simultaneously.

This form of quadtree is useful for storing objects with 2d spatial dimensions while providing efficient methods of searching for objects with given spatial properties (overlapping regions, enclosed by regions, enclosing regions, etc.)

Note that it is also perfectly reasonable to store point objects as well, just pretend it's boundaries are the same.


Object method requirements
---
For flexability, this implementation defers certain logic to the contained objects, thus requiring that they provide the following methods:

	.QTenclosed(xMin, yMin, xMax, yMax) -> boolean
returns true if the object fits entirely within the boundaries given.

	.QToverlaps(xMin, yMin, xMax, yMax) -> boolean
return true if the object overlaps the boundaries given.

	.QTquadrant(x,y) -> number
returns 0 if the object overlaps either x or y, or a quadrant 1-4 (from the upper right counterclockwise)

	.QTminDistance(xMin, yMin, xMax, yMax) -> number
returns the mimumum distance of the object and the given boundary, along either the x or y axis.

	.QTsetParent(parent) -> void
stores the given parent node somewhere it can be recalled.

	.QTgetParent() -> node
returns the stored parent node.

No access to the objects will occur except through these methods. This enables object boundary definitions to be handled in whatever manner is most suitable for that type. Note that if objects are moved they should call the quadtree's .reinsert(child) method in order to rebuild the tree.

Useage
===
Creation
---
var tree = new Quadtree(xMin, yMin, xMax, yMax, maxDepth);

[xMin], [yMin], [xMax], and [yMax] define the boundaries of the quadtree.

[maxDepth] defines the maximum number of times to subdivide the tree nodes.
There will be at most 4^[maxDepth] of the smallest sized nodes, with a height
and width equal to ([xMax|yMax]-[xMin|yMin])/2^[maxDepth].

Insertion
---
	tree.insert(object);

[object] is expected to implement the methods detailed below in order for the quadtree to manage it correctly.

Manipulation
---
	tree.reinsert(child)

[child] is removed from the tree and re-inserted. This method should be used for any object whose boundaries have changed. While the end result is the same, this can be faster than using tree.remove(child) and tree.insert(child). It achieves this by determining how far the child has moved from it's parent.
If that value is sufficiently small, fewer insertion recursions are required.

	tree.remove(child)
[child] is removed from the tree.

Retrieval
---
	tree.getChildren()
returns all objects in the tree

	tree.getEnclosed(xMin, yMin, xMax, yMax)
returns all objects that are entirely enclosed by the given boundary.

	tree.getOverlapping(xMin, yMin, xMax, yMax)
return all objects that are overlapping the given boundary.

---

TODO: Everything that follows
===

Mapping
---
These methods work like the retrieval methods, but the returned list contains
the result of executing [callback] with each object instead of the objects.

	tree.map(callback)
	tree.mapEnclosed(xMin, yMin, xMax, yMax, callback)
	tree.mapOverlapping(xMin, yMin, xMax, yMax, callback)

Iterating
---
These functions are nearly identical to the mapping functions, but do not
return the results.

	tree.apply()
	thee.applyEnclosed(...)
	tree.applyOverlapping(...)

Clearing
---
	tree.clear()
This empties the tree (all children and sub-nodes are removed).




