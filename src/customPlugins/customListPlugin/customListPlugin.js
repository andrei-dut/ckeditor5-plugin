import { ButtonView, Plugin,   } from "../../ckeditor";
import CustomLiCommand from "./customLiCommand";
import {
  _defineContentConversion,
  _defineMarkerConversion,
  _defineRequirementConversion,
} from "./customLiConversion";

let editor;
export default class CustomListPlugin extends Plugin {
  init() {
    editor = this.editor;
    this.editor.RATData = {};
    this._defineSchema();
    this._defineConversion();

    editor.commands.add("insertCustomLi", new CustomLiCommand(editor));

    function createNewRequirement(data, cancel, option) {
      // var requirementAncestor = getNestedEditable( data.domTarget );
      const requirementAncestor = true;
      if (!requirementAncestor) {
        return;
      }
      const eventdata = { after: "", ...option };
      let t1 = editor.editing.view.document.selection.editableElement.parent?.parent;
console.log('editEl', editor.editing.view.document.selection.editableElement);
      if (t1 && !t1?.hasClass("requirement")) {
        t1 = t1.parent;
      }
      const t2 = editor.editing.mapper.toModelElement(t1);
      eventdata.after = t2;

      editor.execute("insertCustomLi", eventdata);
      cancel?.();
    }

    editor.ui.componentFactory.add("customList", (locale) => {
      const button = new ButtonView(locale);

      button.set({
        label: "Numbered List",
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 7H6V5H4V7ZM4 11H6V9H4V11ZM4 15H6V13H4V15ZM10 5V7H20V5H10ZM10 9V11H20V9H10ZM10 13V15H20V13H10ZM6 19V17H4V19H6ZM8 17H18V19H8V17ZM22 3V21H2V3H22Z"/></svg>',
        tooltip: true,
      });

      button.on("execute", () => {
        createNewRequirement(undefined, undefined, { type: "CHILD" });
        // createNewRequirement( data, cancel, {type: 'SIBLING'} );
      });

      return button;
    });

    // function handleKeystrokeEvents() {
    //     editor.keystrokes.set( 'Ctrl+Enter', ( data, cancel ) => {
    //         createNewRequirement( data, cancel, 'SIBLING' );
    //     } );
    //     editor.keystrokes.set( 'Shift+Enter', ( data, cancel ) => {
    //         createNewRequirement( data, cancel, 'CHILD' );
    //     } );
    // }

    editor.model.document.on("change", () => {
    //   const selection = editor.model.document.selection;
    //   const blocks = selection.getSelectedBlocks();
    //   console.log("change_cusLi", blocks);
    });

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
        "itemtype",
        "parentid",
        "parenttype",
        "siblingid",
        "siblingtype",
        "parentitemtype",
        "contenteditable",
        "revisionid",
        "top_line",
        "style",
        "checkedoutby",
        "checkedouttime",
      ],
      isObject: true,
      isBlock: true,
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

    editor.conversion.attributeToAttribute({
      model: {
        name: "requirement",
        key: "parentid",
      },
      view: {
        name: "div",
        key: "parentid",
      },
    });

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
