import { emitter, findTextTagInSVG } from "../utils/utils";
import ra1 from "../icons/RA1_template.svg";
import ra2 from "../icons/RA2_template.svg";
import ra3 from "../icons/RA3_template.svg";
import raManual from "../icons/RA_manual.svg";

import ra1_1 from "../icons/RA1_1.svg";
import ra1_2 from "../icons/RA1_2.svg";
import ra1_3 from "../icons/RA1_3.svg";
import ra1_4 from "../icons/RA1_4.svg";
import ra1_5 from "../icons/RA1_5.svg";
import ra1_6 from "../icons/RA1_6.svg";

import ra2_1 from "../icons/RA2_1.svg";
import ra2_2 from "../icons/RA2_2.svg";
import ra2_3 from "../icons/RA2_3.svg";
import ra2_4 from "../icons/RA2_4.svg";
import ra2_5 from "../icons/RA2_5.svg";
import ra2_6 from "../icons/RA2_6.svg";

import ra3_1 from "../icons/RA3_1.svg";
import ra3_2 from "../icons/RA3_2.svg";
import ra3_3 from "../icons/RA3_3.svg";
import ra3_4 from "../icons/RA3_4.svg";
import ra3_5 from "../icons/RA3_5.svg";
import ra3_6 from "../icons/RA3_6.svg";

const ra_All = {
  ra1_1,
  ra1_2,
  ra1_3,
  ra1_4,
  ra1_5,
  ra1_6,
  ra2_1,
  ra2_2,
  ra2_3,
  ra2_4,
  ra2_5,
  ra2_6,
  ra3_1,
  ra3_2,
  ra3_3,
  ra3_4,
  ra3_5,
  ra3_6,
};

function createFormForModal(parent, formData) {
  const formContainer = document.createElement("div");
  formContainer.id = "formContainer";
  parent.appendChild(formContainer);

  const form = document.createElement("form");
  form.className = "form-edit-svg";
  for (const key in formData) {
    const label = document.createElement("label");
    label.textContent = key + ":";
    const input = document.createElement("input");
    input.type = "text";
    input.name = key;
    input.value = formData[key];
    label.appendChild(input);
    form.appendChild(label);
  }

  form.onsubmit = function (e) {
    const formValues = {};
    e.preventDefault();

    const formData = new FormData(e.target);
    for (const [name, value] of formData.entries()) {
      formValues[name] = value;
    }
    emitter.emit("insertIcon", formValues);
    closeEditSvgModal();
  };

  const submitButton = document.createElement("button");
  submitButton.type = "submit";
  submitButton.textContent = "Вставить";

  form.appendChild(submitButton);
  formContainer.appendChild(form);
}

export function openEditSvgModal(iconData) {
  document.getElementById("myModal").style.display = "block";

  const formData = setIconHeadForm(iconData.icon);
  createFormForModal(document.getElementById("wrapForm"), formData);
  toggleCloseEvent(true);
}

function setIconHeadForm(svgString) {
  const parser = new DOMParser();
  const svgDocument = parser.parseFromString(svgString, "image/svg+xml");
  const svgElement = svgDocument.documentElement;
  const textElements = svgDocument.querySelectorAll("text");
  const textValues = {};

  textElements?.forEach((textElement) => {
    const content = textElement.textContent || "";
    // textElement.id = 'text_' + content
    if (content.length <= 6) textValues[content] = "";
  });

  document.getElementById("headFormSvg").appendChild(svgElement);
  return textValues;
}

export function closeEditSvgModal() {
  document.getElementById("myModal").style.display = "none";

  const formContainer = document.getElementById("formContainer");
  const svg = document.querySelector("#headFormSvg svg");
  formContainer?.remove();
  svg?.remove();

  toggleCloseEvent();
}

function toggleCloseEvent(isOpen) {
  const closeBtn = document.getElementById("closeModal");
  if (isOpen) {
    closeBtn.onclick = closeEditSvgModal;
  } else {
    closeBtn.onclick = null;
  }
}

// Закрыть модальное окно при клике вне его области
window.onclick = function (event) {
  const modal = document.getElementById("myModal");
  if (event.target === modal) {
    closeEditSvgModal();
  }
};

export const testFormData = { key1: "", key2: "", key3: "" };

