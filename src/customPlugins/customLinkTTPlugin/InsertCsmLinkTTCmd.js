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

export default class InsertCdmLinkTTCmd extends Command {
  refresh(cleckedLink) {
    const model = this.editor.model;
    const selection = model.document.selection;
    const { href, text } = selection.getAttribute("customLinkTT") || {};
    const _href = href || cleckedLink?.getAttribute("href");
    const _text = text || cleckedLink?.getAttribute("data-text");
    this.value = _href;
    this.set("linkLabel", _text);
    this.isEnabled = true;
  }

  execute(linkData = {}) {
    const { id, marker, isRemoveLink } = linkData;
    const href = String(id);
    const text = String(marker);
    const model = this.editor.model;
    const selection = model.document.selection;

    if (id || isRemoveLink) {
      model.deleteContent(selection);

      model.change((writer) => {
        const position = selection.getFirstPosition();
        const attributes = toMap(selection.getAttributes());

        const nodeB = position.nodeBefore;
        const nodeA = position.nodeAfter;
        const nodeLinkTT = nodeA?.hasAttribute("customLinkTT")
          ? nodeA
          : nodeB?.hasAttribute("customLinkTT")
          ? nodeB
          : null;

        if (selection.hasAttribute("customLinkTT") || nodeLinkTT) {
          let offset;
          if (selection.hasAttribute("customLinkTT")) {
            const position = selection.getFirstPosition();
            offset = findAttributeRange(
              position,
              "customLinkTT",
              selection.getAttribute("customLinkTT"),
              model
            );
          } else {
            const _findBoundBefore = nodeLinkTT
              ? model.createPositionAt(nodeLinkTT, "before")
              : null;
            const _findBoundAfter = nodeLinkTT ? model.createPositionAt(nodeLinkTT, "after") : null;
            offset =
              _findBoundAfter && _findBoundBefore
                ? model.createRange(_findBoundBefore, _findBoundAfter)
                : null;
          }

          if (!offset) return;

          console.log("offset", offset);

          writer.setAttribute("customLinkTT", { href, text }, offset);
          writer.remove(offset);

          if (isRemoveLink) return;

          attributes.set("customLinkTT", { href, text });
          writer.insertText(text, attributes, offset.start);
        } else {
          if (text === "undefined") return;
          attributes.set("customLinkTT", { href, text });
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
