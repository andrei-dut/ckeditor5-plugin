
import { emitter } from '../utils';

function addModal(content) {
  const modal = document.createElement("div");
  modal.className = "modal-background";

  const modalContent = document.createElement("div");

  modalContent.innerHTML = content;

  modalContent.className = "wrap-modal-ck-editor";

  const closeButton = modalContent.querySelector("#closeBtn");
  closeButton.innerHTML = "&times;";

  const wrapAllowanceInputs = modalContent.querySelector(".wrap-allowance-inputs");
  const wrapAllowance = modalContent.querySelector(".aw-req-allowance-icon");
  const allowanceInputs = wrapAllowanceInputs?.querySelectorAll("input");

  const _values = {};
  allowanceInputs?.forEach(function (input) {
    const allowanceSpan = wrapAllowance.querySelector(`#allowance_${input.id}`);
    input.addEventListener("input", function () {
      const newText = this.value;
      if (allowanceSpan) {
        _values[input.id] = newText;
        allowanceSpan.textContent = newText;
      }
    });
  });

  const saveBtn = modalContent.querySelector("#saveBtn");

  if (saveBtn) {
    saveBtn.onclick = function () {
      if (_values.x && _values.y) {
        emitter.emit("insertAllowance", _values);
        modal.remove();
      }
    };
  }

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

export const showLinkPositionModal = (items) => {
  const checkboxesHtml = items.map(item => `
    <label>
      <input type="checkbox" id="${item.uid}" name="${item.value}" />
      ${item.position} - ${item.value}
    </label>
  `).join('');

  addModal(
    `<h2 style="text-align: center;font-size: 20px;margin: 0;">Выберите значения:</h2>
    <div class="checkbox-container">
      ${checkboxesHtml}
    </div>
    <button id="saveBtn" type="button">Сохранить</button>
    <button id="closeBtn" type="button">Закрыть</button>
  `);
};
