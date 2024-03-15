/* eslint-disable no-extra-boolean-cast */
// import { cloneElem } from "./utils";

import { ensureSafeUrl } from "../utils";

function createLinkElement(data, { writer }) {
  console.log("createLinkElement",data, { writer });
  let href;
  let text;
  if(data) {
    if(data.href) href = data.href;
    if(data.text) text = data.text;
  }
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
        
        const text =  children?.find?.(el => el.data)?.data || href

        try {
          console.log('viewElement', viewElement, children, {href, text}, Array.from(children));
          for (const child of children) {
            console.log('viewElement_child', child);
          }
          console.log('viewElement2', children?.find, children?.find?.(el => el.data), children?.find?.(el => el.data)?.data);
          children?.find?.(el => {
            console.log('viewElement3', el, el.data);
            return el.data})
        } catch (error) {
          console.log(error);
        }

        
        return {href, text};
      },
    },
    converterPriority: "high",
  });
}
