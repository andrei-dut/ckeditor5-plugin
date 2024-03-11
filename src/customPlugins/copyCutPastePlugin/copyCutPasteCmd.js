import { Command } from "../../ckeditor";
import {
  normalizeClipboardData,
  plainTextToHtml,
  viewToPlainText,
} from "../editorUtils";
import { dataTransfer } from "../manageDataTransfer";

export default class CopyCutPasteCmd extends Command {
  refresh() {
    this.isEnabled = true;
  }

  execute(typeCmd) {
    const editor = this.editor;
    const model = editor.model;
    const modelDocument = model.document;

    function _onPaste() {
      let content = "";

      if (!content) {
        if (dataTransfer.getData("text/html")) {
          content = normalizeClipboardData(dataTransfer.getData("text/html"));
        } else if (dataTransfer.getData("text/plain")) {
          content = plainTextToHtml(dataTransfer.getData("text/plain"));
        }
        content = editor.data.htmlProcessor.toView(content);
      }

      function inputTransformation(_data) {
        if (_data.content.isEmpty) {
          return;
        }

        const dataController = editor.data;

        const modelFragment = dataController.toModel(
          _data.content,
          "$clipboardHolder"
        );

        if (modelFragment.childCount == 0) {
          return;
        }

        model.change(() => {
          model.insertContent(modelFragment);
        });
      }

      inputTransformation({
        content,
      });

      // view.scrollToTheSelection();
    }

    function _onCopyCut(type) {

      const content = editor.data.toView(
        editor.model.getSelectedContent(modelDocument.selection)
      );

      function clipboardOutput(_data) {
        if (!_data.content.isEmpty) {
          _data.dataTransfer.setData(
            "text/html",
            editor.data.htmlProcessor.toData(_data.content)
          );
          _data.dataTransfer.setData(
            "text/plain",
            viewToPlainText(_data.content)
          );
        }

        if (_data.method == "cut") {
          editor.model.deleteContent(modelDocument.selection);
        }
      }

      clipboardOutput({
        dataTransfer,
        content,
        method: type,
      });
    }

    if (typeCmd === "paste") {
      _onPaste();
    } else {
      _onCopyCut(typeCmd);
    }
  }
}
