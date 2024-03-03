import { Command } from "../ckeditor";

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
    this.isEnabled = true;
  }

  execute(linkData = {}) {
    const { href, text } = linkData;
    const model = this.editor.model;
    const selection = model.document.selection;

    if (href) {
      model.deleteContent(selection);

      model.change((writer) => {
        const position = selection.getFirstPosition();
        const attributes = toMap(selection.getAttributes());

        attributes.set("customLink", href);

        const { end: positionAfter } = model.insertContent(
          writer.createText(text, attributes),
          position
        );

        // Put the selection at the end of the inserted link.
        // Using end of range returned from insertContent in case nodes with the same attributes got merged.
        writer.setSelection(positionAfter);



        // const position = selection.getFirstPosition();
        // const link = writer.createElement("customLink", { href, text });
        // console.log("link", link);
        // writer.insertText(text, link);

        // writer.insert(link, position);
      });
    }
  }
}
