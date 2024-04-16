import Emittery from "emittery";

export const emitter = new Emittery();

export function parseReqDivTags(htmlContent) {
  const reqObjects = {};

  const tempElement = document.createElement("div");
  tempElement.innerHTML = htmlContent;

  const requirementElements = tempElement.querySelectorAll(".requirement");

  const directChildRequirementElements = Array.from(requirementElements).filter(element => element.parentElement === tempElement);

  for (const child of directChildRequirementElements) {
    if (child.tagName && child.tagName.toLowerCase() === "div" && child.className.includes("requirement")) {
      const reqNumber = Object.keys(reqObjects).length + 1;
      const reqContent = child.outerHTML;
      reqObjects[reqNumber] = {
        number: reqNumber,
        content: reqContent,
      };
    }
  }

  return reqObjects;
}

export function parseAllReqDivTags(htmlContent) {
  const reqObjects = {};

  const tempElement = document.createElement("div");
  tempElement.innerHTML = htmlContent;

  const requirementElements = tempElement.querySelectorAll(".requirement");

  for (const child of requirementElements) {
    if (child.tagName && child.tagName.toLowerCase() === "div" && child.className.includes("requirement")) {

      const markerElement = child.querySelector(".aw-ckeditor-marker-element");
      const bodyText = child.querySelector(".aw-requirement-bodytext");
   

    if(markerElement && bodyText) {
      const markerElementContent =  markerElement.textContent;
      const bodyTextContent =  bodyText.innerHTML;
      reqObjects[markerElementContent] = bodyTextContent;
    }

    }
  }

  return reqObjects;
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

  const contentString = element.innerHTML;

  return { attributes, contentString };
}

