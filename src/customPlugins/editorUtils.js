import { numberToRussianLetter } from "./utils";

export function updateMarkers(editor, elem) {
  const _parent = elem?.parent;
  const isReqParent = _parent?.name === "requirement";
  const parentOfMarkers = findAllElementsByName(editor, "requirement", elem ? false : true, _parent);
  parentOfMarkers.forEach((parentOfMarker, i) => {
    const number = i + 1;
    const elemMarker = getModelElement(editor, parentOfMarker, "span");
    editor.model.change((writer) => {
      writer.remove(elemMarker.getChild(0));
      writer.insertText(
        `${number}${isReqParent ? numberToRussianLetter(number) : ""}` || "-",
        elemMarker
      );
    });
  });
}

export function getEditElemByClassFromSelection(editor, _class) {
  if (!editor && !editor.editing.view.document.selection) return null;
  let elem = editor.editing.view.document.selection.editableElement;

  while (elem) {
    if (elem && _class) {
      if (elem?.hasClass(_class)) {
        return elem;
      } else {
        elem = elem?.parent;
      }
    } else {
      return _class ? null : elem;
    }
  }

  return null;
}

export function getModelElement(editor, containerElement, nameModelEle) {
  if (!containerElement) return null;
  const range = editor.model.createRangeIn(containerElement);
  for (const modelElement of range.getItems({ ignoreElementEnd: true })) {
    if (modelElement.name === nameModelEle) {
      return modelElement;
    }
  }
  return null;
}

export function findAllElementsByName(editor, elementName, parentRoot, rangeIn) {
  const findElements = [];
  const range = editor.model.createRangeIn(rangeIn || editor.model.document.getRoot());
  for (const value of range.getWalker({ ignoreElementEnd: true })) {
    if (
      value.item.is("element") &&
      value.item.name === elementName &&
      (rangeIn
        ? value.item.parent?.name === rangeIn.name
        : parentRoot
        ? isParentRoot(value.item)
        : true)
    ) {
      findElements.push(value.item);
    }
  }
  return findElements;
}

export function isParentRoot(element) {
  return element?.parent && element.parent.name === "$root";
}

export function getTextFromElement(element) {
  if (element) return element.getChild?.(0)?.data;
  return null;
}

export function findParent(element, parentName, thisElem) {
  let currentElement = element;

  if (!currentElement) return null;

  if (thisElem && currentElement.name === parentName) return currentElement;

  while (currentElement) {
    const parentElement = currentElement.parent;

    if (parentElement) {
      if (parentElement.name === parentName) {
        return parentElement;
      } else {
        currentElement = parentElement;
      }
    } else {
      return null;
    }
  }

  return null; // Возвращаем null, если ничего не найдено
}

export function executeEditorCmd(editor, cmdName, arg) {
  const indentCommand = editor ? editor.commands.get(cmdName) : null;
  if (indentCommand?.execute) {
    if(editor.isReadOnly && indentCommand.executeForReadOnlyMode) {
      indentCommand.executeForReadOnlyMode(arg);
    } else {
      indentCommand.execute(arg);
    }
  }
}

