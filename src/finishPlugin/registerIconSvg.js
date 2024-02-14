
import { toWidget } from "../ckeditor";
import { cloneElem, createViewSvg } from "./utils";


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
console.log(elementName,editor.model.schema.isRegistered(elementName));
    
    editor.conversion.for("upcast").elementToElement({
        model: elementName,
        view: {
          name: "span",
          classes: "ck-svg-widget",
        },
        
      });
  
      editor.conversion
        .for("editingDowncast")
        .elementToElement({
          model: elementName,
          view: (modelElement, { writer }) => {
            console.log("toWidget");
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
        })        .add((dispatcher) => {
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
            console.log('cloneElem');
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

    dispatcher.on(`attribute:resizedWidth:iconSvg`, (evt, data, conversionApi) => {
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
  
