import { Command } from "../../ckeditor";
import svg64 from "../svg64";

export default class InsertIconCommand extends Command {
  refresh() {
    // const model = this.editor.model;
    // const selection = model.document.selection;
    // const selectedElement = selection.getSelectedElement() || first( selection.getSelectedBlocks() );
    this.isEnabled = true;
  }

  execute(iconData = {}) {
    const model = this.editor.model;
    const selection = model.document.selection;

    model.change((writer) => {
      const imageElement = writer.createElement("imageInline", { src: svg64(iconData.icon), 'alt': 'asa' });

      model.insertContent(imageElement, selection);

        return
    });
  }
}