function addModal(content) {
  var modal = document.createElement("div");
  var closeButton = document.createElement("button");
  var modalContent = document.createElement("div");

  closeButton.innerHTML = "&times;";
  modalContent.innerHTML = content;

  // Стили модального окна
  modal.style.position = "fixed";
  modal.style.top = "0";
  modal.style.left = "0";
  modal.style.width = "100%";
  modal.style.height = "100%";
  modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
  modal.style.zIndex = "9999";
  modal.style.display = "none";
  modal.style.justifyContent = "center";
  modal.style.alignItems = "center";

  // Стили содержимого модального окна
  modalContent.style.position = "relative";
  modalContent.style.backgroundColor = "#fff";
  modalContent.style.padding = "20px";
  modalContent.style.borderRadius = "8px";
  modalContent.style.minWidth = "50%";
  modalContent.style.minHeight = "40%";
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

  const addInputBtn = modalContent.querySelector("#addInput");
  const parametr__input1 = modalContent.querySelector("#parametr__input");
  const processingMethod = modalContent.querySelector("#processingMethod");
  if (addInputBtn) {
    addInputBtn.onclick = addInput;
  }
  if (parametr__input1) {
    parametr__input1.addEventListener("input", function () {
      const newText = this.value;
      const svgElement = document.querySelector("#wrapSvg svg");
      const targetTextElement = findTextTagInSVG(svgElement, "x1");
      if (targetTextElement) {
        targetTextElement.textContent = newText;
      }
    });
  }
  if (processingMethod) {
    processingMethod.addEventListener("input", function () {
      const newText = this.value;
      const svgElement = document.querySelector("#wrapSvg svg");
      const targetTextElement = findTextTagInSVG(svgElement, "y");
      if (targetTextElement) {
        targetTextElement.textContent = newText;
      }
    });
  }

  modalContent.appendChild(closeButton);
  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  const designations = modal.querySelectorAll(
    ".dropdown-designation-content div"
  );
  if (designations) {
    designations.forEach((item) => {
      item.addEventListener("click", function () {
        selectItem(item.textContent);
      });
    });
  }

  const roughnessSymbols = modal.querySelectorAll(".roughness-symbol > span");
  if (roughnessSymbols) {
    roughnessSymbols.forEach((item) => {
      item.addEventListener("click", function () {
        roughnessSymbols.forEach((item) => {
          item.classList.remove("selected");
        });
        this.classList.add("selected");

        changePreviewSvg(item.id);
      });
    });
  }

  closeButton.addEventListener("click", function () {
    modal.style.display = "none";
  });

  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  function openModal() {
    modal.style.display = "flex";
  }

  return openModal;
}

const changePreviewSvg = (selectedRaID) => {
  const wrapPreviewElem = document.querySelector(".content-1-wrap-preview");
  const dropdownValue = document.querySelector(".dropdown-designation-value");
  const processingMethod = document.querySelector("#processingMethod");

  const inputs = document.querySelectorAll(".parametr__input");
  const inputsLength = inputs && inputs.length;

  const currentValues = {};

  for (const input of inputs) {
    const inputText = input.value;
    const index = Array.from(inputs).indexOf(input) + 1;
    if (index && inputText) {
      currentValues[`x${index}`] = inputText;
    }
  }

  if (dropdownValue) {
    currentValues.z = dropdownValue.textContent;
  }

  if (processingMethod) {
    currentValues.y = processingMethod.value;
  }

  console.log(currentValues);

  const newWrapWithSvg = document.createElement("span");
  newWrapWithSvg.id = "wrapSvg";
  let innerSvg;

  if (selectedRaID === "ra1") {
    innerSvg = ra_All[`ra1_${inputsLength || 1}`];
  } else if (selectedRaID === "ra2") {
    innerSvg = ra_All[`ra2_${inputsLength || 1}`];
  } else {
    innerSvg = ra_All[`ra3_${inputsLength || 1}`];
  }

  newWrapWithSvg.innerHTML = innerSvg;

  const svgElement = wrapPreviewElem.querySelector("#wrapSvg");

  if (svgElement) {
    svgElement.remove();
  }

  for (const prop in currentValues) {
    const svgElement = newWrapWithSvg.querySelector("svg");
    const targetTextElement = findTextTagInSVG(svgElement, prop);
    if (targetTextElement) {
      targetTextElement.textContent =
        currentValues[prop] || targetTextElement.textContent;
    }
  }

  wrapPreviewElem.appendChild(newWrapWithSvg);
};

