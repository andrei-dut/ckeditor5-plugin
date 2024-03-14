// import { cloneElem } from "./utils";

import { ensureSafeUrl } from "../utils";

function createLinkElement(data, { writer }) {
  const {href, text} = data || {};
  const linkElement = writer.createAttributeElement(
    "a",
    { href, "data-text":  text},
    { priority: 5 }
  );
  writer.setCustomProperty("customLink", true, linkElement);

  return linkElement;
}

export function registerCustomLink(editor) {
  editor.model.schema.extend("$text", {
    allowAttributes: ["customLink", "linkLabel"],
  });

  editor.conversion.for("dataDowncast").attributeToElement({
    model: "customLink",
    view: createLinkElement,
  });

  editor.conversion.for("editingDowncast").attributeToElement({
    model: "customLink",
    view: (data, conversionApi) => {
      console.log(data);
      const { href, text } = data || {};
      return createLinkElement(
        { href: ensureSafeUrl(href), text },
        conversionApi
      );
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
      value: (viewElement) => {
        const children = viewElement.getChildren();
        const href = viewElement.getAttribute("href");
        console.log('viewElement', viewElement, children);
        const text =  children?.find?.(el => el.data)?.data || href
        return {href, text};
      },
    },
    converterPriority: "high",
  });
}
