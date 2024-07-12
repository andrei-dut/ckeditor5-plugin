import { ensureSafeUrl } from "../utils";

function createLinkElement(data, { writer }) {
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
      class: "custom-link-position",
      "data-json": JSON.stringify({ name: "customLinkPosition", value: text }),
    },
    { priority: 5 }
  );
  writer.setCustomProperty("customLinkPosition", true, linkElement);

  return linkElement;
}

export function registerCustomLink(editor) {
  editor.model.schema.extend("$text", {
    allowAttributes: ["customLinkPosition", "linkLabel"],
  });

  editor.conversion.for("dataDowncast").attributeToElement({
    model: "customLinkPosition",
    view: createLinkElement,
  });

  editor.conversion.for("editingDowncast").attributeToElement({
    model: "customLinkPosition",
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
        class: "custom-link-position",
      },
    },
    model: {
      key: "customLinkPosition",
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
