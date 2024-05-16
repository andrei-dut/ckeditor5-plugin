import { Plugin, toWidget } from "../../reqCkeditor.service";
import {
  createItemToolbar,
  executeEditorCmd,
  getModelElement,
  getTextFromElement,
  viewToModelElem,
} from "../editorUtils";
import { allowance } from "../icons/insertSymbols";
import { emitter } from "../utils";
import { showAllowanceModal } from "./allowanceModal";
import InsertAllowanceCommand from "./InsertAllowanceCommand";
import "../styles/allowance.css";

export class AllowancePlugin extends Plugin {
  static get pluginName() {
    return "AllowancePlugin";
  }

  static get requires() {
    return [];
  }

  destroy() {
    emitter.clearEvent("insertAllowance");
  }

  init() {
    const editor = this.editor;
    this._defineConversion();
    this._defineSchema();
    let modelSpans;

    editor.commands.add("insertAllowanceCmd", new InsertAllowanceCommand(editor));

    this.listenTo(editor.editing.view.document, "click", () => {
      const view = editor.editing.view;
      const selection = view.document.selection;
      const selectedElement = selection.getSelectedElement();

      if (!selectedElement?.hasClass("aw-req-allowance")) {
        return;
      }

      modelSpans = getModelElement(
        editor,
        viewToModelElem(editor, selectedElement),
        "allowanceText",
        true
      );
      const oldValues = {};
      modelSpans.forEach((span, i) => {
        const text = getTextFromElement(span);
        oldValues[i === 0 ? "x" : "y"] = text;
      });
      showAllowanceModal({ oldValues });
    });

    function insertAllowance(values) {
      if (modelSpans) {
        modelSpans.forEach((span, i) => {
          editor.model.change((writer) => {
            writer.remove(span.getChild(0));
            writer.insertText(`${i === 0 ? values.x : values.y}`, span);
          });
        });
      } else {
        executeEditorCmd(editor, "insertAllowanceCmd", values);
      }

      modelSpans = undefined;
    }

    emitter.on("insertAllowance", insertAllowance);
    createItemToolbar(editor, "allowance", allowance, showAllowanceModal);
  }

  _defineSchema() {
    const schema = this.editor.model.schema;

    schema.register("allowanceText", {
      allowIn: ["paragraph", "allowance"],
      allowChildren: ["$text"],
      allowAttributes: ["class"],
    });

    schema.register("allowance", {
      allowIn: ["requirementBodyText", "paragraph"],
      allowChildren: ["allowanceText"],
      isInline: true,
      allowAttributes: ["class"],
    });

    // schema.extend("$text", { allowIn: ["span", "div"], allowAttributes: "highlight" });
    // schema.extend("$block", { allowIn: ["requirementContent", "requirementBodyText"] });
  }

  _defineConversion() {
    const conversion = this.editor.conversion;
    conversion.for("upcast").elementToElement({
      view: {
        name: "span",
        classes: "aw-req-allowance",
      },
      model: (viewElement, conversionApi) => {
        const modelWriter = conversionApi.writer;
        return modelWriter.createElement("allowance", viewElement.getAttributes());
      },
      converterPriority: "high",
    });
    conversion.for("downcast").elementToElement({
      model: "allowance",
      view: (modelElement, conversionApi) => {
        const viewWriter = conversionApi.writer;
        return toWidget(
          viewWriter.createContainerElement("span", modelElement.getAttributes()),
          viewWriter
        );
      },
    });



    conversion.for("editingDowncast").elementToElement({
      model: "allowance",
      view: (modelElement, conversionApi) => {
        const viewWriter = conversionApi.writer;
        const viewRequirement = viewWriter.createContainerElement(
          "span",
          modelElement.getAttributes()
        );
        return toWidget(viewRequirement, viewWriter);
      },
    });

    conversion.for("upcast").elementToElement({
      view: {
        name: "span",
        classes: "allowance-number",
      },
      model: (viewElement, conversionApi) => {
        const modelWriter = conversionApi.writer;
        return modelWriter.createElement("allowanceText", viewElement.getAttributes());
      },
      converterPriority: "high",
    });
    conversion.for("downcast").elementToElement({
      model: "allowanceText",
      view: (modelElement, conversionApi) => {
        const viewWriter = conversionApi.writer;
        return viewWriter.createContainerElement("span", modelElement.getAttributes());
      },
    });
  }
}