export function getLastChildOl(rootNode) {
  try {
    const children = rootNode._children;
    if (children) {
      for (const child of children) {
        if (child.name === "ol" && child.getChild) {
          return child.getChild(child.childCount - 1);
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
}

export function getPreviousSibling(selectedSubling) {
  if (selectedSubling) {
    return selectedSubling.previousSibling;
  }
  return null;
}

export function getNextSibling(selectedSubling) {
  if (selectedSubling) {
    return selectedSubling.nextSibling;
  }
  return null;
}

export function viewToModelElem(editor, viewElem) {
  if (editor && viewElem) {
    return editor.editing.mapper.toModelElement(viewElem);
  }
  return null;
}

export function modelToViewElem(editor, modelElem) {
  if (editor && modelElem) {
    return editor.editing.mapper.toViewElement(modelElem);
  }
  return null;
}

export function moveListItemInParent(source, direction, editor) {
  const isUpDirection = direction === "up";
  const anchor = source?.anchor;
  if (anchor) {
    setTimeout(() => {
      const olEl = findParent(source.anchor, "ol");
      const selectLi = findParent(source.anchor, "li");
      if (!olEl) return;

      const previousSibling = getPreviousSibling(selectLi);
      const nextSibling = getNextSibling(selectLi);

      const selectLiModel = viewToModelElem(editor, selectLi);
      const previousSiblingModel = viewToModelElem(editor, previousSibling);
      const nextSiblingModel = viewToModelElem(editor, nextSibling);

      const lastChild = getLastChildOl(selectLi);
      const lastChildModel = viewToModelElem(editor, lastChild);

      if ((isUpDirection && previousSiblingModel) || (!isUpDirection && nextSiblingModel)) {
        editor.editing.model.change((writer) => {
          const range = writer.createRangeOn(selectLiModel);
          const rangeNextSibling = nextSiblingModel ? writer.createRangeOn(nextSiblingModel) : null;
          const rangeLastChild = lastChildModel ? writer.createRangeOn(lastChildModel) : null;

          const fullRange = writer.createRange(
            range.start,
            rangeNextSibling
              ? rangeNextSibling.start
              : rangeLastChild
              ? rangeLastChild.end
              : range.end
          );

          // const position = writer.createPositionAt(nextSiblingModel, 'after'); // can be used instead of the element
          writer.move(
            fullRange,
            isUpDirection ? previousSiblingModel : nextSiblingModel,
            isUpDirection ? "before" : "after"
          );
        });
      }
      editor?.editing?.view?.focus();
    });
  }
}

export function removeListItemInParent(source, editor) {
  const anchor = source?.anchor;
  if (anchor) {
    setTimeout(() => {
      const selectLi = findParent(source.anchor, "li");
      if (!selectLi) return;
      editor.editing.model.change((writer) => {
        const selectLiModel = editor.editing.mapper.toModelElement(selectLi);
        if (selectLiModel) writer.remove(selectLiModel);
      });
    });
    editor?.editing?.view?.focus();
  }
}

export function addListItemInParent(source, editor) {
  const anchor = source?.anchor;
  if (anchor && editor) {
    setTimeout(() => {
      const selectLi = findParent(source.anchor, "li");
      if (!selectLi) return;
      editor.editing.model.change((writer) => {
        const selectLiModel = editor.editing.mapper.toModelElement(selectLi);
        const cloneElem = writer.cloneElement(selectLiModel, false);

        writer.insert(cloneElem, selectLiModel, "after");

        // Getting the insertion position
        // const positionAfterInsertion = writer.createPositionAfter(cloneElem);
        // Move the cursor to the insertion point
        // writer.setSelection(positionAfterInsertion); // if need to refocus
      });
    });
    editor?.editing?.view?.focus();
  }
}

export function getSelectedLinkElement(customPropName, nodeIsName) {
  const view = this.editor.editing.view;
  const selection = view.document.selection;
  const selectedElement = selection.getSelectedElement();

  function isCustomLinkElement(node) {
    return node.is(nodeIsName || "containerElement") && !!node.getCustomProperty(customPropName);
  }

  function findLinkElementAncestor(position) {
    return position.getAncestors().find((ancestor) => isCustomLinkElement(ancestor));
  }

  function isWidget(node) {
    if (!node.is("element")) {
      return false;
    }

    return !!node.getCustomProperty("widget");
  }

  // The selection is collapsed or some widget is selected (especially inline widget).
  if (selection.isCollapsed || (selectedElement && isWidget(selectedElement))) {
    return findLinkElementAncestor(selection.getFirstPosition());
  } else {
    // The range for fully selected link is usually anchored in adjacent text nodes.
    // Trim it to get closer to the actual link element.
    const range = selection.getFirstRange().getTrimmed();
    const startLink = findLinkElementAncestor(range.start);
    const endLink = findLinkElementAncestor(range.end);

    if (!startLink || startLink != endLink) {
      return null;
    }
    // Check if the link element is fully selected.
    if (view.createRangeIn(startLink).getTrimmed().isEqual(range)) {
      return startLink;
    } else {
      return null;
    }
  }
}

function _findBound(position, attributeName, value, lookBack, model) {
  // Get node before or after position (depends on `lookBack` flag).
  // When position is inside text node then start searching from text node.
  let node = position.textNode || (lookBack ? position.nodeBefore : position.nodeAfter);

  let lastNode = null;

  while (node && node.getAttribute(attributeName) == value) {
    lastNode = node;
    node = lookBack ? node.previousSibling : node.nextSibling;
  }

  return lastNode ? model.createPositionAt(lastNode, lookBack ? "before" : "after") : position;
}

export function findAttributeRange(position, attributeName, value, model) {
  return model.createRange(
    _findBound(position, attributeName, value, true, model),
    _findBound(position, attributeName, value, false, model)
  );
}

export function viewToPlainText(viewItem) {
  let text = "";
  const smallPaddingElements = ["figcaption", "li"];

  if (viewItem.is("$text") || viewItem.is("$textProxy")) {
    // If item is `Text` or `TextProxy` simple take its text data.
    text = viewItem.data;
  } else if (viewItem.is("element", "img") && viewItem.hasAttribute("alt")) {
    // Special case for images - use alt attribute if it is provided.
    text = viewItem.getAttribute("alt");
  } else if (viewItem.is("element", "br")) {
    // A soft break should be converted into a single line break (#8045).
    text = "\n";
  } else {
    // Other elements are document fragments, attribute elements or container elements.
    // They don't have their own text value, so convert their children.
    let prev = null;

    for (const child of viewItem.getChildren()) {
      const childText = viewToPlainText(child);

      // Separate container element children with one or more new-line characters.
      if (prev && (prev.is("containerElement") || child.is("containerElement"))) {
        if (smallPaddingElements.includes(prev.name) || smallPaddingElements.includes(child.name)) {
          text += "\n";
        } else {
          text += "\n\n";
        }
      }

      text += childText;
      prev = child;
    }
  }

  return text;
}

export function normalizeClipboardData(data) {
  return (
    data
      .replace(/<span(?: class="Apple-converted-space"|)>(\s+)<\/span>/g, (fullMatch, spaces) => {
        // Handle the most popular and problematic case when even a single space becomes an nbsp;.
        // Decode those to normal spaces. Read more in https://github.com/ckeditor/ckeditor5-clipboard/issues/2.
        if (spaces.length == 1) {
          return " ";
        }

        return spaces;
      })
      // Remove all HTML comments.
      .replace(/<!--[\s\S]*?-->/g, "")
  );
}

export function plainTextToHtml(text) {
  text = text
    // Encode <>.
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    // Creates a paragraph for each double line break.
    .replace(/\r?\n\r?\n/g, "</p><p>")
    // Creates a line break for each single line break.
    .replace(/\r?\n/g, "<br>")
    // Preserve trailing spaces (only the first and last one – the rest is handled below).
    .replace(/^\s/, "&nbsp;")
    .replace(/\s$/, "&nbsp;")
    // Preserve other subsequent spaces now.
    .replace(/\s\s/g, " &nbsp;");

  if (text.includes("</p><p>") || text.includes("<br>")) {
    // If we created paragraphs above, add the trailing ones.
    text = `<p>${text}</p>`;
  }

  // TODO:
  // * What about '\nfoo' vs ' foo'?

  return text;
}

export function _createRange(writer, elem) {
  const before = writer.createPositionBefore(elem);
  const after = writer.createPositionAfter(elem);
  return writer.createRange(before, after);
}
