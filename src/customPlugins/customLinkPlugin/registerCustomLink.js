/* eslint-disable no-extra-boolean-cast */
// import { cloneElem } from "./utils";

import { ensureSafeUrl } from "../utils";

function createLinkElement(data, { writer }) {
  // console.log("createLinkElement", data, { writer });
  let href;
  let text;
  if (data) {
    if (data.href) href = data.href;
    if (data.text) text = data.text;
  }
  const linkElement = writer.createAttributeElement(
    "a",
    {
      href,
      "data-text": text,
      class: "custom-link",
      "data-json": JSON.stringify({ name: "customLink", value: `<$LINK!”${text}”>` }),
    },
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
      const { href, text } = data || {};
      return createLinkElement({ href: ensureSafeUrl(href), text }, conversionApi);
    },
  });

  editor.conversion.for("upcast").elementToAttribute({
    view: {
      name: "a",
      attributes: {
        href: true,
        class: "custom-link",
      },
    },
    model: {
      key: "customLink",
      value: (viewElement) => {
        const href = viewElement.getAttribute("href");
        const _text = viewElement.getAttribute("data-text");
        const text = viewElement.getChildren()?.find?.((el) => el.data)?.data || _text || href;

        return { href, text };
      },
    },
    converterPriority: "high",
  });
}
