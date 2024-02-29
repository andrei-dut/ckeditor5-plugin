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

export function moveListItemInParent(source, direction, editor) {
  const isUpDirection = direction === "up";
  const anchor = source?.anchor;
  if (anchor) {
    setTimeout(() => {
      const olEl = findParent(source.anchor, "ol");
      const selectLi = findParent(source.anchor, "li");
      if (!olEl) return;
      const previousSibling = selectLi.previousSibling;
      const nextSibling = selectLi.nextSibling;

      const selectLiModel = editor.editing.mapper.toModelElement(selectLi);
      const previousSiblingModel = previousSibling ? editor.editing.mapper.toModelElement(previousSibling) : null;
      const nextSiblingModel = nextSibling ? editor.editing.mapper.toModelElement(nextSibling) : null;

      if((isUpDirection && previousSiblingModel) || (!isUpDirection && nextSiblingModel)) {
        editor.editing.model.change((writer) => {
          const range = writer.createRangeOn(selectLiModel);
          // const position = writer.createPositionAt(previousSiblingModel, 'before'); // can be used instead of the element
          writer.move(
            range,
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
        const cloneElem = writer.cloneElement(selectLiModel, false)
        console.log("cloneElem",cloneElem);
        writer.insert(cloneElem, selectLiModel, 'after')

        // Getting the insertion position
        // const positionAfterInsertion = writer.createPositionAfter(cloneElem);
        // Move the cursor to the insertion point
        // writer.setSelection(positionAfterInsertion); // if need to refocus
      });
    });
    editor?.editing?.view?.focus();
  }
}
