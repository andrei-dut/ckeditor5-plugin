import { Plugin } from "../../ckeditor";
import { executeEditorCmd } from "../editorUtils";
import CopyCutPasteCmd from "./copyCutPasteCmd";

export class CopyCutPastePlugin extends Plugin {
  static get pluginName() {
    return "CopyCutPastePlugin";
  }

  init() {
    const editor = this.editor;

    editor.commands.add("copyCutPasteCmd", new CopyCutPasteCmd(editor));

    editor.on("copyCutPasteEvent", (e, currentData) => {
      const { eventType } = currentData || {};

      if (eventType) {
        executeEditorCmd(editor, "copyCutPasteCmd", eventType);
      }
    });
  }
}
