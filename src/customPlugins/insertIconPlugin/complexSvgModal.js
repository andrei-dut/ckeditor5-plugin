import { replaceElemAttr, setViewBoxWidthSvgByG } from "../icons/utils";
import { emitter } from "../utils";
let variances;

function setSizesSvg_customTextIcon(wrapSvg) {
  try {
    const svg = wrapSvg.querySelector("svg");

    const path = svg.querySelector("path");
    const longestText = svg.querySelector("text tspan") || svg.querySelector("text")
    const svgRectTextLongest = longestText.getBBox();
    const xEndText = Math.ceil(svgRectTextLongest.width + svgRectTextLongest.x);

    console.log("svgRectTextLongest", svgRectTextLongest);
    const newValue = Math.round(xEndText - 26);
    replaceElemAttr(/(?<=,.*\s)\d+/, path, "d", `${newValue < 10 ? 10 : newValue}`);
    setViewBoxWidthSvgByG(svg, 5);
  } catch (error) {
    console.log("setSizesSvg_error", error);
  }
}

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

        const finish_xEnd = xEnd + 1;
        replaceElemAttr(/m\s+\d+/, path, "d", `m ${finish_xEnd}`);
        tspans.forEach((tspan) => {
          replaceElemAttr(/\d+/, tspan, "x", `${finish_xEnd + 3}`);
        });
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

function setSizesSvg_mult2(wrapSvg, id) {
  try {
    const svg = wrapSvg.querySelector("svg");

    const tspan1 = svg.querySelector("#tspan1");
    const tspan2 = svg.querySelector("#tspan2");
    const tspan3 = svg.querySelector("#tspan3");
    const path = svg.querySelector("path");
    if (id === "tspan1") {
      const tspan1_BBox = tspan1.getBBox();
      const tspan2_BBox = tspan2.getBBox();
      const tspan1_x2 = Math.round(tspan1_BBox.x + tspan1_BBox.width);

      replaceElemAttr(/M\s+\d+/, path, "d", `M ${tspan1_x2 + variances.varianceTspan_1_path_x1}`);
      replaceElemAttr(/(?<=,.*\s)\d+/, path, "d", `${tspan1_x2 + variances.varianceTspan_1_path_x2}`);
      replaceElemAttr(null, tspan2, "x", `${(tspan1_x2 + variances.varianceTspan_1_2) - tspan2_BBox.width}`);
      replaceElemAttr(null, tspan3, "x", `${tspan1_x2 + variances.varianceTspan_1_3 + 3}`);

    } else if (id === "tspan2") {
      const tspan1_BBox = tspan1.getBBox();
      const tspan2_BBox = tspan2.getBBox();
      const tspan2_x2 = Math.round(tspan2_BBox.x + tspan2_BBox.width);
      replaceElemAttr(/M\s+\d+/, path, "d", `M ${tspan2_x2 + variances.varianceTspan_2_path_x1}`);
      replaceElemAttr(/(?<=,.*\s)\d+/, path, "d", `${tspan2_x2 + variances.varianceTspan_2_path_x2}`);
      replaceElemAttr(null, tspan1, "x", `${tspan2_x2 - (variances.varianceTspan_2_1 + tspan1_BBox.width)}`);
      replaceElemAttr(null, tspan3, "x", `${tspan2_x2 + variances.varianceTspan_2_3 + 3}`);

    }
    const g2 = svg.querySelector("#layer1");
    const transform = g2.getAttribute("transform");
    const tspan1_BBox = tspan1.getBBox();
    const tspan2_BBox = tspan2.getBBox();
    if(tspan1_BBox.x < 0) {
      replaceElemAttr(transform, g2, "transform", `translate(${-(tspan1.getBBox().x)}, 0)`);
      } else {
      replaceElemAttr(transform, g2, "transform", `translate(${-((tspan1_BBox.x > tspan2_BBox.x ? tspan2_BBox.x : tspan1_BBox.x) - 2)}, 0)`);

      }
    setViewBoxWidthSvgByG(svg, 10);
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
  const textElementsSvgTemp = _svg.querySelectorAll("text tspan") || _svg.querySelectorAll("text");
  const baseModalContent2 = modalContent.querySelector(".complexSvgModal-content-2");
  const _values = {};

  textElementsSvgTemp?.forEach(function (textElement) {
    const inputElement = document.createElement("input");
    const _textContent = textElement.textContent;
    inputElement.type = "text";
    inputElement.value = "";
    inputElement.placeholder = _textContent;
    inputElement.className = "parametr__input";

    if (_svg.id === "circleXXX") {
      inputElement.maxLength = 3;
    }

    inputElement.addEventListener("input", function () {
      if (_svg.id === "mult2" && !variances) {
        const tspan1 = _svg.querySelector("#tspan1");
        const tspan2 = _svg.querySelector("#tspan2");
        const tspan3 = _svg.querySelector("#tspan3");
        const path = _svg.querySelector("path");

        const path_BBox = path.getBBox();
        const tspan1_BBox = tspan1.getBBox();
        const tspan2_BBox = tspan2.getBBox();
        const tspan3_BBox = tspan3.getBBox();

        const tspan1_x2 = tspan1_BBox.x + tspan1_BBox.width;
        const tspan2_x2 = tspan2_BBox.x + tspan2_BBox.width;
        const path_x1 = path_BBox.x;
        const path_x2 = path_BBox.x + path_BBox.width;

        const varianceTspan_1_2 = Math.round(tspan2_x2 - tspan1_x2);
        const varianceTspan_1_3 = Math.round(tspan3_BBox.x - tspan1_x2);
        const varianceTspan_1_path_x1 = Math.round(path_x1 - tspan1_x2);
        const varianceTspan_1_path_x2 = Math.round(path_x2 - tspan1_x2);

        const varianceTspan_2_1 = Math.round(tspan2_x2 - tspan1_x2);
        const varianceTspan_2_path_x1 = Math.round(path_x1 - tspan2_x2);
        const varianceTspan_2_path_x2 = Math.round(path_x2 - tspan2_x2);
        const varianceTspan_2_3 = Math.round(tspan3_BBox.x - tspan2_x2);

        variances = {
          varianceTspan_1_2,
          varianceTspan_1_3,
          varianceTspan_1_path_x1,
          varianceTspan_1_path_x2,
          varianceTspan_2_1,
          varianceTspan_2_path_x1,
          varianceTspan_2_path_x2,
          varianceTspan_2_3
        }


      }
      const newText = this.value;
      if (textElement) {
        _values[_textContent] = newText;
        textElement.textContent = newText;
      }

      if (_svg.id === "customTextIcon") setSizesSvg_customTextIcon(wrapSvgTempElem, textElement.id);
      if (_svg.id === "mult1") setSizesSvg_mult1(wrapSvgTempElem, textElement.id);
      if (_svg.id === "mult2") setSizesSvg_mult2(wrapSvgTempElem, textElement.id);
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
