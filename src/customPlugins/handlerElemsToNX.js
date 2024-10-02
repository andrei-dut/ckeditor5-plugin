import { getModelElement, getTextFromElement, modelToViewElem } from "./editorUtils";
import iconv from "./lib/iconv-lite";

export const replaceElementsWithJsonContent = function (editor) {
  const root = editor.model.document.getRoot();
  const rootChildren = root.getChildren();
  const result = [];

  const handlerElems = (element, reqMarker) => {
    const elementCopy = element.cloneNode(true);

    /////////////// replaceByDataJson
    const replaceByDataJson = () => {
      const elementsWithDataJson = elementCopy.querySelectorAll("[data-json]");

      elementsWithDataJson.forEach((element) => {
        const jsonData = element.getAttribute("data-json");
        const value = JSON.parse(jsonData)?.value;

        if (value) {
          try {
            const textNode = document.createTextNode(value);
            element.parentNode.replaceChild(textNode, element);
            const parent = textNode.parentNode;
            if (parent.classList.contains("ck-widget")) {
              parent.parentNode.replaceChild(textNode, parent);
            }
          } catch (error) {
            console.error("Ошибка при парсинге JSON:", error);
          }
        }
      });
    };
    replaceByDataJson();

    //////////////////// replaceByID
    const replaceByID = () => {
      const ids = [
        "triangleRight",
        "arc",
        "spec9",
        "spec8",
        "spec7",
        "spec6",
        "spec5",
        "spec4",
        "spec3",
        "spec2",
        "spec1",
      ];
      ids.forEach((_id) => {
        const elementsWithId = elementCopy.querySelectorAll(`#${_id}`);
        elementsWithId.forEach((element) => {
          try {
            const textNode = document.createTextNode(dataSvgToXml(element.id, undefined, true));
            element.parentNode.replaceChild(textNode, element);
          } catch (error) {
            console.log("error", error);
          }
        });
      });
    };
    replaceByID();

    //////////////////// replaceSubSup
    const replaceSubSup = () => {
      const tags = ["sup", "sub"];
      tags.forEach((tagName) => {
        const elements = elementCopy.querySelectorAll(tagName);
        elements.forEach((element) => {
          try {
            const letter = tagName === "sup" ? "H" : "L";
            const textNode = document.createTextNode(
              `<${letter}>${element.textContent}<${letter}>`.replaceAll(" ", "")
            );
            element.parentNode.replaceChild(textNode, element);
          } catch (error) {
            console.log("error", error);
          }
        });
      });
    };
    replaceSubSup();

    //////////////////// replaceParametrText
    const replaceParametrText = () => {
      const elementsParametrText = elementCopy.querySelectorAll(".aw-req-parametrText");

      elementsParametrText.forEach((element) => {
        const textNode = document.createTextNode(element.textContent);
        element.parentNode.replaceChild(textNode, element);
      });
    };
    replaceParametrText();

    //////////////////// replaceUl_Ol
    const replaceUl_Ol = () => {
      const lists = ["ol", "ul"];
      lists.forEach((tagName) => {
        const elements = elementCopy.querySelectorAll(tagName);
        elements.forEach((element) => {
          try {
            const innerHTML_array = [];
            for (const child of element.children) {
              const childInnerHTML = child.innerHTML || "";
              const lengthAr = innerHTML_array.length;
              innerHTML_array.push(
                `${lengthAr === 0 ? "" : ""}\t${
                  tagName === "ol" ? `${lengthAr + 1}.` : "•"
                } ${childInnerHTML}\n`
              );
            }
            const textNode = document.createTextNode(innerHTML_array.join(""));
            element.parentNode.replaceChild(textNode, element);
          } catch (error) {
            console.log("error", error);
          }
        });
      });
    };
    replaceUl_Ol();

    //////////////////// replaceWrapElems
    const replaceWrapElems = () => {
      const tagNames = ["p"];
      tagNames.forEach((tagName) => {
        const elements = elementCopy.querySelectorAll(tagName);
        elements.forEach((element) => {
          try {
            const textNode = document.createTextNode(`${element.innerHTML || ""}\n`);
            element.parentNode.replaceChild(textNode, element);
          } catch (error) {
            console.log("error", error);
          }
        });
      });
    };
    replaceWrapElems();
    elementCopy.innerHTML = replaceStringToNX(elementCopy.innerHTML);

    function decodeHtmlEntities(text) {
      try {
        const textarea = document.createElement("textarea");
        textarea.innerHTML = text;
        return textarea.value;
      } catch (error) {
        return text;
      }
    }

    const resultString = `${reqMarker}. ${decodeHtmlEntities(elementCopy.textContent)}`;

    console.log("elementCopy", elementCopy.innerHTML);
    return resultString;
  };

  for (const req of rootChildren) {
    const modelRequirementBodyText = getModelElement(editor, req, "requirementBodyText");
    const viewRequirementBodyText = modelToViewElem(editor, modelRequirementBodyText);
    const reqBTDom = editor.editing.view.domConverter.mapViewToDom(viewRequirementBodyText);
    const reqMarker = getTextFromElement(getModelElement(editor, req, "span"));
    result.push(handlerElems(reqBTDom, reqMarker));
  }

  const doneString = result.join("\n\n");
  let CP1251;

  try {
    const toCP1251 = function (text) {
      return iconv.encode(text, "win1251");
    };
    CP1251 = toCP1251(doneString + "\u0020");
    // console.log("CP1251", CP1251);
    const array = CP1251;
    const last20 = array.slice(-20);

    // Функция для проверки, есть ли 63 более 2 раз подряд
    const get63 = (arr) => {
      const indices = [];
      for (let i = 0; i < arr.length; i++) {
        if (arr[i] === 63) {
          indices.push(CP1251.length - 20 + i);
        }
      }
      return indices.length > 1 ? indices : [];
    };


    const indeces63 = get63(last20).filter(
      (value, i, array) =>{
        const isNext = (i !== array.length - 1 && value + 1 === array[i + 1]);
        return isNext || (!isNext && i !== array.length - 1 && value - 1 === array[i - 1]) ||
        (i === array.length - 1 && value - 1 === array[i - 1])}
    );
    CP1251 = (CP1251 || []).filter((el, i) => !indeces63.find((_val) => _val === i))

    // console.log(indeces63);
  } catch (error) {
    console.log("error_toCP1251", error);
  }

  return { arrayString: result, doneString, CP1251 };
};

