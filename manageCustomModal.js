import { emitter } from "./utils";

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
    closeEditSvgModal()
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
