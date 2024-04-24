
import { Command } from "../../ckeditor";

export default class InsertAllowanceCommand extends Command {
  refresh() {
    this.isEnabled = true;
  }

  execute(iconData = {}) {
    const model = this.editor.model;
    const selection = model.document.selection;
    model.change((writer) => {

    const allowanceElem = writer.createElement("allowance", {class: "aw-req-allowance"})    
    const allowanceText = writer.createElement("allowanceText", {class: "allowance-number"});
    const allowanceText2 = writer.createElement("allowanceText", {class: "allowance-number"});

    writer.insertText(iconData.x, allowanceText);
    writer.insertText(iconData.y, allowanceText2);
    writer.insert(allowanceText, writer.createPositionAt(allowanceElem, 0));
    writer.insert(allowanceText2, writer.createPositionAt(allowanceElem, 1));

    model.insertContent(allowanceElem, selection);

      return;
    });
  }
}
