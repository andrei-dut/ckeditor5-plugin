import { emitter } from "../utils";

function addModal(content) {
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

  const wrapSvgTEmpElem = modalContent.querySelector(".wrap-svg-temp");
  const textElementsSvgTemp =
    wrapSvgTEmpElem.querySelectorAll("text tspan") ||
    wrapSvgTEmpElem.querySelectorAll("text");
  // const numberOfTextElements = textElementsSvgTemp.length;
  const baseModalContent2 = modalContent.querySelector(
    ".complexSvgModal-content-2"
  );
  // console.log(numberOfTextElements);

  textElementsSvgTemp?.forEach(function (textElement) {
    // Создаем новый элемент input
    var inputElement = document.createElement("input");
    inputElement.type = "text";
    inputElement.value = "";
    inputElement.placeholder = textElement.textContent;
    inputElement.className = "parametr__input";
    inputElement.maxLength = textElement.textContent?.length || 10;
    inputElement.addEventListener("input", function () {
      const newText = this.value;
      if (textElement) {
        textElement.textContent = newText;
      }
    });

    // Добавляем созданный инпут в DOM
    baseModalContent2.appendChild(inputElement);
  });

  const saveBtn = modalContent.querySelector("#saveBtn");

  if (saveBtn) {
    saveBtn.onclick = function () {
      const svgElement = wrapSvgTEmpElem.querySelector("svg");
      if (svgElement?.outerHTML) emitter.emit("insertIcon", svgElement?.outerHTML);
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
export const showBaseModal = (svgTemp) =>
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
  `
  );
