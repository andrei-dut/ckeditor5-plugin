// iconPickerPlugin.js
import { insertSymbol } from "./icons/insertSymbols";
import { ButtonView, Plugin, addToolbarToDropdown, createDropdown } from "../ckeditor";
// import { showModal } from "./roughnessModal";
// import { emitter, } from "./utils";
import InsertIconCommand from "./InsertIconCommand";
import { registerIconSvg } from "./registerIconSvg";
import { insertContentEvent } from "./insertContentEvent";
import "./styles/styles.css";
import { insertIconList } from "./iconLists";
// import { showBaseModal } from "./complexSvgModal";
import { addListItemInParent, moveListItemInParent, removeListItemInParent } from "./editorUtils";
// import IconPlugin from "../iconPlugin/IconPlugin";

function _isRangeToUpdate(range, allowedRanges) {
  for (const allowedRange of allowedRanges) {
    // A range is inside an element that will have the `linkHref` attribute. Do not modify its nodes.
    if (allowedRange.containsRange(range)) {
      return false;
    }
  }

  return true;
}

function objectToMap(obj) {
  const map = new Map();

  for (const key in obj) {
    map.set(key, obj[key]);
  }

  return map;
}

function toMap(data) {
  if (Object.prototype.toString.call(data) === '[object Map]') {
    return data;
  } else if (Array.isArray(data) || typeof data === 'string') {
    throw new Error('Invalid argument: data must be an iterable or an object');
  } else {
    return objectToMap(data);
  }
}


function _findBound(position, attributeName, value, lookBack, model) {
  // Get node before or after position (depends on `lookBack` flag).
  // When position is inside text node then start searching from text node.
  let node =
    position.textNode ||
    (lookBack ? position.nodeBefore : position.nodeAfter);

  let lastNode = null;

  while (node && node.getAttribute(attributeName) == value) {
    lastNode = node;
    node = lookBack ? node.previousSibling : node.nextSibling;
  }

  return lastNode
    ? model.createPositionAt(lastNode, lookBack ? "before" : "after")
    : position;
}

function findAttributeRange(position, attributeName, value, model) {
  return model.createRange(
    _findBound(position, attributeName, value, true, model),
    _findBound(position, attributeName, value, false, model)
  );
}

function setLink(editor) {
  const href = 'dfdfdfd'
  const manualDecoratorIds = {};
  const model = editor.model;
  const selection = model.document.selection;
  // Stores information about manual decorators to turn them on/off when command is applied.
  const truthyManualDecorators = [];
  const falsyManualDecorators = [];

  for (const name in manualDecoratorIds) {
    if (manualDecoratorIds[name]) {
      truthyManualDecorators.push(name);
    } else {
      falsyManualDecorators.push(name);
    }
  }

  model.change((writer) => {
    console.log(selection.isCollapsed);
    // isCollapsed false if simple set cursor without selected content
    // If selection is collapsed then update selected link or insert new one at the place of caret.
    if (selection.isCollapsed) {
      const position = selection.getFirstPosition();

      // When selection is inside text with `linkHref` attribute.
      if (selection.hasAttribute("linkHref")) {
        // Then update `linkHref` value.
        const linkRange = findAttributeRange(
          position,
          "linkHref",
          selection.getAttribute("linkHref"),
          model
        );

        writer.setAttribute("linkHref", href, linkRange);

        truthyManualDecorators.forEach((item) => {
          writer.setAttribute(item, true, linkRange);
        });

        falsyManualDecorators.forEach((item) => {
          writer.removeAttribute(item, linkRange);
        });

        // Put the selection at the end of the updated link.
        writer.setSelection(
          writer.createPositionAfter(linkRange.end.nodeBefore)
        );
      }
      // If not then insert text node with `linkHref` attribute in place of caret.
      // However, since selection is collapsed, attribute value will be used as data for text node.
      // So, if `href` is empty, do not create text node.
      else if (href !== "") {
        const attributes = toMap(selection.getAttributes());

        attributes.set("linkHref", href);

        truthyManualDecorators.forEach((item) => {
          attributes.set(item, true);
        });

        const { end: positionAfter } = model.insertContent(
          writer.createText(href, attributes),
          position
        );

        // Put the selection at the end of the inserted link.
        // Using end of range returned from insertContent in case nodes with the same attributes got merged.
        writer.setSelection(positionAfter);
      }

      // Remove the `linkHref` attribute and all link decorators from the selection.
      // It stops adding a new content into the link element.
      [
        "linkHref",
        ...truthyManualDecorators,
        ...falsyManualDecorators,
      ].forEach((item) => {
        writer.removeSelectionAttribute(item);
      });
    } else {
      console.log('callpsed false');
      // If selection has non-collapsed ranges, we change attribute on nodes inside those ranges
      // omitting nodes where the `linkHref` attribute is disallowed.
      const ranges = model.schema.getValidRanges(
        selection.getRanges(),
        "linkHref"
      );

      // But for the first, check whether the `linkHref` attribute is allowed on selected blocks (e.g. the "image" element).
      const allowedRanges = [];

      for (const element of selection.getSelectedBlocks()) {
        if (model.schema.checkAttribute(element, "linkHref")) {
          allowedRanges.push(writer.createRangeOn(element));
        }
      }

      // Ranges that accept the `linkHref` attribute. Since we will iterate over `allowedRanges`, let's clone it.
      const rangesToUpdate = allowedRanges.slice();

      // For all selection ranges we want to check whether given range is inside an element that accepts the `linkHref` attribute.
      // If so, we don't want to propagate applying the attribute to its children.
      for (const range of ranges) {
        if (_isRangeToUpdate(range, allowedRanges)) {
          rangesToUpdate.push(range);
        }
      }

      for (const range of rangesToUpdate) {
        console.log("item",href, range);
        writer.setAttribute("linkHref", href, range);

        truthyManualDecorators.forEach((item) => {
       
          writer.setAttribute(item, true, range);
        });

        falsyManualDecorators.forEach((item) => {
          writer.removeAttribute(item, range);
        });
      }
    }
  });
}