export function createViewSvg(modelElement, { writer }) {
  // const _parseSvg = parseSvg(modelElement.getAttribute("data-icon"));
  const svgData =  getAttsAndContentFromElDom(modelElement.getAttribute("data-icon")) || {};
  return writer.createRawElement(
    "svg",
    {
      class: `svg-${modelElement.getAttribute("data-name")}`,
      ...svgData.attributes,
      // ..._parseSvg.attributes,
      width: "100%",
      height: "100%",
    },
    function (domElement) {
      domElement.innerHTML = svgData.contentString;
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

  throw new Exception("Given node has unsupported type."); // eslint-disable-line no-undef
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

// Пример использования
// const svgString =
//   '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="172px" height="72px" viewBox="-0.5 -0.5 172 72" content="&lt;mxfile host=&quot;Electron&quot; modified=&quot;2024-01-15T05:56:27.561Z&quot; agent=&quot;Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) draw.io/21.5.1 Chrome/112.0.5615.204 Electron/24.6.0 Safari/537.36&quot; etag=&quot;ywTXVZ6QrcgfFR3RYL_w&quot; version=&quot;21.5.1&quot; type=&quot;device&quot;&gt;&lt;diagram name=&quot;Страница 1&quot; id=&quot;-L8JcDZjNFfGycrKBTJC&quot;&gt;5VVdb4MgFP01Pi5RsLZ97Ne6ZVmypA99JnKnLCgOsdr9+uHAKu2atUmTPfTFwOFyLpxzvXh4kTVrSYr0VVDgHvJp4+GlhxAKI/1tgb0BgmBigEQyaqEe2LAvsKBv0YpRKJ1AJQRXrHDBWOQ5xMrBiJSidsPeBXezFiSBE2ATE36KbhlVqUEnaNzjT8CStMscRFOzkpEu2N6kTAkV9QDCKw8vpBDKjLJmAbzVrtPF7Hs8s3o4mIRcXbIBhdWqLMrtLJuny4+X58+9XD8gw7IjvLIXtodV+04ByOmsFVLPcpFrcJ6qjOtZoIdSVDmFNoOvZ2Yv0BNJ+zMGh5vrigGRgZJ7HVL32o6sXulA1g6TwIliO5eeWIuTA90hw5tgOjHybTXiqeWxxYhD36UoRSVjsLuGWh4RhdglQuMjIkVkAuqESA8G1+6hH6uusA3flW1/qn2pbaN/ti28wDbOdWtr7apTpmBTkLhdqXVzdS0kZWH63TtrWietizuQCpprfez+j3Hk6jO1FAOf8S8+Y/+8pY6G1wo2uqs6v1l7wtFRnU9uVed62r9YJrx/9vHqGw==&lt;/diagram&gt;&lt;/mxfile&gt;" style="background-color: rgb(255, 255, 255);"><defs/><g><path d="M 30 70 L 70 0" fill="none" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="stroke"/><path d="M 70 0 L 170 0" fill="none" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="stroke"/><ellipse cx="31" cy="36" rx="15" ry="15" fill="rgb(255, 255, 255)" stroke="rgb(0, 0, 0)" pointer-events="all"/><path d="M 30 70 L 0 10" fill="none" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="stroke"/></g></svg> ';
// const parsedSvg = parseSvg(svgString);
// console.log(parsedSvg);

// function measureSvgTextWidth(svgString, fontFamily, fontSize) {
//   const tempDiv = document.createElement('div');
//   tempDiv.style.position = 'absolute';
//   tempDiv.style.left = '100px';
//   tempDiv.style.top = '100px';

//   document.body.appendChild(tempDiv);

//   tempDiv.innerHTML = svgString;
//   const svgTextElement = tempDiv.querySelector('#path2');

//   if (svgTextElement) {

//     // Получаем ссылку на элемент SVG
// const svgElement = document.querySelector('svg'); // Замените 'yourSvgElementId' на ваш ID

// // Получаем все элементы внутри SVG
// const svgChildren = svgElement.children;

// // Инициализируем переменные для минимальных и максимальных координат
// let minX = Infinity;
// let minY = Infinity;
// let maxX = -Infinity;
// let maxY = -Infinity;

// // Итерируемся по всем элементам внутри SVG
// for (let i = 0; i < svgChildren.length; i++) {
//   const element = svgChildren[i];

//   // Получаем координаты и размеры текущего элемента
//   const bbox = element.getBBox();
// console.log(element,bbox.x , bbox.width)
//   // Обновляем минимальные и максимальные координаты
//   minX = Math.min(minX, bbox.x);
//   minY = Math.min(minY, bbox.y);
//   maxX = Math.max(maxX, bbox.x + bbox.width);
//   maxY = Math.max(maxY, bbox.y + bbox.height);
// }

// // Устанавливаем новое значение viewBox
// svgElement.setAttribute('viewBox', `${minX} ${minY} ${maxX + 10 - minX} ${maxY - minY}`);

//     svgTextElement.setAttribute('font-family', fontFamily);
//     svgTextElement.setAttribute('font-size', fontSize);

//     const textWidth = svgTextElement.getBoundingClientRect().width;
//     console.log(svgTextElement)

//     // document.body.removeChild(tempDiv);
//     return textWidth;
//   }

//   // document.body.removeChild(tempDiv);
//   // return 0; // В случае, если не удалось найти элемент text в SVG
// }

// // Пример использования
// const svgString = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"
//     width="200px" height="213px" viewBox="-0.5 -0.5 132 141"
//     content="&lt;mxfile host=&quot;Electron&quot; modified=&quot;2024-01-17T11:43:05.474Z&quot; agent=&quot;Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) draw.io/21.5.1 Chrome/112.0.5615.204 Electron/24.6.0 Safari/537.36&quot; etag=&quot;H-96SXCI5RICZbEWg_Ra&quot; version=&quot;21.5.1&quot; type=&quot;device&quot;&gt;&lt;diagram name=&quot;Страница 1&quot; id=&quot;-L8JcDZjNFfGycrKBTJC&quot;&gt;7VhNj5swEP01SO0hEsEEkmO+Nl2tWlWKVrvppbLAAbcGE+ME6K+vARNwQtqkSsShnOJ5Ho+HeW8sxxqYB+mKwcj/TF1ENEN3Uw0sNMMYGvZY/ORIViLW0CoBj2FXOtXAGv9CEtQluscuihVHTinhOFJBh4YhcriCQcZoorptKVF3jaCHzoC1A8k5+oZd7pfo2LBr/BPCnl/tPLQm5UwAK2f5JbEPXZo0ILDUwJxRystRkM4RyYtX1aVc93Rh9pgYQyG/ZoFh7pdxFL9Ng5m/+PHyvMvYamCUUQ6Q7OUHy2R5VlUAhe40L6SwQhoKcObzgAhrKIaM7kMX5TvowjpPSWaJXKXKMsEVogHiLBMOSV3bkayX3yhrhTFEIMcHlRsoKfaO4Y47fKVYZGLoUo5gIuNIMQJTV0PEdM8cJFc1a3kSyARqIMM+CcQh8xA/CyQGjc+uoYKqG2gDd6VNsMWydzlVGJumsUibfovsRrJFwxbFKKGXxJkdnsLn191354u/IBadvw46FcVfubxWFKOORWFeIQpCxMGZiyHxMUfrCDr5TCLOblUgMI7K03SL01wnl9k+IMZRqv2puavusy21PhMZosEzaOEZ6JcpVWp4a8FG/eH3LzoH9kkg/WE6v3xanNBmEVGs2ZYWedb8Wbs9rSYGcXG5mAqHoRmlBWPVvBh5+e9mU4USmZXRyokzYQjN53jMGf2J5pRQVksEEuyFwnSEEhDLt8eEnPg0ZJR3EBY3jqlcFmDXJZd6tE1zZy3YIsOLXWmaJ6dWZTdUaT2oK1vpbbuS3Ine9/cPw489w7bZLcNtt5f7MWz0DBuTjnu47SpyP4ZBzzDQO+7htrvT/Rg2e4aB0XEPWw9leNQzDEDHPWw/lGGrZxiMOu7h8eMY/vb/saur7xdtJ/Sd3i+EWT8Ml/+b6+d1sPwN&lt;/diagram&gt;&lt;/mxfile&gt;"
//     style="background-color: rgb(255, 255, 255);">
//     <defs />
//     <g>
//         <path d="M 20 100 L 60 30" fill="none" stroke="rgb(0, 0, 0)" stroke-miterlimit="10"
//             pointer-events="stroke" />
//         <path id="path2" d="M 60 30 L 150 30" fill="none" stroke="rgb(0, 0, 0)" stroke-miterlimit="10"
//             pointer-events="stroke" />
//         <ellipse cx="21" cy="66" rx="15" ry="15" fill="rgb(255, 255, 255)" stroke="rgb(0, 0, 0)"
//             pointer-events="all" />
//         <path d="M 20 100 L 0 60" fill="none" stroke="rgb(0, 0, 0)" stroke-miterlimit="10"
//             pointer-events="stroke" />
//         <rect x="70" y="0" width="60" height="30" fill="none" stroke="none" pointer-events="all" />

//         <text x="60" y="28" fill="rgb(0, 0, 0)" font-family="Helvetica" font-size="12px"
//             text-anchor="start">fgdfgdgdfgdfgd123456</text>

//         <text x="70" y="53" fill="rgb(0, 0, 0)" font-family="Helvetica" font-size="12px"
//             text-anchor="start">XX(1)</text>

//     </g>
//     <switch>
//         <g requiredFeatures="http://www.w3.org/TR/SVG11/feature#Extensibility" />
//         <a transform="translate(0,-5)"
//             xlink:href="https://www.drawio.com/doc/faq/svg-export-text-problems" target="_blank">
//             <text text-anchor="middle" font-size="10px" x="50%" y="100%">Text is not SVG - cannot
//                 display</text>
//         </a>
//     </switch>
// </svg>`;
// const fontFamily = "Arial";
// const fontSize = "12px";

// const textWidth = measureSvgTextWidth(svgString, fontFamily, fontSize);

// console.log("Ширина текста:", textWidth);
