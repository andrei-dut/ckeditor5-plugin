import { Plugin } from "../reqCkeditor.service";
import { createTestItemToolbar } from "../createTestItemToolbar";
import {
  executeEditorCmd,
  findElemInSelectionByName,
  removeAllParagraph,
  removeParagraphBetweenReq,
  updateMarkers,
} from "../customPlugins/editorUtils";
import cutIcon from "./icons/cut.svg";
import copyIcon from "./icons/copy.svg";
import pasteIcon from "./icons/paste.svg";
import addIcon from "./icons/addIcon.svg";
import removeIcon from "./icons/removeIcon.svg";
import moreIcon from "./icons/moreIcon.svg";
import lessIcon from "./icons/lessIcon.svg";
import moveUpIcon from "./icons/moveUpIcon.svg";
import moveDownIcon from "./icons/moveDownIcon.svg";
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
      updateMarkers(editor);
    });

    createTestItemToolbar(editor, "paste", pasteIcon, () => {
      executeEditorCmd(editor, "copyCutPasteCmd", {
        typeCmd: "paste",
        contentIncludes: "requirement",
        pasteCb: (pasteFragment) => {
          const foundModelReq = findElemInSelectionByName(editor, "requirement");
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
      executeEditorCmd(editor, "insertCustomList", { type: "addNew" });
    });
    createTestItemToolbar(editor, "removeReq", removeIcon, () => {
      executeEditorCmd(editor, "insertCustomList", { type: "remove" });
      removeAllParagraph(editor)
    });
    createTestItemToolbar(editor, "levelUpReq", moreIcon, () => {
      executeEditorCmd(editor, "insertCustomList", { type: "levelUp" });
    });
    createTestItemToolbar(editor, "levelDownReq", lessIcon, () => {
      executeEditorCmd(editor, "insertCustomList", { type: "levelDown" });
    });
    createTestItemToolbar(editor, "moveUpReq", moveUpIcon, () => {
      executeEditorCmd(editor, "insertCustomList", { type: "moveUp" });
    });
    createTestItemToolbar(editor, "moveDownReq", moveDownIcon, () => {
      executeEditorCmd(editor, "insertCustomList", { type: "moveDown" });
    });
    // createTestItemToolbar(editor, "parametr", undefined, () => {
    //   executeEditorCmd(editor, "insertCustomList", { type: "moveDown" });
    // });
  }

}
