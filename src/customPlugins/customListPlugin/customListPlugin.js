import { Plugin } from "../../ckeditor";
import CustomListCommand from "./CustomListCommand";
import {
  _defineContentConversion,
  _defineMarkerConversion,
  _defineRequirementConversion,
} from "./customListConversion";
import "../styles/stylesCustomListPl.css";
import {
  findParent,
  modelToViewElem,
  viewToModelElem,
} from "../editorUtils";

let editor;
export class CustomListPlugin extends Plugin {
  init() {
    editor = this.editor;
    this.editor.RATData = {};
    this._defineSchema();
    this._defineConversion();

    editor.commands.add("insertCustomList", new CustomListCommand(editor));

    this.listenTo(editor.editing.view.document, "click", () => {
      const view = editor.editing.view;
      const selection = view.document.selection;
      const findReqElem = findParent(
        viewToModelElem(editor, selection.editableElement),
        "requirement",
        true
      );
        console.log("click", findReqElem, selection);

      if (findReqElem) {
        editor.fire("selectionReqElem", { value: modelToViewElem(editor, findReqElem) });
      }
    });

    // function handleKeystrokeEvents() {
    //     editor.keystrokes.set( 'Ctrl+Enter', ( data, cancel ) => {
    //         createNewRequirement( data, cancel, 'SIBLING' );
    //     } );
    //     editor.keystrokes.set( 'Shift+Enter', ( data, cancel ) => {
    //         createNewRequirement( data, cancel, 'CHILD' );
    //     } );
    // }

    [
      "click",
      "mousedown",
      "mouseup",
      "mousemove",
      "paste",
      "cut",
      "copy",
      "drop",
      "focus",
      "blur",
      "beforeinput",
      "keydown",
      "keyup",
    ].forEach((eventName) => {
      editor.editing.view.document.on(
        eventName,
        (evt, data) => {
          if (data.domTarget.matches("[data-cke-ignore-events], [data-cke-ignore-events] *")) {
            evt.stop();
          }
          if (evt.name === "keydown" || evt.name === "keyup") {
            var keyId = data.keyCode;
            var ctrl = data.ctrlKey;
            if (ctrl && keyId !== 17 && keyId === 86) {
              data.stopPropagation();
            }
            var selectedEle = null;
            if (evt.source.selection.isFake && evt.source.selection) {
              selectedEle = evt.source.selection.getSelectedElement();
            }
            if (selectedEle && selectedEle.hasClass("requirement")) {
              evt.stop();
            }
          }
        },
        { priority: 999999999 }
      );
    });
  }

  destroy() {
    super.destroy();
  }

  _defineSchema() {
    const schema = this.editor.model.schema;

    schema.register("requirement", {
      allowWhere: "$block",
      allowAttributes: [
        "class",
        "isspecification",
        "hastracelink",
        "id",
        "lmd",
        "objecttype",
        "siblingid",
        "siblingtype",
        "contenteditable",
        "revisionid",
        "top_line",
        "style",
        "checkedoutby",
        "checkedouttime",
        "data-custom_comment",
      ],
      isObject: true,
      isBlock: true,
      allowIn: "requirement",
    });

    schema.register("requirementMarker", {
      allowIn: "requirement",
      allowChildren: ["$text"],
    });

    schema.register("requirementContent", {
      allowIn: "requirement",
      allowContentOf: "$root",
      isLimit: true,
    });

    schema.register("requirementBodyText", {
      allowIn: ["requirementContent", "$root", "$block"],
      allowAttributes: [
        "class",
        "contenttype",
        "contenteditable",
        "isdirty",
        "isBasedon",
        "isderived",
        "masterreqname",
        "masterReqUid",
        "basedOnMasterReqName",
        "basedonmasterreqid",
      ],
      allowContentOf: "$root",
      isLimit: true,
    });

    schema.register("span", {
      allowIn: ["requirementMarker"],
      allowAttributes: [],
    });

    // Allow requirements in the model to have all attributes.
    schema.addAttributeCheck((context) => {
      if (context.endsWith("$text") || context.endsWith("division")) {
        return true;
      }
    });
    //extend list schema to support id,style and class attributes
    schema.extend("listItem", {
      inheritAllFrom: "$block",
      allowAttributes: ["id", "class", "listStyle"],
      allowIn: ["tocWidget"],
    });
    editor.conversion.for("upcast").attributeToAttribute({
      model: {
        name: "listItem",
        key: "listStyle",
      },
      view: {
        name: "li",
        key: "style",
        value: /[\s\S]+/,
      },
    });

    //Fix for bullets and numbering issue
    //if style attribute added on ListItem, it throws as exception. This function removed the style attribute
    editor.conversion.for("downcast").add((dispatcher) => {
      // eslint-disable-next-line no-unused-vars
      dispatcher.on("attribute:style:listItem", (evt, data, conversionApi) => {
        if (data.item.getAttribute("style")) {
          data.item._removeAttribute("style");
        }
      });
    });

    editor.conversion.for("downcast").add(
      (dispatcher) => {
        dispatcher.on("attribute:listStyle:listItem", (evt, data, conversionApi) => {
          const viewElement = conversionApi.mapper.toViewElement(data.item);

          conversionApi.writer.setAttribute("style", data.attributeNewValue, viewElement);
        });
      },
      { priority: "highest" }
    );

    editor.conversion.attributeToAttribute({
      model: {
        name: "listItem",
        key: "id",
      },
      view: {
        name: "li",
        key: "id",
      },
    });

    editor.conversion.attributeToAttribute({
      model: {
        name: "listItem",
        key: "class",
        values: ["tocunderlineonhover"],
      },
      view: {
        tocunderlineonhover: {
          name: "li",
          key: "class",
          value: "aw-requirement-tocUnderlineOnHover",
        },
      },
    });

    editor.conversion.attributeToAttribute({
      model: {
        name: "requirement",
        key: "id",
      },
      view: {
        name: "div",
        key: "id",
      },
    });

    // editor.conversion.attributeToAttribute({
    //   model: {
    //     name: "requirement",
    //     key: "parentid",
    //   },
    //   view: {
    //     name: "div",
    //     key: "parentid",
    //   },
    // });

    schema.extend("$text", { allowIn: ["span", "div"], allowAttributes: "highlight" });
    schema.extend("$block", { allowIn: ["requirementContent", "requirementBodyText"] });
  }

  _defineConversion() {
    const conversion = this.editor.conversion;

    _defineRequirementConversion.call(this, conversion, editor);
    _defineMarkerConversion.call(this, conversion);
    _defineContentConversion.call(this, conversion);
  }
}
