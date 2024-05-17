import { Plugin, toWidget } from "../../reqCkeditor.service";
import InsertAllowanceCommand from "./InsertParametrCommand";
import "../../customPlugins/styles/parametr.css";
import { createItemToolbar, executeEditorCmd, getTextFromElement } from "../editorUtils";
import { emitter } from "../utils";
import { showParametrModal } from "./parametrModal";

export class ParametrPlugin extends Plugin {
  static get pluginName() {
    return "ParametrPlugin";
  }

  static get requires() {
    return [];
  }

  destroy() {
    emitter.clearEvent("insertParametr");
  }

  init() {
    const editor = this.editor;
    this._defineConversion();
    this._defineSchema();

    editor.commands.add("insertParametrCmd", new InsertAllowanceCommand(editor));

    this.listenTo(editor.editing.view.document, "click", () => {
      const view = editor.editing.view;
      const selection = view.document.selection;
      const selectedElement = selection.getSelectedElement();

      if (!selectedElement?.hasClass("aw-req-parametrText")) {
        return;
      }
      
      const oldValues = {parametr: getTextFromElement(selectedElement) || '', type: selectedElement.getAttribute("data-type")};

      showParametrModal(oldValues);
    });

    function insertParametr(values) {
      executeEditorCmd(editor, "insertParametrCmd", values);
    }

    emitter.on("insertParametr", insertParametr);
    createItemToolbar(editor, "parametr", undefined, showParametrModal, '[123]');
  }

  _defineSchema() {
    const schema = this.editor.model.schema;

    schema.register("parametrText", {
      allowIn: ["paragraph",],
      allowChildren: ["$text"],
      allowAttributes: ["class", 'data-type'],
    });

    // schema.extend("$text", { allowIn: ["span", "div"], allowAttributes: "highlight" });
    // schema.extend("$block", { allowIn: ["requirementContent", "requirementBodyText"] });
  }

  _defineConversion() {
    const conversion = this.editor.conversion;
    conversion.for("upcast").elementToElement({
      view: {
        name: "span",
        classes: "aw-req-parametrText",
      },
      model: (viewElement, conversionApi) => {
        const modelWriter = conversionApi.writer;
        return modelWriter.createElement("parametrText", viewElement.getAttributes());
      },
      converterPriority: "high",
    });
    conversion.for("downcast").elementToElement({
      model: "parametrText",
      view: (modelElement, conversionApi) => {
        const viewWriter = conversionApi.writer;
        return toWidget(
          viewWriter.createContainerElement("span", modelElement.getAttributes()),
          viewWriter
        );
      },
    });



    conversion.for("editingDowncast").elementToElement({
      model: "parametrText",
      view: (modelElement, conversionApi) => {
        const viewWriter = conversionApi.writer;
        const viewRequirement = viewWriter.createContainerElement(
          "span",
          modelElement.getAttributes()
        );
        return toWidget(viewRequirement, viewWriter);
      },
    });
  }
}
