import { Command } from "../../ckeditor";
import {
  findAllElementsByName,
  getEditElemByClassFromSelection,
  getModelElement,
  getNextSibling,
  getPreviousSibling,
  getTextFromElement,
  isParentRoot,
  updateMarkers,
} from "../editorUtils";
import { getLastElemFromArray, incrementWithLetter } from "../utils";

export default class CustomListCommand extends Command {

  levelUpReq(parent) {
    const editor = this.editor;
    editor.model.change((writer) => {
      const prevSibling = getPreviousSibling(parent);
      if (prevSibling?.name !== "requirement") {
        return;
      }
      const lastChild = getLastElemFromArray(
        findAllElementsByName(editor, "requirement", null, prevSibling)
      );
      const prevRequirementContent = getModelElement(editor, prevSibling, "requirementContent");
      writer.move(writer.createRangeOn(parent), lastChild || prevRequirementContent, "after");
    });
    updateMarkers(editor,parent);
    updateMarkers(editor,parent?.parent);
  }

  leveDownReq(parent) {
    const editor = this.editor;
    editor.model.change((writer) => {
      if (parent && !isParentRoot(parent) && parent.parent?.name === "requirement") {
        writer.move(writer.createRangeOn(parent), parent.parent, "after");
        return;
      }
    });
    updateMarkers(editor,parent);
  }

  removeReq(parent) {
    const editor = this.editor;
    editor.model.change((writer) => {
      if (parent) {
        writer.remove(parent);
        return;
      }
    });
    updateMarkers(editor,parent);
  }

  moveUpReq(parent) {
    const editor = this.editor;
    editor.model.change((writer) => {
      const prevSibling = getPreviousSibling(parent);
      if (prevSibling?.name !== "requirement") {
        return;
      }
      writer.move(writer.createRangeOn(parent), prevSibling, "before");
      updateMarkers(editor,parent);
    });
  }

  moveDownReq(parent) {
    const editor = this.editor;
    editor.model.change((writer) => {
      const nextSibling = getNextSibling(parent);
      if (nextSibling?.name !== "requirement") {
        return;
      }
      writer.move(writer.createRangeOn(parent), nextSibling, "after");
    });
    updateMarkers(editor,parent);
  }

  createNewReq(options) {
    const editor = this.editor;
    const _req = options.after
      ? options.after
      : getLastElemFromArray(findAllElementsByName(editor, "requirement", true));
    const reqMarker = getTextFromElement(getModelElement(editor, _req, "span"));
    let newReq;

    editor.model.change((writer) => {
      let insertPosition = null;

      newReq = writer.createElement("requirement", {
        class: "requirement",
        objecttype: "Requirement",
        id: getRandomId(),
      });

      const requirementMarker = _createMarkerWidget(writer, incrementWithLetter(reqMarker || 0));
      const requirementContent = writer.createElement("requirementContent");
      const requirementBodyText = writer.createElement("requirementBodyText", {
        class: "aw-requirement-bodytext",
      });

      writer.insert(requirementBodyText, writer.createPositionAt(requirementContent, 0));
      writer.insert(requirementMarker, writer.createPositionAt(newReq, 0));
      writer.insert(requirementContent, writer.createPositionAt(newReq, 1));

      insertPosition = _req
        ? writer.createPositionAfter(_req)
        : writer.createPositionAt(editor.model.document.getRoot(), "end");

      editor.model.insertContent(newReq, insertPosition);
    });

    return newReq;
  }

  execute(_options) {
    const editor = this.editor;

    const options = { after: "", ..._options };
    const editElem = getEditElemByClassFromSelection(editor, "requirement");

    const t2 = editor.editing.mapper.toModelElement(editElem);
    options.after = t2;

    const parentRequirement = options.after;
    if (!parentRequirement) {
      console.warn("No parent requirement passed.");
    }

    editor.RATData.isNewRequirement = true;

    switch (options.type) {
      case "moveUp":
        this.moveUpReq(parentRequirement);
        break;
      case "moveDown":
        this.moveDownReq(parentRequirement);
        break;
      case "levelUp":
        this.levelUpReq(parentRequirement);
        break;
      case "remove":
        this.removeReq(parentRequirement);
        break;
      case "levelDown":
        this.leveDownReq(parentRequirement);
        break;

      case "addNew": {
        const req = this.createNewReq(options);
        if (req) {
          updateMarkers(editor,req);
          scrollToNewWidget(req, editor);
        }
        break;
      }
      default:
        break;
    }
  }
}

const scrollToNewWidget = function (requirement, editor) {
  try {
    const view = editor.editing.view;
    const newselection = view.createSelection(editor.editing.mapper.toViewElement(requirement), 0, {
      fake: true,
    });
    view.document.selection._setTo(newselection);
    view.scrollToTheSelection();
  } catch (error) {
    console.warn(error);
  }
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