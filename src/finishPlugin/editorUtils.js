export function findParent(element, parentName) {
  let currentElement = element;

  if (!currentElement) return null;

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

export function executeEditorCmd(cmdName, editor) {
  const indentCommand = editor ? editor.commands.get(cmdName) : null;
  if(indentCommand?.execute) {
      indentCommand.execute();
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
            rangeNextSibling ? rangeNextSibling.start : rangeLastChild ? rangeLastChild.end : range.end
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
  if (anchor) {
    setTimeout(() => {
      const selectLi = findParent(source.anchor, "li");
      if (!selectLi) return;
      editor.editing.model.change((writer) => {
        const selectLiModel = editor.editing.mapper.toModelElement(selectLi);
        const cloneElem = writer.cloneElement(selectLiModel, false);
        console.log("cloneElem", cloneElem);
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
