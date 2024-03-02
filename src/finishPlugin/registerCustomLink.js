import { cloneElem } from "./utils";

export function registerCustomLink(editor) {
  const elementName = "customLink";

  if (!editor.model.schema.isRegistered(elementName)) {
    editor.model.schema.register(elementName, {
      isObject: true,
      isInline: true,
      allowWhere: "$text",
      allowAttributes: ["href", "text"],
    });
  }

  editor.conversion.for("upcast").elementToElement({
    model: elementName,
    view: {
      name: "a",
      classes: "ck-custom-link",
      attributes: {
        href: true,
        text: true,
      },
    },
  });

  editor.conversion
    .for("editingDowncast")
    .elementToElement({
      model: elementName,
      view: (modelElement, { writer }) => {
        const href = modelElement.getAttribute("href");
        const linkElement = writer.createContainerElement("a", {
          class: "ck-custom-link",
          href,
        });

        writer.setCustomProperty("customLink", true, linkElement);

        return linkElement
      },
      converterPriority: "high",
    })
    .attributeToAttribute({
      model: {
        name: elementName,
        key: "href",
      },
      view: (attributeValue) => {
        return {
          key: "href",
          value: attributeValue,
        };
      },
      converterPriority: "high",
    })
    .add((dispatcher) => {
      attachDowncastConverter(dispatcher, "width", "width", true);
    });

  editor.conversion
    .for("dataDowncast")
    .add((dispatcher) => {
      attachDowncastConverter(dispatcher, "width", "width", true);
    })
    .elementToElement({
      model: elementName,
      view: (modelElement, { writer }) => {
        console.log("cloneElem");
        return cloneElem(writer, modelElement);
      },
    })
    .attributeToAttribute({
      model: {
        name: elementName,
        key: "href",
      },
      view: (attributeValue) => {
        return {
          key: "href",
          value: attributeValue,
        };
      },
      converterPriority: "high",
    });
}

function attachDowncastConverter(dispatcher) {
  dispatcher.on(`attribute:href:customLink`, (evt, data, conversionApi) => {
    console.log("call_dispatch_href", evt, data, conversionApi);
    // console.log("dispatcher", evt, data, conversionApi);
  });
}
