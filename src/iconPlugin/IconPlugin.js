
import { Plugin, toWidget } from "../ckeditor";
import { cloneElem, createViewSvg } from "../utils/utils";

// Регистрируем новый тип элемента "iconSvg"
class IconPlugin extends Plugin {
  static get pluginName() {
    return "IconPlugin";
  }

  init() {
    const editor = this.editor;
console.log('IconPlugin');
    editor.model.schema.register("iconSvg", {
      allowAttributes: ["data-key", "data-name", "data-icon", "resizedWidth"],
      isObject: true,
      isInline: true,
      allowWhere: "$text",
    });

    editor.conversion.for("upcast").elementToElement({
      model: "iconSvg",
      view: {
        name: "span",
        classes: "ck-svg-widget",
      },
    });

    editor.conversion
      .for("editingDowncast")
      .add((dispatcher) => {
        attachDowncastConverter(dispatcher, "width", "width", true);
        attachDowncastConverter(dispatcher, "height", "height", true);
      })
      .elementToElement({
        model: "iconSvg",
        view: (modelElement, { writer }) => {
          const widgetElement = writer.createContainerElement("span", {
            class: "ck-svg-widget",
            style: 'width: 80px;'
          });

          const svgUIElement = createViewSvg(modelElement, { writer });
          if (svgUIElement) {
            writer.insert(
              writer.createPositionAt(widgetElement, 0),
              svgUIElement
            );
          }

          // hasSelectionHandle: true, 3 argm for toWidget, move widget editor
          console.log(widgetElement);
          return toWidget(widgetElement, writer);
        },
      })
      .attributeToAttribute({
        model: {
          name: "iconSvg",
          key: "resizedWidth",
        },
        view: (attributeValue) => {
          console.log("width1", attributeValue);
          return {
            key: "width",
            value: `${parseInt(attributeValue)}px`,
          };
        },
        converterPriority: "high",
      });

    editor.conversion
      .for("dataDowncast")
      .add((dispatcher) => {
        attachDowncastConverter(dispatcher, "width", "width", true);
        attachDowncastConverter(dispatcher, "height", "height", true);
      })
      .elementToElement({
        model: "iconSvg",
        view: (modelElement, { writer }) => {
          console.log("dataDowncast");
          console.log(modelElement.getAttribute("resizedWidth"));
          const svgUIElement = createViewSvg(modelElement, { writer });
          return cloneElem(writer, svgUIElement);
        },
      })
      .attributeToAttribute({
        model: {
          name: "iconSvg",
          key: "resizedWidth",
        },
        view: (attributeValue) => {
          console.log("width2", attributeValue);
          return {
            key: "width",
            value: `${parseInt(attributeValue)}px`,
          };
        },
        converterPriority: "high",
      });
  }
}

export default IconPlugin;

function attachDowncastConverter(dispatcher, viewAttributeName) {
  dispatcher.on(`attribute:resizedWidth:icon`, (evt, data, conversionApi) => {
    // console.log("dispatcher", evt, data, conversionApi);

    const viewWriter = conversionApi.writer;
    const viewElement = conversionApi.mapper.toViewElement(data.item);

    if (data.attributeNewValue !== null) {
      viewWriter.setAttribute(
        viewAttributeName,
        data.attributeNewValue,
        viewElement
      );
    } else {
      viewWriter.removeAttribute(viewAttributeName, viewElement);
    }

    const width = viewElement.getAttribute("width");

    // console.log("attachDowncastConverter", width, viewAttributeName, viewElement);
    viewWriter.setStyle(
      {
        width,
      },
      viewElement
    );
  });
}
