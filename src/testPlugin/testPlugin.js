import { Plugin } from "../ckeditor";
import { createTestItemToolbar } from "../createTestItemToolbar";
import {
  executeEditorCmd,
  getEditElemByClassFromSelection,
  updateMarkers,
} from "../customPlugins/editorUtils";
import icon from "../icons/sign.svg";
import { AllowancePlugin } from "./allowancePlugin";
import "./test.css";

export class TestPlugin extends Plugin {
  static get pluginName() {
    return "TestPlugin";
  }

  static get requires() {
    return [AllowancePlugin];
  }

  init() {
    const editor = this.editor;

    createTestItemToolbar(editor, "test", icon, () => {
      executeEditorCmd(editor, "copyCutPasteCmd", {
        typeCmd: "copy",
        contentIncludes: "requirement",
      });
    });

    createTestItemToolbar(editor, "test1", icon, () => {
      executeEditorCmd(editor, "copyCutPasteCmd", {
        typeCmd: "paste",
        contentIncludes: "requirement",
        pasteCb: (pasteFragment) => {
          const reqElem = getEditElemByClassFromSelection(editor, "requirement");
          const model = editor.model;
          const reqModelElem = reqElem ? editor.editing.mapper.toModelElement(reqElem) : null;
          model.change((writer) => {
            const insertPosition = reqModelElem
              ? writer.createPositionAfter(reqModelElem)
              : writer.createPositionAt(editor.model.document.getRoot(), "end");
            model.insertContent(pasteFragment, insertPosition);
            updateMarkers(editor, reqModelElem);
          });
        },
      });
    });

    createTestItemToolbar(editor, "test2", icon, () => {
      executeEditorCmd(editor, "copyCutPasteCmd", {
        typeCmd: "cut",
        contentIncludes: "requirement",
      });
    });
  }

}
