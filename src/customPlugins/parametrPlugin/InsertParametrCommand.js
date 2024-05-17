
import { Command } from "../../reqCkeditor.service";

export default class InsertParametrCommand extends Command {
  refresh() {
    this.isEnabled = true;
  }

  execute(values = {}) {
    const model = this.editor.model;
    const selection = model.document.selection;
    model.change((writer) => {

    const allowanceElem = writer.createElement("parametrText", {class: "aw-req-parametrText", "data-type": values.type})    

    writer.insertText(values.parametr, allowanceElem);
    // writer.insertText(iconData.y, allowanceText2);
    // writer.insert(allowanceText, writer.createPositionAt(allowanceElem, 0));
    // writer.insert(allowanceText2, writer.createPositionAt(allowanceElem, 1));

    model.insertContent(allowanceElem, selection);

      return;
    });
  }
}
