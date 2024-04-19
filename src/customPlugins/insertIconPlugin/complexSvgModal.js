import { replaceElemAttr, setViewBoxWidthSvgByG } from "../icons/utils";
import { emitter } from "../utils";

function setSizesSvg_mult1(wrapSvg, id) {
  try {
    const svg = wrapSvg.querySelector("svg");

    const findSvgTextWithLongestContent = () => {
      const texts = svg.querySelectorAll("text tspan") || svg.querySelectorAll("text");
      let longestText = null;
      let maxX_End = 0;
      let svgRectTextLongest;

      texts.forEach((text) => {
        const svgRectText = text.getBBox();
        const xEndText = Math.ceil(svgRectText.width + 6);
        if (xEndText <= maxX_End || text.id === "tspan1") {
          return;
        }
        longestText = text;
        maxX_End = xEndText;
        svgRectTextLongest = svgRectText;
      });

      return { longestText, svgRectTextLongest, xEndTextLongest: maxX_End };
    };
    const path = svg.querySelector("path");
    if (id === "tspan1") {
      const tspan1 = svg.querySelector("#tspan1");
      if (tspan1) {
        const svgRectTspan1 = tspan1.getBBox();
        const xEnd = Math.ceil(svgRectTspan1.width + svgRectTspan1.x);
        const tspans = svg.querySelectorAll("text > tspan:not(#tspan1)");
       const path_D = path.getAttribute('d');
       const foundIn_D = path_D.match(/h\s+\d+/);

        if(foundIn_D?.[0]) {
          const path_X =  foundIn_D[0];
          const number = parseInt(path_X.match(/\d+/)[0]);
          if(number) {
            const finish_xEnd = xEnd + 1;
            replaceElemAttr(/m\s+\d+/, path, "d", `m ${finish_xEnd}`);
            tspans.forEach((tspan) => {
              replaceElemAttr(/\d+/, tspan, "x", `${finish_xEnd + 3}`);

            })
          }
        }


      }
    } else {
      const { xEndTextLongest } = findSvgTextWithLongestContent(); 
      replaceElemAttr(/h\s+\d+/, path, "d", `h ${xEndTextLongest}`);
    }
    setViewBoxWidthSvgByG(svg);
  } catch (error) {
    console.log("setSizesSvg_error", error);
  }
}

function addModal(content, svgName) {
  var modal = document.createElement("div");
  var closeButton = document.createElement("button");
  var modalContent = document.createElement("div");

  closeButton.innerHTML = "&times;";
  modalContent.innerHTML = content;

  modalContent.className = "modal-complexSvgModal-wrap-content";

  // Стили модального окна
  modal.id = "modalRoughness";
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  modal.style.zIndex = "9999";
  modal.style.display = "flex";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";

  // Стили содержимого модального окна
  modalContent.style.position = "relative";
  modalContent.style.backgroundColor = "#fff";
  modalContent.style.padding = "20px";
  modalContent.style.borderRadius = "8px";
  modalContent.style.display = "flex";
  modalContent.style.flexDirection = "column";

  // Стили кнопки закрытия
  closeButton.style.position = "absolute";
  closeButton.style.top = "6px";
  closeButton.style.right = "6px";
  closeButton.style.backgroundColor = "transparent";
  closeButton.style.border = "none";
  closeButton.style.cursor = "pointer";
  closeButton.style.fontSize = "30px";

  const wrapSvgTempElem = modalContent.querySelector(".wrap-svg-temp");
  const _svg = modalContent.querySelector("svg");
  const textElementsSvgTemp =
  _svg.querySelectorAll("text tspan") || _svg.querySelectorAll("text");
  const baseModalContent2 = modalContent.querySelector(".complexSvgModal-content-2");
  const _values = {};

  textElementsSvgTemp?.forEach(function (textElement) {
    const inputElement = document.createElement("input");
    const _textContent = textElement.textContent;
    inputElement.type = "text";
    inputElement.value = "";
    inputElement.placeholder = _textContent;
    inputElement.className = "parametr__input";
    inputElement.addEventListener("input", function () {
      const newText = this.value;
      if (textElement) {
        _values[_textContent] = newText;
        textElement.textContent = newText;
      }
      if(_svg.id === "mult1") setSizesSvg_mult1(wrapSvgTempElem, textElement.id);
    });

    baseModalContent2.appendChild(inputElement);
  });

  const saveBtn = modalContent.querySelector("#saveBtn");

  if (saveBtn) {
    saveBtn.onclick = function () {
      const svgElement = wrapSvgTempElem.querySelector("svg");
      if (svgElement?.outerHTML)
        emitter.emit("insertIcon", svgElement?.outerHTML, svgName, _values);
      modal.remove();
    };
  }

  modalContent.appendChild(closeButton);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  closeButton.addEventListener("click", function () {
    modal.remove();
    modal.style.display = "none";
  });

  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.remove();
      modal.style.display = "none";
    }
  });

  function openModal() {
    modal.style.display = "flex";
  }

  return openModal;
}

// Пример использования функции
export const showBaseModal = (svgTemp, svgName) =>
  addModal(
    `<h2 style="text-align: center;font-size: 20px;margin: 0;">Установка значений:</h2>
  <div id="baseModalContent">
    <div class="complexSvgModal-content-1">

      <span class="wrap-svg-temp">${svgTemp}</span>
    </div>
    <div class="complexSvgModal-content-2">

    </div>
  </div>
  <button id="saveBtn" type="button">Добавить</button>
  `,
    svgName
  );
