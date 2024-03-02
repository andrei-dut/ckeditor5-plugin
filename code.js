    // isCollapsed false if simple set cursor without selected content
    // If selection is collapsed then update selected link or insert new one at the place of caret.
    //
    // const attributes = toMap(selection.getAttributes());

    // attributes.set("linkHref", href);

    // truthyManualDecorators.forEach((item) => {
    //   attributes.set(item, true);
    // });

    // const { end: positionAfter } = model.insertContent(
    //   writer.createText(text, attributes),
    //   position
    // );

    // Put the selection at the end of the inserted link.
    // Using end of range returned from insertContent in case nodes with the same attributes got merged.
    // writer.setSelection(positionAfter);

    // function _isRangeToUpdate(range, allowedRanges) {
//   for (const allowedRange of allowedRanges) {
//     // A range is inside an element that will have the `linkHref` attribute. Do not modify its nodes.
//     if (allowedRange.containsRange(range)) {
//       return false;
//     }
//   }

//   return true;
// }

// function objectToMap(obj) {
//   const map = new Map();

//   for (const key in obj) {
//     map.set(key, obj[key]);
//   }

//   return map;
// }

// function toMap(data) {
//   if (Object.prototype.toString.call(data) === "[object Map]") {
//     return data;
//   } else if (Array.isArray(data) || typeof data === "string") {
//     throw new Error("Invalid argument: data must be an iterable or an object");
//   } else {
//     return objectToMap(data);
//   }
// }

// function _findBound(position, attributeName, value, lookBack, model) {
//   // Get node before or after position (depends on `lookBack` flag).
//   // When position is inside text node then start searching from text node.
//   let node =
//     position.textNode || (lookBack ? position.nodeBefore : position.nodeAfter);

//   let lastNode = null;

//   while (node && node.getAttribute(attributeName) == value) {
//     lastNode = node;
//     node = lookBack ? node.previousSibling : node.nextSibling;
//   }

//   return lastNode
//     ? model.createPositionAt(lastNode, lookBack ? "before" : "after")
//     : position;
// }

// function findAttributeRange(position, attributeName, value, model) {
//   return model.createRange(
//     _findBound(position, attributeName, value, true, model),
//     _findBound(position, attributeName, value, false, model)
//   );
// }

