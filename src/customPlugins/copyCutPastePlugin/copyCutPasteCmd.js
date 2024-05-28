import { Command } from "../../reqCkeditor.service";
import { normalizeClipboardData, plainTextToHtml, viewToModelElem } from "../editorUtils";
import { dataTransfer } from "../manageDataTransfer";

export default class CopyCutPasteCmd extends Command {
  refresh() {
    this.isEnabled = true;
  }

  totalExecute({ typeCmd, contentIncludes, pasteCb, hardContent } = {}) {
    const editor = this.editor;
    const model = editor.model;

    function _onPaste(_hardContent) {
      let content = "";
      let contentString = "";

      if (!content) {
        if (dataTransfer.getData("text/html")) {
          content = normalizeClipboardData(dataTransfer.getData("text/html"));
        } else if (dataTransfer.getData("text/plain")) {
          content = plainTextToHtml(dataTransfer.getData("text/plain"));
        }
        const copyCutReq = window.localStorage.getItem("copyCutReq");
        if (!content?.includes(contentIncludes) && copyCutReq?.includes(contentIncludes)) {
          content = copyCutReq;
        }
        contentString = content;
      }

      if (_hardContent?.length) {
        content = hardContent;
      }

      content = (content || "").replace(`<divider/>`, "");
      content = editor.data.htmlProcessor.toView(content);

      function inputTransformation(_data) {
        if (_data.content.isEmpty) {
          return;
        }
        const dataController = editor.data;
        const modelFragment = dataController.toModel(_data.content, "$clipboardHolder");

        if (modelFragment.childCount == 0) {
          return;
        }

        if (pasteCb) {
          pasteCb(modelFragment);
        } else {
          model.change(() => {
            model.insertContent(modelFragment);
          });
        }
      }

      if (contentIncludes && !contentString?.includes(contentIncludes)) return;

      inputTransformation({
        content,
      });

      // view.scrollToTheSelection();
    }

    function _onCopyCut(type) {
      const reqsSelected = editor.plugins.get("CustomListPlugin")?._reqsSelected;
      let reqsSelectedHtmlString = "";

      if (reqsSelected?.length && !hardContent) {
        model.change((writer) => {
          reqsSelected.forEach((req, i, array) => {
            const modelReq = viewToModelElem(editor, req);
            const range = writer.createRange(
              writer.createPositionBefore(modelReq),
              writer.createPositionAfter(modelReq),
              {
                fake: true,
              }
            );
            const selection = writer.createSelection(range, { fake: true, label: "req" });
            const docFragmentFake = editor.data.toView(editor.model.getSelectedContent(selection));
            let contentHtmlString = editor.data.htmlProcessor.toData(docFragmentFake);

            if (contentIncludes && !contentHtmlString?.includes(contentIncludes)) return;

            contentHtmlString = (contentHtmlString || "").replace(`data-is-child="true"`, "");
            if (i < array.length - 1) contentHtmlString += "<divider/>";
            reqsSelectedHtmlString += contentHtmlString;

            if (type == "cut") {
              writer.remove(modelReq);
              return;
            }
          });
        });
        // console.log(
        //   "reqsSelectedHtmlString",
        //   reqsSelectedHtmlString,
        //   reqsSelectedHtmlString.split("<divider/>")
        // );
      }

      console.log("hardContent", hardContent);
      reqsSelectedHtmlString = hardContent?.length ? hardContent : reqsSelectedHtmlString;

      function clipboardOutput(_data) {
        if (!_data.contentHtmlString?.length) {
          return;
        }

        _data.dataTransfer.setData("text/html", _data.contentHtmlString);

        if (contentIncludes && _data.contentHtmlString?.includes(contentIncludes)) {
          window.localStorage.setItem("copyCutReq", _data.contentHtmlString);
        }
      }

      clipboardOutput({
        dataTransfer,
        contentHtmlString: reqsSelectedHtmlString,
        method: type,
      });
    }

    if (typeCmd === "paste") {
      _onPaste(hardContent);
    } else {
      _onCopyCut(typeCmd);
    }
  }

  executeForReadOnlyMode(args) {
    this.totalExecute(args);
  }

  execute(args) {
    this.totalExecute(args);
  }
}
