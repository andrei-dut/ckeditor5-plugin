import { Command } from "../../reqCkeditor.service";
import { dataSvgToXml } from "../handlerElemsToNX";
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
      const imageElement = writer.createElement("imageInlineIcon", {
        src: svg64(iconData.icon),
        alt: iconData.iconName,
        id: iconData.iconName,
        "data-id": iconData.iconName,
        "data-json": JSON.stringify(dataSvgToXml(iconData.iconName, iconData.svgValues)),
      });

      model.insertContent(imageElement, selection);

      return;
    });
  }
}