export class IconPickerPlugin extends Plugin {
  static get pluginName() {
    return "IconPickerPlugin";
  }

  init() {
    const editor = this.editor;
    let newSelection;
    document.getElementById("addButton").addEventListener("click", function () {
      if (newSelection) {
        addListItemInParent(newSelection, editor);
      }
    });

    document.getElementById("moveUpButton").addEventListener("click", function () {
      if (newSelection) {
        moveListItemInParent(newSelection, "up", editor);
      }
    });

    document.getElementById("removeButton").addEventListener("click", function () {
      removeListItemInParent(newSelection, editor);
    });

    document.getElementById("moveDownButton").addEventListener("click", function () {
      if (newSelection) {
        moveListItemInParent(newSelection, "down", editor);
      }
      console.log("down", newSelection);
    });

    // console.log('WidgetResize',editor.plugins.get("WidgetResize"));
    // console.log(editor.editing.view._observers.get(1));
    // editor.editing.view.addObserver(SelectionObserver)

    editor.editing.view.document.selection.on("change", (event) => {
      newSelection = event.source;
      if (newSelection) {
        // moveListItemInParent(newSelection)
      }
      // console.log("selectionChange", event);
    });

    registerIconSvg(editor);
    insertContentEvent.call(this, editor);

    editor.commands.add("insertIcon", new InsertIconCommand(editor));


    editor.set( 'isDelegateLink', true );
    console.log(editor);

    editor.ui.componentFactory.add("iconPickerButton", (locale) => {
      const buttons = insertIconList.map((icon) => {
        const listItem = new ButtonView();

        listItem.set({
          label: icon.label,
          icon: icon.icon,
        });

        // function insertIconFc(svgEl, isSimpleSymbol) {
        //   const insertIconCmd = editor.commands.get("insertIcon");

        //   if (insertIconCmd) {
        //     insertIconCmd.execute(
        //       isSimpleSymbol
        //         ? {
        //             key: "simpleSymbol",
        //             iconName: icon.iconName,
        //             icon: icon.icon,
        //           }
        //         : {
        //             key: isSimpleSymbol
        //               ? "simpleSymbol"
        //               : icon.isComplexSymbol
        //               ? "complexSymbol"
        //               : "roughnessSymbol",
        //             iconName: icon.iconName,
        //             icon: svgEl,
        //           }
        //     );
        //   }
        //   editor.editing.view.focus();
        //   emitter.off("insertIcon", insertIconFc);
        // }

        listItem.on("execute", () => {
          setLink(editor)
          // if (icon.isRoughness) {
          //   showModal();
          // } else if (icon.isComplexSymbol) {
          //   showBaseModal(icon.icon);
          // } else {
          //   insertIconFc(icon.icon, true);
          //   return;
          // }
          // emitter.on("insertIcon", insertIconFc);

          // editor.execute(
          //   "link",
          //   'test url',
          // );

          // dropdown.hide();
        });
        listItem.delegate( 'execute' ).to( editor, 'lala' );
        return listItem;
      });

      const toolbarDropdown = createDropdown(locale);
      toolbarDropdown.buttonView.set({
        icon: insertSymbol,
        class: "icon-picker-button",
      });
      toolbarDropdown.class = "toolbar-insert-symbol";
      addToolbarToDropdown(toolbarDropdown, buttons);
      //   toolbarDropdown.render();
      return toolbarDropdown;
    });
  }
}
