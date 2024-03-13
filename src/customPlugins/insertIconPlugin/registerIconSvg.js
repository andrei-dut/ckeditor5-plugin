import { toWidget } from "../../ckeditor";
import { viewToPlainText } from "../editorUtils";
import { cloneElem, createViewSvg, injectViewList } from "../utils";

export function registerIconSvg(editor) {
  const elementName = "iconSvg";

  if (!editor.model.schema.isRegistered(elementName)) {
    editor.model.schema.register(elementName, {
      isObject: true,
      isInline: true,
      allowWhere: "$text",
      allowAttributes: ["data-key", "data-name", "data-icon", "resizedWidth"],
    });
  }
  console.log(elementName, editor.model.schema.isRegistered(elementName));

  editor.conversion.for("upcast").elementToElement({
    model: (viewImage, { writer }) => {
      viewImage._setCustomProperty('li', true)
      console.log("upcast_LI", viewImage);
      return viewImage
    },
    view: {
      name: "li",
      attributes: {
        id: true,
      },
    },
    converterPriority: 'high'
  });

  editor.conversion.for("upcast").elementToElement({
    model: (viewImage, { writer }) => {
      console.log("upcast_A", viewImage);
    },
    view: {
      name: "a",
      attributes: {
        id: true,
        href: true,
      },
    },
  });

  // editor.conversion.for("upcast").elementToElement({
  //   model: (viewImage, { writer }) => {
  //     console.log("upcast", viewImage);
  //     // console.log("upcast22",editor.data.htmlProcessor.toData(viewImage));

  //   //   const svgElement = document.createElement("div");
  //   //   svgElement.innerHTML =
  //   //     `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100">
  //   //   <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
  //   //   <text id="y" x="45" y="28" fill="rgb(0, 0, 0)" font-family="Helvetica" font-size="12px"
  //   //   text-anchor="start">dfg sdf END <tspan>not</tspan></text>
  //   //   <text id="y" x="45" y="28" fill="rgb(0, 0, 0)" font-family="Helvetica" font-size="12px"
  //   //   text-anchor="start">SSSS</text>
  //   //   <rect x="15" y="15" width="70" height="70" stroke="black" stroke-width="3" fill="blue" />
  //   // </svg>`.trim(); // Используем .trim(), чтобы удалить начальные и конечные пробелы

  //   //   // Вставляем элемент SVG в body
  //   //   document.body.appendChild(svgElement.firstChild);

  //     // console.log("upcast22",viewToPlainText());

  //     // writer.createElement("imageBlock", {
  //     //   src: viewImage.getAttribute("src"),
  //     // });
  //   },
  //   view: {
  //     name: "svg",
  //     attributes: {
  //       viewBox: true,
  //     },
  //   },
  // });

  editor.conversion
    .for("editingDowncast")
    .elementToElement({
      model: elementName,
      view: (modelElement, conversionApi) => {
        const{ writer, mapper } = conversionApi;
        console.log("toWidget", writer);
        const widgetElement = writer.createContainerElement("span", {
          class: "ck-svg-widget",
          style: "width: 80px;height: 80px;border: 1px solid gray",
        });

        const svgUIElement = createViewSvg(modelElement, { writer, editor, mapper });
        console.log(
          "svgUIElement",
          svgUIElement,
          editor.editing.mapper.toModelElement(widgetElement),
        );
        if (svgUIElement) {
          writer.insert(
            writer.createPositionAt(widgetElement, 0),
            svgUIElement
          );
        }
        // injectViewList(modelElement, svgUIElement, conversionApi, editor.model);
        // hasSelectionHandle: true, 3 argm for toWidget, move widget editor
        // return widgetElement
        return toWidget(widgetElement, writer);
      },
      converterPriority: "high",
    })
    .attributeToAttribute({
      model: {
        name: elementName,
        key: "resizedWidth",
      },
      view: (attributeValue) => {
        return {
          key: "width",
          value: `${parseInt(attributeValue)}px`,
        };
      },
      converterPriority: "high",
    })
    .add((dispatcher) => {
      attachDowncastConverter(dispatcher, "width", "width", true);
      attachDowncastConverter(dispatcher, "height", "height", true);
    });

  editor.conversion
    .for("dataDowncast")
    .add((dispatcher) => {
      attachDowncastConverter(dispatcher, "width", "width", true);
      attachDowncastConverter(dispatcher, "height", "height", true);
    })
    .elementToElement({
      model: elementName,
      view: (modelElement, { writer }) => {
        console.log("cloneElem");
        const svgUIElement = createViewSvg(modelElement, { writer });
        return cloneElem(writer, svgUIElement);
      },
    })
    .attributeToAttribute({
      model: {
        name: elementName,
        key: "resizedWidth",
      },
      view: (attributeValue) => {
        return {
          key: "width",
          value: `${parseInt(attributeValue)}px`,
        };
      },
      converterPriority: "high",
    });
}

function attachDowncastConverter(dispatcher, viewAttributeName) {
  dispatcher.on(
    `attribute:resizedWidth:iconSvg`,
    (evt, data, conversionApi) => {
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
    }
  );
}
