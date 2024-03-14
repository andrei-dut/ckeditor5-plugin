// import { cloneElem } from "./utils";

import { ensureSafeUrl } from "../utils";


function createLinkElement(href, { writer }) {

  const linkElement = writer.createAttributeElement(
    "a",
    { href },
    { priority: 6 }
  );
  writer.setCustomProperty("customLink", true, linkElement);

  return linkElement;
}

export function registerCustomLink(editor) {
  editor.model.schema.extend("$text", {
    allowAttributes: "customLink",
  });

  editor.conversion.for("dataDowncast").attributeToElement({
    model: "customLink",
    view: createLinkElement,
  });

  editor.conversion.for("editingDowncast").attributeToElement({
    model: "customLink",
    view: (href, conversionApi) => {
      return createLinkElement(ensureSafeUrl(href), conversionApi);
    },
  });

  editor.conversion.for("upcast").elementToAttribute({
    view: {
      name: "a",
      attributes: {
        href: true,
      },
    },
    model: {
      key: "customLink",
      value: (viewElement) => viewElement.getAttribute("href"),
    },
    converterPriority: 'high'
  });
}
