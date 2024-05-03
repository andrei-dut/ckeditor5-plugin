import { Plugin } from "../ckeditor";
import { createTestItemToolbar } from "../createTestItemToolbar";
import {
  executeEditorCmd,
  findAllElementsByName,
  findElemInSelectionByName,
  getEditElemByClassFromSelection,
  getNextSibling,
  getPreviousSibling,
  isParentRoot,
  removeParagraphBetweenReq,
  updateMarkers,
  viewToModelElem,
} from "../customPlugins/editorUtils";
import cutIcon from "./icons/cut.svg";
import copyIcon from "./icons/copy.svg";
import pasteIcon from "./icons/paste.svg";
import addIcon from "./icons/addIcon.svg";
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

    this._handlerReqTools()

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
      removeParagraphBetweenReq(editor)
      updateMarkers(editor);
    });

    createTestItemToolbar(editor, "paste", pasteIcon, () => {
      executeEditorCmd(editor, "copyCutPasteCmd", {
        typeCmd: "paste",
        contentIncludes: "requirement",
        pasteCb: (pasteFragment) => {
          const foundModelReq = findElemInSelectionByName(editor, "requirement");
          console.log("foundModelReq", foundModelReq);
          const model = editor.model;
          model.change((writer) => {
            const insertPosition = foundModelReq
              ? writer.createPositionAfter(foundModelReq)
              : writer.createPositionAt(editor.model.document.getRoot(), "end");
            model.insertContent(pasteFragment, insertPosition);
            updateMarkers(editor, foundModelReq);
          });
        },
      });
      removeParagraphBetweenReq(editor);
    });
  }

  _handlerReqTools() {
    const editor = this.editor;
    createTestItemToolbar(editor, "addReq", addIcon, () => {

    });
  }

}
