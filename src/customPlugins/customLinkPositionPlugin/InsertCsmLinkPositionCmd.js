import { Command } from "../../reqCkeditor.service";
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

export default class InsertCdmLinkPositionCmd extends Command {
  refresh(cleckedLink) {
    const model = this.editor.model;
    const selection = model.document.selection;
    const { href, text } = selection.getAttribute("customLinkPosition") || {};
    const _href = href || cleckedLink?.getAttribute('href');
    const _text = text || cleckedLink?.getAttribute('data-text');
    this.value = _href;
    this.set('linkLabel', _text)
    this.isEnabled = true;
  }

  execute(linkData = {}) {
    const { uid, position, isRemoveLink } = linkData;
    const href = String(uid);
    const text = String(position);
    const model = this.editor.model;
    const selection = model.document.selection;

    if (uid || isRemoveLink) {
      model.deleteContent(selection);

      model.change((writer) => {
        const position = selection.getFirstPosition();
        const attributes = toMap(selection.getAttributes());

        if (selection.hasAttribute("customLinkPosition")) {
          const position = selection.getFirstPosition();
          const linkRange = findAttributeRange(
            position,
            "customLinkPosition",
            selection.getAttribute("customLinkPosition"),
            model
          );

          writer.setAttribute("customLinkPosition", {href, text}, linkRange);
          writer.remove(linkRange);
          if(isRemoveLink) return;
          attributes.set("customLinkPosition", {href, text});
          writer.insertText(text, attributes, linkRange.start)
        } else {

          attributes.set("customLinkPosition", {href, text});
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
