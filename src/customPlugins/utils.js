import EventEmitter from "./eventEmmitery";

export const emitter = new EventEmitter();

export function parseSvg(svgString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(`${svgString}`, "image/svg+xml");
  const svgElement = xmlDoc.documentElement;

  const svgAttributes = {};
  for (const attribute of svgElement.attributes) {
    svgAttributes[attribute.name] = attribute.value;
  }

  const match = svgString.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
  const svgContent = match ? match[1].trim() : "";

  return {
    attributes: svgAttributes,
    content: svgContent,
  };
}

export function getAttsAndContentFromElDom(element) {
  const attributesObject = element.attributes;

  const attributes = {};
  for (const attr of attributesObject) {
    attributes[attr.name] = attr.value;
  }

  const content = element.innerHTML;

  return { attributes, content };
}

export function createViewSvg(modelElement, { writer }) {
  const key = modelElement.getAttribute("data-key");
  const isSimpleSymbol = key === "simpleSymbol";
  const svgObj = isSimpleSymbol
    ? parseSvg(modelElement.getAttribute("data-icon"))
    : getAttsAndContentFromElDom(modelElement.getAttribute("data-icon")) || {};

  return writer.createRawElement(
    "svg",
    {
      class: `svg-${modelElement.getAttribute("data-name")}`,
      ...svgObj.attributes,
      width: "100%",
      height: "100%",
    },
    function (domElement) {
      domElement.innerHTML = svgObj.content;
    }
  );
}

export function cloneElem(viewWriter, sourceNode) {
  if (sourceNode.is("text")) {
    return viewWriter.createText(sourceNode.data);
  }
  if (sourceNode.is("element")) {
    if (sourceNode.is("emptyElement")) {
      return viewWriter.createEmptyElement(
        sourceNode.name,
        sourceNode.getAttributes()
      );
    }
    const element = viewWriter.createContainerElement(
      sourceNode.name,
      sourceNode.getAttributes()
    );
    for (const child of sourceNode.getChildren()) {
      viewWriter.insert(
        viewWriter.createPositionAt(element, "end"),
        cloneElem(viewWriter, child)
      );
    }
    return element;
  }

  // throw new Exception("Given node has unsupported type."); // eslint-disable-line no-undef
}

export function replaceTextInSvg(_svgString, replacement) {
  let svgString = _svgString;

  function replaceTemp(string, regex) {
    return string.replace(regex, (match, group) => {
      // match - это весь найденный тег <text>
      // group - это содержимое текста внутри тега
      return match.replace(group, replacement[group] || group);
    });
  }

  svgString = replaceTemp(svgString, /<text[^>]*>(.*?)<\/text>/g);
  svgString = replaceTemp(svgString, /<font[^>]*>(.*?)<\/font>/g);

  return svgString;
}

export function findTextTagInSVG(svgElement, value) {
  // Получаем все теги текста в SVG-элементе

  if (!svgElement) return null;

  const textElements = svgElement.querySelectorAll("text");

  // Проходим по всем найденным текстовым элементам
  for (const textElement of textElements) {
    // Получаем текст текущего элемента
    const id = textElement.id;

    // Если текст текущего элемента равен "121", возвращаем его
    if (id === value) {
      return textElement;
    }
  }

  // Если не найден элемент с текстом "121", возвращаем null
  return null;
}

export function openLinkInNewWindow(linkElement) {
  if (linkElement && linkElement.name === "a") {
    const href = linkElement.getAttribute("href");
    if (href) {
      window.open(href, "_blank");
    }
  }
}
let lastClickTime = 0;
let clickTimeout;

export function checkClick(cb) {

  const currentTime = new Date().getTime();

  if (currentTime - lastClickTime > 250) {
    clickTimeout = setTimeout(cb, 250);
  } else {
    clearTimeout(clickTimeout);
  }

  lastClickTime = currentTime;
} 

const SAFE_URL =
/^(?:(?:https?|ftps?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.:-]|$))/i;

const ATTRIBUTE_WHITESPACES =
/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205f\u3000]/g; // eslint-disable-line no-control-regex


function isSafeUrl(url) {
  const normalizedUrl = url.replace(ATTRIBUTE_WHITESPACES, "");

  return normalizedUrl.match(SAFE_URL);
}

export function ensureSafeUrl(url) {
  url = String(url);

  return isSafeUrl(url) ? url : "#";
}
