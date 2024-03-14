import EventEmitter from "./eventEmmitery";

export const emitter = new EventEmitter();

function mergeViewLists(viewWriter, firstList, secondList) {
  // Check if two lists are going to be merged.
  if (
    !firstList ||
    !secondList ||
    (firstList.name != "ul" && firstList.name != "ol")
  ) {
    return null;
  }

  // Both parameters are list elements, so compare types now.
  if (
    firstList.name != secondList.name ||
    firstList.getAttribute("class") !== secondList.getAttribute("class")
  ) {
    return null;
  }

  return viewWriter.mergeContainers(
    viewWriter.createPositionAfter(firstList)
  );
}

function getSiblingListItem(modelItem, options) {
  const sameIndent = !!options.sameIndent;
  const smallerIndent = !!options.smallerIndent;
  const indent = options.listIndent;

  let item = modelItem;

  while (item && item.name == "listItem") {
    const itemIndent = item.getAttribute("listIndent");

    if (
      (sameIndent && indent == itemIndent) ||
      (smallerIndent && indent > itemIndent)
    ) {
      return item;
    }

    if (options.direction === "forward") {
      item = item.nextSibling;
    } else {
      item = item.previousSibling;
    }
  }

  return null;
}

function findNestedList(viewElement) {
  for (const node of viewElement.getChildren()) {
    if (node.name == "ul" || node.name == "ol") {
      return node;
    }
  }

  return null;
}

function positionAfterUiElements(viewPosition) {
  return viewPosition.getLastMatchingPosition((value) =>
    value.item.is("uiElement")
  );
}

export function injectViewList(modelItem, injectedItem, conversionApi, model) {
  const injectedList = injectedItem.parent;
  const mapper = conversionApi.mapper;
  const viewWriter = conversionApi.writer;

  // The position where the view list will be inserted.
  let insertPosition = mapper.toViewPosition(
    model.createPositionBefore(modelItem)
  );

  // 1. Find the previous list item that has the same or smaller indent. Basically we are looking for the first model item
  // that is a "parent" or "sibling" of the injected model item.
  // If there is no such list item, it means that the injected list item is the first item in "its list".
  const refItem = getSiblingListItem(modelItem.previousSibling, {
    sameIndent: true,
    smallerIndent: true,
    listIndent: modelItem.getAttribute("listIndent"),
  });
  const prevItem = modelItem.previousSibling;

  if (
    refItem &&
    refItem.getAttribute("listIndent") ==
      modelItem.getAttribute("listIndent")
  ) {
    // There is a list item with the same indent - we found the same-level sibling.
    // Break the list after it. The inserted view item will be added in the broken space.
    const viewItem = mapper.toViewElement(refItem);
    insertPosition = viewWriter.breakContainer(
      viewWriter.createPositionAfter(viewItem)
    );
  } else {
    // There is no list item with the same indent. Check the previous model item.
    if (prevItem && prevItem.name == "listItem") {
      // If it is a list item, it has to have a lower indent.
      // It means that the inserted item should be added to it as its nested item.
      insertPosition = mapper.toViewPosition(
        model.createPositionAt(prevItem, "end")
      );

      // There could be some not mapped elements (eg. span in to-do list) but we need to insert
      // a nested list directly inside the li element.
      const mappedViewAncestor =
        mapper.findMappedViewAncestor(insertPosition);
      const nestedList = findNestedList(mappedViewAncestor);

      // If there already is some nested list, then use it's position.
      if (nestedList) {
        insertPosition = viewWriter.createPositionBefore(nestedList);
      } else {
        // Else just put new list on the end of list item content.
        insertPosition = viewWriter.createPositionAt(
          mappedViewAncestor,
          "end"
        );
      }
    } else {
      // The previous item is not a list item (or does not exist at all).
      // Just map the position and insert the view item at the mapped position.
      insertPosition = mapper.toViewPosition(
        model.createPositionBefore(modelItem)
      );
    }
  }

  insertPosition = positionAfterUiElements(insertPosition);

  // Insert the view item.
  viewWriter.insert(insertPosition, injectedList);

  // 2. Handle possible children of the injected model item.
  if (prevItem && prevItem.name == "listItem") {
    const prevView = mapper.toViewElement(prevItem);

    const walkerBoundaries = viewWriter.createRange(
      viewWriter.createPositionAt(prevView, 0),
      insertPosition
    );
    const walker = walkerBoundaries.getWalker({
      ignoreElementEnd: true,
    });

    for (const value of walker) {
      if (value.item.is("element", "li")) {
        const breakPosition = viewWriter.breakContainer(
          viewWriter.createPositionBefore(value.item)
        );
        const viewList = value.item.parent;

        const targetPosition = viewWriter.createPositionAt(
          injectedItem,
          "end"
        );
        mergeViewLists(
          viewWriter,
          targetPosition.nodeBefore,
          targetPosition.nodeAfter
        );
        viewWriter.move(
          viewWriter.createRangeOn(viewList),
          targetPosition
        );

        walker.position = breakPosition;
      }
    }
  } else {
    const nextViewList = injectedList.nextSibling;

    if (
      nextViewList &&
      (nextViewList.is("element", "ul") ||
        nextViewList.is("element", "ol"))
    ) {
      let lastSubChild = null;

      for (const child of nextViewList.getChildren()) {
        const modelChild = mapper.toModelElement(child);

        if (
          modelChild &&
          modelChild.getAttribute("listIndent") >
            modelItem.getAttribute("listIndent")
        ) {
          lastSubChild = child;
        } else {
          break;
        }
      }

      if (lastSubChild) {
        viewWriter.breakContainer(
          viewWriter.createPositionAfter(lastSubChild)
        );
        viewWriter.move(
          viewWriter.createRangeOn(lastSubChild.parent),
          viewWriter.createPositionAt(injectedItem, "end")
        );
      }
    }
  }

  // Merge the inserted view list with its possible neighbor lists.
  mergeViewLists(viewWriter, injectedList, injectedList.nextSibling);
  mergeViewLists(
    viewWriter,
    injectedList.previousSibling,
    injectedList
  );
}


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

