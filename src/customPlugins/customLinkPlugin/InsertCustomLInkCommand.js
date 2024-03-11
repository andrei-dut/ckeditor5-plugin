import { Command } from "../../ckeditor";
import { findAttributeRange } from "../editorUtils";

function objectToMap(obj) {
  const map = new Map();

  for (const key in obj) {
    map.set(key, obj[key]);
  }

  return map;
}

function toMap(data) {
  return objectToMap(data);
}

export default class InsertCustomLInkCommand extends Command {
  refresh() {
    const model = this.editor.model;
    const selection = model.document.selection;
    this.value = selection.getAttribute("customLink");
    this.isEnabled = true;
  }

  execute(linkData = {}) {
    const { href = '', text = '', isRemoveLink } = linkData;
    const model = this.editor.model;
    const selection = model.document.selection;


    if (href || isRemoveLink) {
      model.deleteContent(selection);

      model.change((writer) => {
        const position = selection.getFirstPosition();
        const attributes = toMap(selection.getAttributes());

        if (selection.hasAttribute("customLink")) {
          const position = selection.getFirstPosition();
          const linkRange = findAttributeRange(
            position,
            "customLink",
            selection.getAttribute("customLink"),
            model
          );

          writer.setAttribute("customLink", href, linkRange);
          writer.remove(linkRange);
          if(isRemoveLink) return;
          attributes.set("customLink", href);
          writer.insertText(text, attributes, linkRange.start)
        } else {
          attributes.set("customLink", href);

          const { end: positionAfter } = model.insertContent(
            writer.createText(text, attributes),
            position
          );

          writer.setSelection(positionAfter);
        }
      });
    }
  }
}
