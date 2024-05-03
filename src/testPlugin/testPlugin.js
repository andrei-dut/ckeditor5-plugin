import { Plugin } from "../ckeditor";
import { createTestItemToolbar } from "../createTestItemToolbar";
import {
  executeEditorCmd,
  findAllElementsByName,
  getEditElemByClassFromSelection,
  getNextSibling,
  getPreviousSibling,
  isParentRoot,
  updateMarkers,
} from "../customPlugins/editorUtils";
import cutIcon from "./icons/cut.svg";
import copyIcon from "./icons/copy.svg";
import pasteIcon from "./icons/paste.svg";
import "./test.css";

export class TestPlugin extends Plugin {
  static get pluginName() {
    return "TestPlugin";
  }

  // static get requires() {
  //   return [AllowancePlugin];
  // }

  init() {
    const editor = this.editor;

    createTestItemToolbar(editor, "copy", copyIcon, () => {
      executeEditorCmd(editor, "copyCutPasteCmd", {
        typeCmd: "copy",
        contentIncludes: "requirement",
      });
    });

    createTestItemToolbar(editor, "cut", cutIcon, () => {
      executeEditorCmd(editor, "copyCutPasteCmd", {
        typeCmd: "cut",
        contentIncludes: "requirement",
      });
      const allParagraph = findAllElementsByName(editor, "paragraph");
      allParagraph.forEach((paragraph) => {
        if (
          isParentRoot(paragraph) &&
          getNextSibling(paragraph)?.name === "requirement" &&
          getPreviousSibling(paragraph)?.name === "requirement"
        ) {
          editor.model.change((writer) => {
            writer.remove(paragraph);
          });
        }
      });
      updateMarkers(editor);
    });

    createTestItemToolbar(editor, "paste", pasteIcon, () => {
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
  }
}