const svgString = `
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red" />
      <text id="y" x="45" y="28" fill="rgb(0, 0, 0)" font-family="Helvetica" font-size="12px"
      text-anchor="start">dfg sdf END <tspan>not</tspan></text>
      <text id="y" x="45" y="28" fill="rgb(0, 0, 0)" font-family="Helvetica" font-size="12px"
      text-anchor="start">SSSS</text>
      <rect x="15" y="15" width="70" height="70" stroke="black" stroke-width="3" fill="blue" />
    </svg>
`;
function getAttributesElem(elem) {
  if (!elem) return undefined;
  const attributes = {};
  for (const attribute of elem.attributes) {
    attributes[attribute.name] = attribute.value;
  }
  return attributes;
}

function getChildDataByElem(element) {
  if (!element) return null;
  const result = {};
  const trimInnerHTML = element.innerHTML?.trim();
  // console.log(element);
  if (element.childElementCount === 0 && trimInnerHTML !== "") {
    result.typeChild = "text";
    result.content = [element.innerHTML];
    // console.log("Содержимое элемента - строка:", result);
  } else if (element.childElementCount) {
    const textStart = trimInnerHTML.match(/^([^<>]+)</i)?.[1];
    const textEnd = trimInnerHTML.match(/>([^<>]+)$/i)?.[1];
    const htmlCollection = Array.from(element.children);
    result.typeChild = "node";
    result.content = [];

    if (textStart) result.content.push(textStart);
    result.content = result.content.concat(htmlCollection);
    if (textEnd) result.content.push(textEnd);

    // console.log("Содержимое элемента - дочерние узлы", result);
  } else {
    return undefined;
  }

  return result;
}

function createElemEditor(elem, writer, mapper, modelElement) {
  if (!elem) return null;

  let newElem;
  // 
  if (elem.tagName) {
    const childData = getChildDataByElem(elem);
    const attributes = getAttributesElem(elem);

    newElem = writer[
      childData?.typeChild ? "createContainerElement" : "createEmptyElement"
    ](elem.tagName, attributes, { renderUnsafeAttributes: Object.keys(attributes) } );

    const children = childData?.content.map((child) => {
      // writer.insert(writer.createPositionAt(newElem, 0), createElemEditor(child, writer));
      return createElemEditor(child, writer, mapper, modelElement);
    });

    if (children && children.length)
      writer.insert(writer.createPositionAt(newElem, 0), children);

      mapper.bindElements(modelElement, newElem)

  } else {
    newElem = writer.createText(elem);
  }
  // if(elem.tagName === 'svg')newElem._appendChild(writer.createText('elem'))

  return newElem;
}

export function createElementFromHTML(htmlString) {
  const div = document.createElement('div');
  div.innerHTML = htmlString;
  return div.childElementCount > 1 ? div : div.firstChild;  
}

export function createSvgNodeFromString(svgString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(`${svgString}`, "image/svg+xml");
  return xmlDoc.documentElement;
}

function createViewElemByInnerHTML(modelElement, { writer, mapper }) {
  const svgElement = createSvgNodeFromString(svgString);

  return createElemEditor(svgElement, writer, mapper, modelElement);
}

export function createViewSvg(modelElement, { writer, editor, mapper }) {

  // function registerItem(name) {
  //   const shema = editor.model.schema;
  //   console.log("isRegistered_name",shema.isRegistered(name));

  //   if(!shema.isRegistered(name)) {
  //     shema.register(name, {
  //       inheritAllFrom: '$block',
  //       isObject: true,
  //       isInline: true,
  //       allowWhere: "$text",
  //   });
  //   }
  
  //   console.log("isRegistered",shema.isRegistered(name));
  // }

  // const itemNames = ['svg', 'circle', 'text', 'rect']

  // itemNames.forEach(name => {
  //   registerItem(name)
  // });

//  const test = writer.createContainerElement('span', {style: `width: 60px;height: 30px;display: inline-block;`})
//  writer.insert(writer.createPositionAt(test, 0), writer.createText('elem'));
//   return test

console.log(modelElement);

  return createViewElemByInnerHTML(modelElement, { writer, editor, mapper });

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
