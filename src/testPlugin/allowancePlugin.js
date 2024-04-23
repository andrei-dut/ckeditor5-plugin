import { Plugin, toWidget } from "../ckeditor";
import {
  getModelElement,
  getTextFromElement,
  viewToModelElem,
} from "../customPlugins/editorUtils";
import "./test.css";

export class AllowancePlugin extends Plugin {
  static get pluginName() {
    return "AllowancePlugin";
  }

  static get requires() {
    return [];
  }

  init() {
    const editor = this.editor;
    this._defineConversion();
    this._defineSchema();

    this.listenTo(editor.editing.view.document, "click", () => {
      const view = editor.editing.view;
      const selection = view.document.selection;
      const selectedElement = selection.getSelectedElement();

      if (!selectedElement?.hasClass("aw-req-allowance")) {
        return;
      }
      const modelSpans = getModelElement(
        editor,
        viewToModelElem(editor, selectedElement),
        "allowanceText",
        true
      );
      modelSpans.forEach((span, i) => {
        editor.model.change((writer) => {
          writer.remove(span.getChild(0));
          writer.insertText(`R${i}`, span);
        });

        const text = getTextFromElement(span);
        console.log(221, span, text);
      });
    });

  }

  _defineSchema() {
    const schema = this.editor.model.schema;

    schema.register("allowanceText", {
      allowIn: ["paragraph", "allowance"],
      allowChildren: ["$text"],
    });

    schema.register("allowance", {
      allowIn: ["requirementBodyText", "paragraph"],
      allowChildren: ["allowanceText"],
      isInline: true,
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
        console.log("aw-req-allowance");
        const modelWriter = conversionApi.writer;
        return modelWriter.createElement("allowance", viewElement.getAttributes());
      },
      converterPriority: "high",
    });
    conversion.for("downcast").elementToElement({
      model: "allowance",
      view: (modelElement, conversionApi) => {
        console.log("allowance", modelElement.getAttributes());
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
        console.log("allowanceText");
        const modelWriter = conversionApi.writer;
        return modelWriter.createElement("allowanceText", viewElement.getAttributes());
      },
      converterPriority: "high",
    });
    conversion.for("downcast").elementToElement({
      model: "allowanceText",
      view: (modelElement, conversionApi) => {
        console.log("span_downcast");

        const viewWriter = conversionApi.writer;
        return viewWriter.createContainerElement("span", modelElement.getAttributes());
      },
    });
  }
}
