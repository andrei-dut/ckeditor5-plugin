
import { Command } from "../../reqCkeditor.service";

export default class InsertParametrCommand extends Command {
  refresh() {
    this.isEnabled = true;
  }

  execute(values = {}) {
    const model = this.editor.model;
    const selection = model.document.selection;
    model.change((writer) => {

    const paramElem = writer.createElement("parametrText", {class: "aw-req-parametrText", "data-type": values.type})    

    writer.insertText(values.parametr, paramElem);

    model.insertContent(paramElem, selection);

    const positionAfter = writer.createPositionAfter(paramElem);
    writer.insertText(' ', positionAfter);

      return;
    });
  }
}
