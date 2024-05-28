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
        hardContent: `<div class="requirement ck-widget" id="req_1" contenteditable="false" data-custom_comment="111"><div class="aw-requirement-marker"><span class="aw-ckeditor-marker-element">1</span></div><div class="aw-requirement-content"><div class="aw-requirement-bodytext ck-editor__editable ck-editor__nested-editable" contenteditable="true" isdirty="false"><p>Содержи&nbsp;<span class="aw-req-allowance ck-widget" contenteditable="false"><span class="allowance-number">1</span><span class="allowance-number">2</span></span>моеcv&nbsp;<span class="aw-req-parametrText ck-widget" contenteditable="false" data-type="text">ghghg</span>&nbsp;<img src="data:image/svg+xml;base64,CjxzdmcKICAgd2lkdGg9IjExLjUiCiAgIGhlaWdodD0iMTIuNSIKICAgdmlld0JveD0iMCAwIDExLjUwMDAwMSAxMi41IgogICB2ZXJzaW9uPSIxLjEiCiAgIGlkPSJzdmcxIgogICBpbmtzY2FwZTp2ZXJzaW9uPSIxLjMuMiAoMDkxZTIwZSwgMjAyMy0xMS0yNSwgY3VzdG9tKSIKICAgc29kaXBvZGk6ZG9jbmFtZT0idHJpYW5nbGVSaWdodC5zdmciCiAgIHhtbG5zOmlua3NjYXBlPSJodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy9uYW1lc3BhY2VzL2lua3NjYXBlIgogICB4bWxuczpzb2RpcG9kaT0iaHR0cDovL3NvZGlwb2RpLnNvdXJjZWZvcmdlLm5ldC9EVEQvc29kaXBvZGktMC5kdGQiCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHNvZGlwb2RpOm5hbWVkdmlldwogICAgIGlkPSJuYW1lZHZpZXcxIgogICAgIHBhZ2Vjb2xvcj0iI2ZmZmZmZiIKICAgICBib3JkZXJjb2xvcj0iIzAwMDAwMCIKICAgICBib3JkZXJvcGFjaXR5PSIwLjI1IgogICAgIGlua3NjYXBlOnNob3dwYWdlc2hhZG93PSIyIgogICAgIGlua3NjYXBlOnBhZ2VvcGFjaXR5PSIwLjAiCiAgICAgaW5rc2NhcGU6cGFnZWNoZWNrZXJib2FyZD0iMCIKICAgICBpbmtzY2FwZTpkZXNrY29sb3I9IiNkMWQxZDEiCiAgICAgaW5rc2NhcGU6ZG9jdW1lbnQtdW5pdHM9InB4IgogICAgIGlua3NjYXBlOnpvb209IjQ1LjI1NDgzNCIKICAgICBpbmtzY2FwZTpjeD0iNS45MjIwMTkzIgogICAgIGlua3NjYXBlOmN5PSI1LjI5MjI1MjMiCiAgICAgaW5rc2NhcGU6d2luZG93LXdpZHRoPSIxOTIwIgogICAgIGlua3NjYXBlOndpbmRvdy1oZWlnaHQ9IjEwMTciCiAgICAgaW5rc2NhcGU6d2luZG93LXg9Ii04IgogICAgIGlua3NjYXBlOndpbmRvdy15PSItOCIKICAgICBpbmtzY2FwZTp3aW5kb3ctbWF4aW1pemVkPSIxIgogICAgIGlua3NjYXBlOmN1cnJlbnQtbGF5ZXI9InN2ZzEiCiAgICAgc2hvd2dyaWQ9ImZhbHNlIiAvPgogIDxkZWZzCiAgICAgaWQ9ImRlZnMxIiAvPgogIDxnCiAgICAgaW5rc2NhcGU6bGFiZWw9ItCh0LvQvtC5IDEiCiAgICAgaW5rc2NhcGU6Z3JvdXBtb2RlPSJsYXllciIKICAgICBpZD0ibGF5ZXIxIgogICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yLjUzNTkyMTQsLTIuNzk5NzUwMikiIC8+CiAgPHBhdGgKICAgICBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDAwMDAwO3N0cm9rZS13aWR0aDowLjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lIgogICAgIGlua3NjYXBlOmxhYmVsPSJUcmlhbmdsZSIKICAgICBkPSJtIDAuOTUxMzAwOTUsMS4wNTM1MTcgdiAxMSBsIDkuNTI2Mjc5MDUsLTUuNSB6IgogICAgIGlkPSJwYXRoMTEiIC8+Cjwvc3ZnPgoK" data-json="{}" data-id="triangleRight" alt="triangleRight"> <a class="custom-link" href="123" data-text="textLink">textLink</a></p></div></div></div>`
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
