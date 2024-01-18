import Emittery from "emittery";

export const emitter = new Emittery();

export function parseSvg(svgString) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(svgString, "image/svg+xml");

  const svgElement = xmlDoc.documentElement;


  const svgAttributes = {};
  for (const attribute of svgElement.attributes) {
    svgAttributes[attribute.name] = attribute.value;
  }

  const match = svgString.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
  const svgContent = match ? match[1].trim() : '';

  return {
    attributes: svgAttributes,
    content: svgContent,
  };
}

export function createViewSvg(modelElement, { writer }) {
    const _parseSvg = parseSvg(modelElement.getAttribute("data-icon"));
    return writer.createRawElement(
      "svg",
      {
        class: `svg-${modelElement.getAttribute("data-name")}`,

        ..._parseSvg.attributes,
        width: '100%',
        height: '100%',
      },
      function (domElement) {
        domElement.innerHTML = _parseSvg.content;
      }
    )
  }

export function cloneElem(viewWriter, sourceNode) {
    if (sourceNode.is('text')) {
      return viewWriter.createText(sourceNode.data);
    } if (sourceNode.is('element')) {
      if (sourceNode.is('emptyElement')) {
        return viewWriter.createEmptyElement(sourceNode.name, sourceNode.getAttributes());
      }
      const element = viewWriter.createContainerElement(sourceNode.name, sourceNode.getAttributes());
      for (const child of sourceNode.getChildren()) {
        viewWriter.insert(viewWriter.createPositionAt(element, 'end'), cloneElem(viewWriter, child));
      }
      return element;
    }

    throw new Exception('Given node has unsupported type.'); // eslint-disable-line no-undef
  }

export  function replaceTextInSvg(_svgString, replacement) {
    let svgString = _svgString;
  
    function replaceTemp(string, regex) {
      return string.replace(
        regex,
        (match, group) => {
          // match - это весь найденный тег <text>
          // group - это содержимое текста внутри тега    
          return match.replace(group, replacement[group] || group);
        }
      );
    }
  
    svgString = replaceTemp(svgString, /<text[^>]*>(.*?)<\/text>/g);
    svgString = replaceTemp(svgString, /<font[^>]*>(.*?)<\/font>/g);
  
    return svgString;
  }

// Пример использования
// const svgString =
//   '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="172px" height="72px" viewBox="-0.5 -0.5 172 72" content="&lt;mxfile host=&quot;Electron&quot; modified=&quot;2024-01-15T05:56:27.561Z&quot; agent=&quot;Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) draw.io/21.5.1 Chrome/112.0.5615.204 Electron/24.6.0 Safari/537.36&quot; etag=&quot;ywTXVZ6QrcgfFR3RYL_w&quot; version=&quot;21.5.1&quot; type=&quot;device&quot;&gt;&lt;diagram name=&quot;Страница 1&quot; id=&quot;-L8JcDZjNFfGycrKBTJC&quot;&gt;5VVdb4MgFP01Pi5RsLZ97Ne6ZVmypA99JnKnLCgOsdr9+uHAKu2atUmTPfTFwOFyLpxzvXh4kTVrSYr0VVDgHvJp4+GlhxAKI/1tgb0BgmBigEQyaqEe2LAvsKBv0YpRKJ1AJQRXrHDBWOQ5xMrBiJSidsPeBXezFiSBE2ATE36KbhlVqUEnaNzjT8CStMscRFOzkpEu2N6kTAkV9QDCKw8vpBDKjLJmAbzVrtPF7Hs8s3o4mIRcXbIBhdWqLMrtLJuny4+X58+9XD8gw7IjvLIXtodV+04ByOmsFVLPcpFrcJ6qjOtZoIdSVDmFNoOvZ2Yv0BNJ+zMGh5vrigGRgZJ7HVL32o6sXulA1g6TwIliO5eeWIuTA90hw5tgOjHybTXiqeWxxYhD36UoRSVjsLuGWh4RhdglQuMjIkVkAuqESA8G1+6hH6uusA3flW1/qn2pbaN/ti28wDbOdWtr7apTpmBTkLhdqXVzdS0kZWH63TtrWietizuQCpprfez+j3Hk6jO1FAOf8S8+Y/+8pY6G1wo2uqs6v1l7wtFRnU9uVed62r9YJrx/9vHqGw==&lt;/diagram&gt;&lt;/mxfile&gt;" style="background-color: rgb(255, 255, 255);"><defs/><g><path d="M 30 70 L 70 0" fill="none" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="stroke"/><path d="M 70 0 L 170 0" fill="none" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="stroke"/><ellipse cx="31" cy="36" rx="15" ry="15" fill="rgb(255, 255, 255)" stroke="rgb(0, 0, 0)" pointer-events="all"/><path d="M 30 70 L 0 10" fill="none" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="stroke"/></g></svg> ';
// const parsedSvg = parseSvg(svgString);
// console.log(parsedSvg);