export function dataSvgToXml(key, values = {}, onlyValue) {
  const replaceNonBreakingSpace = (str) => {
    return str.replace(/ /g, '&nbsp;');
  }
  switch (key) {
    case "mult1":
      return {
        name: key,
        value: replaceNonBreakingSpace(`${values.aa || "aa"} <R${values.bb || "bb"}!${values.cc || "cc"}> `),
      };
    case "mult2":
      return {
        name: key,
        value: replaceNonBreakingSpace(`${values.aa || "aa"} <Q${values.bb || "bb"}!${values.cc || "cc"}> `),
      };
    case "roughness": {
      const keys = Object.keys(values);
      let xxString = "";
      keys.forEach((el) => {
        if (el.includes("x")) xxString += `!${values[el]}`;
      });
      const valSymbol = {
        "\u2534": "12",
        x: "13",
      };
      const type = values.type;
      const typeRoug = type === "ra1" ? `$Ro0` : type === "ra2" ? "$Ro1" : "$Ro2";
      return {
        name: key,
        value: `<${typeRoug}!${values.y}!${valSymbol[values.z] || values.z}${xxString}>`,
      };
    }
    case "allowance": {
      return {
        name: key,
        value: `<C0.5000><T${values.x}!${values.y}><C>`,
      };
    }
    case "customTextIcon": {
      return {
        name: key,
        value: `<$SS_OVAL!4!${values.TEXT}>`,
      };
    }
    case "circleXXX": {
      return {
        name: key,
        value: `<$SS_OVAL!5!${values.xxx}>`,
      };
    }
    case "triangleRight": {
      return onlyValue
        ? `<%TTSIMB10>`
        : {
            name: key,
            value: `<%TTSIMB10>`,
          };
    }
    case "arc": {
      return onlyValue
        ? `<%TTSIMB11>`
        : {
            name: key,
            value: `<%TTSIMB11>`,
          };
    }
    case "spec9": {
      return onlyValue
        ? `<%TTSIMB09>`
        : {
            name: key,
            value: `<%TTSIMB09>`,
          };
    }
    case "spec8": {
      return onlyValue
        ? `<%TTSIMB08>`
        : {
            name: key,
            value: `<%TTSIMB08>`,
          };
    }
    case "spec7": {
      return onlyValue
        ? `<%TTSIMB07>`
        : {
            name: key,
            value: `<%TTSIMB07>`,
          };
    }
    case "spec6": {
      return onlyValue
        ? `<%TTSIMB06>`
        : {
            name: key,
            value: `<%TTSIMB06>`,
          };
    }
    case "spec5": {
      return onlyValue
        ? `<%TTSIMB05>`
        : {
            name: key,
            value: `<%TTSIMB05>`,
          };
    }
    case "spec4": {
      return onlyValue
        ? `<%TTSIMB04>`
        : {
            name: key,
            value: `<%TTSIMB04>`,
          };
    }
    case "spec3": {
      return onlyValue
        ? `<%TTSIMB03>`
        : {
            name: key,
            value: `<%TTSIMB03>`,
          };
    }
    case "spec2": {
      return onlyValue
        ? `<%TTSIMB02>`
        : {
            name: key,
            value: `<%TTSIMB02>`,
          };
    }
    case "spec1": {
      return onlyValue
        ? `<%TTSIMB01>`
        : {
            name: key,
            value: `<%TTSIMB01>`,
          };
    }

    default:
      return {};
  }
}

