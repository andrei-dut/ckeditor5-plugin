import { Command } from "../ckeditor";

export default class InsertIconCommand extends Command {
  refresh() {
    // const model = this.editor.model;
    // const selection = model.document.selection;
    // const selectedElement = selection.getSelectedElement() || first( selection.getSelectedBlocks() );
    this.isEnabled = true;
  }

  /**
   * Executes the command.
   */
  execute(iconData = {}) {
    const model = this.editor.model;
    const selection = model.document.selection;

    model.change((writer) => {
      
      const iconElement = writer.createElement("iconSvg", {
        "data-key": iconData.key,
        "data-name": iconData.iconName,
        "data-icon": iconData.icon,
      });
      console.log(iconElement, selection, writer);
      model.insertContent(iconElement, selection);
    });
  }
}
