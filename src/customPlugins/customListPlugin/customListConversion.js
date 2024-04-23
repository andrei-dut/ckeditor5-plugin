import { Matcher, toWidget, toWidgetEditable } from "../../ckeditor";

export function _defineRequirementConversion(conversion) {
  conversion.for("upcast").elementToElement({
    view: {
      name: "div",
      classes: "requirement",
    },
    model: (viewElement, conversionApi) => {
      const modelWriter = conversionApi.writer;
      return modelWriter.createElement("requirement", viewElement.getAttributes());
    },
    converterPriority: "high",
  });

  conversion.for("editingDowncast").elementToElement({
    model: "requirement",
    view: (modelElement, conversionApi) => {
      const viewWriter = conversionApi.writer;
      const viewRequirement = viewWriter.createContainerElement(
        "div",
        modelElement.getAttributes()
      );
      viewWriter.setCustomProperty("requirement", true, viewRequirement);
      return toWidget(viewRequirement, viewWriter);
    },
  });

  conversion.for("dataDowncast").elementToElement({
    model: "requirement",
    view: (modelElement, conversionApi) => {
      const viewWriter = conversionApi.writer;
      return viewWriter.createContainerElement("div", modelElement.getAttributes());
    },
  });
}

export function _defineMarkerConversion(conversion) {
  conversion.for("upcast").elementToElement({
    model: "requirementMarker",
    view: {
      name: "div",
      classes: "aw-requirement-marker",
    },
    converterPriority: "high",
  });

  conversion.for("downcast").elementToElement({
    model: "requirementMarker",
    view: {
      name: "div",
      classes: "aw-requirement-marker",
    },
    converterPriority: "high",
  });

  conversion.for("upcast").elementToElement({
    view: "span",
    model: (viewElement, conversionApi) => {
      const modelWriter = conversionApi.writer;
      return modelWriter.createElement("span", viewElement.getAttributes());
    },
  });

  conversion.for("downcast").elementToElement({
    model: "span",
    view: (modelElement, conversionApi) => {
      const viewWriter = conversionApi.writer;
      return viewWriter.createContainerElement("span", {
        class: "aw-ckeditor-marker-element",
      });
    },
  });
}

export function _defineContentConversion(conversion) {
  conversion.for("upcast").elementToElement({
    view: {
      name: "div",
      classes: "aw-requirement-content",
    },
    model: (viewElement, conversionApi) => {
      const modelWriter = conversionApi.writer;
      return modelWriter.createElement("requirementContent", viewElement.getAttributes());
    },
    converterPriority: "high",
  });
  conversion.for("downcast").elementToElement({
    model: "requirementContent",
    view: (modelElement, conversionApi) => {
      const viewWriter = conversionApi.writer;
      return viewWriter.createContainerElement("div", { class: "aw-requirement-content" });
    },
  });

  _defineBodyTextConversion.call(this);
}

function _defineBodyTextConversion() {
    const conversion = this.editor.conversion;
    conversion.for("upcast").add((dispatcher) => {
      dispatcher.on(
        "element:div",
        (evt, data, conversionApi) => {
          const matcher = new Matcher({
            name: "div",
            classes: "aw-requirement-bodytext",
          });
          // This will be usually just one pattern but we support matchers with many patterns too.
          const match = matcher.match(data.viewItem);

          // If there is no match, this callback should not do anything.
          if (!match) {
            return;
          }

          const viewDiv = data.viewItem;

          conversionApi.consumable.consume(viewDiv, { name: true });

          const requirementBodyText = conversionApi.writer.createElement(
            "requirementBodyText",
            viewDiv.getAttributes()
          );

          conversionApi.writer.insert(requirementBodyText, data.modelCursor);

          conversionApi.convertChildren(
            viewDiv,
            conversionApi.writer.createPositionAt(requirementBodyText, 0)
          );
          data.modelRange = conversionApi.writer.createRange(
            conversionApi.writer.createPositionBefore(requirementBodyText),
            conversionApi.writer.createPositionAfter(requirementBodyText)
          );

          data.modelCursor = data.modelRange.end;
        },
        { priority: "high" }
      );
    });

    conversion.for("downcast").add((dispatcher) => {
      dispatcher.on(
        "insert:requirementBodyText",
        (evt, data, conversionApi) => {
          const viewWriter = conversionApi.writer;
          const requirementBodyText = data.item;

          conversionApi.consumable.consume(requirementBodyText, "insert");
          conversionApi.consumable.consume(
            requirementBodyText,
            "attribute:contenttype:requirementBodyText"
          );

          var viewBodyText;
          var bodyTextWidget;
          if (
            requirementBodyText.getAttribute("contenttype") === "READONLY" ||
            requirementBodyText.getAttribute("contenteditable") === "false"
          ) {
            viewBodyText = viewWriter.createContainerElement(
              "div",
              requirementBodyText.getAttributes()
            );
            bodyTextWidget = toWidget(viewBodyText, conversionApi.writer);
          } else {
            viewBodyText = viewWriter.createEditableElement(
              "div",
              requirementBodyText.getAttributes()
            );
            bodyTextWidget = toWidgetEditable(viewBodyText, conversionApi.writer);
          }

          const viewPosition = conversionApi.mapper.toViewPosition(data.range.start);
          conversionApi.writer.insert(viewPosition, bodyTextWidget);
          conversionApi.mapper.bindElements(requirementBodyText, viewBodyText);
        },
        { priority: "high" }
      );
    });

  }

export function getNestedEditable(node) {
  if (isRequirementWidget(node)) {
    return node;
  }
  return getNestedEditable(node.parentElement);
}

// Checks whether node is a requirement widget
function isRequirementWidget(node) {
  return hasClass(node, "requirement");
}
// Checks if element has given class
function hasClass(element, cls) {
  return (" " + element.className + " ").indexOf(" " + cls + " ") > -1;
}