export function replaceStringToNX(inputString) {
  return inputString
    .replaceAll("Ø", "<%TTSPS10>")
    .replaceAll("±", "<%TTSPS09>")
    .replaceAll("°", "<%TTSPS08>")
    .replaceAll("≥", "<%TTSPS02>")
    .replaceAll("≤", "<%TTSPS01>")
    .replaceAll("§", "<%TTSPS06>")
    .replaceAll("≠", "<%TTSPS05>")
    .replaceAll("", "<%TTSPS13>")
    .replaceAll("∞", "<%TTSPS04>")
    .replaceAll("√", "<%TTSPS03>")
    .replaceAll("∫", "<%TTSPS11>")
    .replaceAll("≈", "<%TTSPS07>")
    .replaceAll("~", "<%TTSPS12>")
    .replaceAll("□", "<%SQUARE1>")
    .replaceAll("Α", "<%TTGR601>")
    .replaceAll("β", "<%TTGR602>")
    .replaceAll("γ", "<%TTGR603>")
    .replaceAll("δ", "<%TTGR604>")
    .replaceAll("ε", "<%TTGR605>")
    .replaceAll("ζ", "<%TTGR606>")
    .replaceAll("η", "<%TTGR607>")
    .replaceAll("θ", "<%TTGR608>")
    .replaceAll("ι", "<%TTGR609>")
    .replaceAll("κ", "<%TTGR610>")
    .replaceAll("λ", "<%TTGR611>")
    .replaceAll("μ", "<%TTGR612>")
    .replaceAll("ν", "<%TTGR613>")
    .replaceAll("ξ", "<%TTGR614>")
    .replaceAll("ο", "<%TTGR615>")
    .replaceAll("π", "<%TTGR616>")
    .replaceAll("ρ", "<%TTGR617>")
    .replaceAll("ς", "<%TTGR618>")
    .replaceAll("σ", "<%TTGR619>")
    .replaceAll("τ", "<%TTGR620>")
    .replaceAll("υ", "<%TTGR621>")
    .replaceAll("φ", "<%TTGR622>")
    .replaceAll("χ", "<%TTGR623>")
    .replaceAll("ψ", "<%TTGR624>")
    .replaceAll("∅", "<%TTGR625>")
    .replaceAll("ω", "<%TTGR625>")
    .replaceAll(`&lt;br data-cke-filler="true"&gt;`, "");
}