function addInput() {
  const inputsContainer = document.getElementById("inputs-container");
  const inputs = inputsContainer.querySelectorAll(".parametr__input");
  const addInputBtn = document.querySelector("#addInput");
  const inputsLength = inputs && inputs.length;
  if (inputsLength >= 6) {
    return;
  }

  if (inputsLength >= 5) {
    addInputBtn.disabled = true;
  }

  const inputWrapper = document.createElement("div");
  const inputKey = inputsLength + 1;
  inputWrapper.classList.add("input-container");

  const input = document.createElement("input");
  input.id = `parametr__input_${inputKey}`;
  input.className = `parametr__input`;
  input.type = "text";
  input.name = `parament-${inputKey}`;
  input.required = true;

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.textContent = "Удалить";
  deleteBtn.classList.add("delete-btn");
  deleteBtn.onclick = function () {
    removeInput(deleteBtn);
  };

  input.addEventListener("input", function () {
    const newText = this.value;
    const svgElement = document.querySelector("#wrapSvg svg");
    const targetTextElement = findTextTagInSVG(svgElement, `x${inputKey}`);
    if (targetTextElement) {
      targetTextElement.textContent = newText;
    }
  });

  inputWrapper.appendChild(input);
  inputWrapper.appendChild(deleteBtn);
  inputsContainer.appendChild(inputWrapper);

  const selectedSymbol = document.querySelector(".wrap-symbol-svg.selected");
  if (selectedSymbol.id) changePreviewSvg(selectedSymbol.id);
}

function removeInput(btn) {
  const inputs = document.querySelectorAll(".parametr__input");
  const addInputBtn = document.querySelector("#addInput");
  const inputsLength = inputs && inputs.length;
  if (inputsLength - 1 < 6) {
    addInputBtn.disabled = false;
  }

  const inputWrapper = btn.parentElement;
  inputWrapper.remove();

  const selectedSymbol = document.querySelector(".wrap-symbol-svg.selected");
  if (selectedSymbol.id) changePreviewSvg(selectedSymbol.id);
}

function selectItem(item) {
  const dropdownIcon = document.querySelector(".dropdown-designation-value");
  dropdownIcon.textContent = item;

  if (!item) {
    return;
  }
  const svgElement = document.querySelector("#wrapSvg svg");
  const targetTextElement = findTextTagInSVG(svgElement, "z");
  if (targetTextElement) {
    targetTextElement.textContent = item;
  }
}

// Пример использования функции
export const showModal = addModal(
  `<h2 style="text-align: center;font-size: 20px;margin: 0;">Обозначение шероховатости:</h2>
  <div id="roughnessContent">
    <div class="roughness-content-1">
      <div class="content-1-wrap-preview"><span id="wrapSvg">${ra1_1}</span></div>
      <div class="content-1-wrap-manual-svg">
      <span>${raManual}</span>
      </div>
    </div>
    <div class="roughness-content-2">
      <div class="roughness-symbol">
        <p>Знак шероховатости:</p>
        <span id="ra1" class="wrap-symbol-svg selected">${ra1}</span>
        <span id="ra2" class="wrap-symbol-svg">${ra2}</span>
        <span id="ra3" class="wrap-symbol-svg">${ra3}</span>
      </div>
      <div class="processing-method">
        <label for="name">Способ обработки:</label>
        <input type="text" id="processingMethod" name="processing-method" required minlength="1" maxlength="12" size="10" />
      </div>
      <div class="roughness-parameters">
        <p>Параметры шероховатости:</p>
        <form id="dynamic-form">
          <div id="inputs-container">
              <input class="parametr__input" id="parametr__input" type="text" name="parament-1" required>
          </div>
          <button id="addInput" class="form-add-input" type="button">Добавить параметр</button>
        </form>
      </div>
      <div class="cond-designation">
        <p>Усл. обозначение направления обработки:</p>
        <div class="dropdown-designation">
        <span class="dropdown-designation-value"></span>
        <span class="dropdown-designation-icon">▼</span>
        <div class="dropdown-designation-content">
          <div>\u2534</div>
          <div>x</div>
          <div>P</div>
          <div>M</div>
          <div>C</div>
          <div>R</div>
        </div>
      </div>
      </div>
    </div>
  </div>
  `
);
