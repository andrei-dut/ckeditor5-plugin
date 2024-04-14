import { Command } from "../../ckeditor";
import { findAllElementsByName, getModelElement, getTextFromElement } from "../editorUtils";
import { getLastElemFromArray, incrementWithLetter } from "../utils";

export default class CustomLiCommand extends Command {
  _createNewWidget(widgetMetaData) {
    const editor = this.editor;

    const prevRequirement = widgetMetaData.prevWidget;
    let requirement;

    editor.model.change((writer) => {
      let insertPosition = null;

      requirement = writer.createElement("requirement", {
        class: "requirement",
        parentid: prevRequirement.getAttribute("id"),
        itemtype: "Requirement",
        objecttype: "Requirement",
        parenttype: prevRequirement.getAttribute("itemtype"),
        id: getRandomId(),
      });

      const requirementContent = writer.createElement("requirementContent");
      const requirementBodyText = writer.createElement("requirementBodyText", {
        class: "aw-requirement-bodytext",
      });

      writer.insert(requirementBodyText, writer.createPositionAt(requirementContent, 0));

      insertPosition = writer.createPositionAfter(prevRequirement);

      const requirementMarker = _createMarkerWidget(
        writer,
        incrementWithLetter(widgetMetaData.prevWidgetMarker)
      );
      writer.insert(requirementMarker, writer.createPositionAt(requirement, 0));

      writer.insert(requirementContent, writer.createPositionAt(requirement, 1));

      editor.model.insertContent(requirement, insertPosition);
    });
    return requirement;
  }

  getNewWidgetMetaData(editor, options, callback) {
    let _isChild;
    let _isSibling;
    let prevWidget;
    let prevWidgetMarker;
    // let _parentWidget;

    const parentWidget = options.after;

    prevWidget = parentWidget
      ? parentWidget
      : getLastElemFromArray(findAllElementsByName(editor, "requirement", true));
    // _parentWidget = parentWidget;
    _isSibling = options.type === "SIBLING";
    _isChild = options.type === "CHILD";
    prevWidgetMarker = getTextFromElement(getModelElement(editor, prevWidget, "span"));

    const widgetMetaData = {
      isChild: _isChild,
      isSibling: _isSibling,
      prevWidget,
      prevWidgetMarker,
    };

    console.log("widgetMetaData", widgetMetaData);

    callback(this, widgetMetaData);
    // this.editor.config.selectedRequirementWidget = null;
  }

  execute(options) {
    const editor = this.editor;

    const parentRequirement = options.after;
    if (!parentRequirement) {
      console.warn("No parent requirement passed.");
    }

    // inserting RAT data for toggle Button
    editor.RATData.isNewRequirement = true;

    this.getNewWidgetMetaData(editor, options, function (obj, widgetMetaData) {
      let req = obj._createNewWidget(widgetMetaData);
      scrollToNewWidget(req, editor);
    });
  }
}

const scrollToNewWidget = function (requirement, editor) {
  let view = editor.editing.view;
  let reqDomElement = document.getElementById(requirement.getAttribute("id"));
  let reqViewElement = editor.editing.view.domConverter.domToView(reqDomElement);

  let newselection = view.createSelection(reqViewElement, 0, { fake: true });
  view.document.selection._setTo(newselection);
  view.scrollToTheSelection();
};

function getRandomId() {
  let randomId = Math.random().toString(36).substr(2, 10);
  return "RM::NEW::" + randomId;
}

function _createMarkerWidget(writer, marker) {
  let requirementMarker = writer.createElement("requirementMarker");
  let markerSpan = writer.createElement("span");
  writer.insertText(marker || "-", markerSpan);
  writer.insert(markerSpan, writer.createPositionAt(requirementMarker, 0));
  return requirementMarker;
}
