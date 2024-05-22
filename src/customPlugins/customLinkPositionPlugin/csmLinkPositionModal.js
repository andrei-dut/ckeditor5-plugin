import { emitter } from '../utils';

function addModal(content, items) {
  const modal = document.createElement("div");
  modal.className = "modal-background";

  const modalContent = document.createElement("div");

  modalContent.innerHTML = content;

  modalContent.className = "wrap-modal-ck-editor";

  const closeButton = modalContent.querySelector("#closeBtn");
  closeButton.innerHTML = "&times;";

  const wrapInputs = modalContent.querySelector(".radio-container");
  const _Inputs = wrapInputs.querySelectorAll("input");

  let _values = { };
  _Inputs?.forEach(function (input) {
    input.addEventListener("input", function () {
      const id = this.id;
      const selectedItem = items.find(item => String(item.uid) === String(id));
      _values = Object.assign({}, selectedItem);
    });
  });

  const saveBtn = modalContent.querySelector("#saveBtn");

  if (saveBtn) {
    saveBtn.onclick = function () {
      if(_values.uid) {
        emitter.emit("onInsertLinkPosition", _values);
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
  const radioButtonsHtml = items.map(item => `
    <label>
      <input type="radio" id="${item.uid}" name="radioGroup" value="${item.value}" />
      ${item.position} - ${item.value}
    </label>
  `).join('');

  addModal(
    `<h2 style="text-align: center;font-size: 20px;margin: 0;">Выберите значение:</h2>
    <div class="radio-container">
      ${radioButtonsHtml}
    </div>
    <button id="saveBtn" type="button">Добавить</button>
    <button id="closeBtn" type="button">Закрыть</button>
  `, items);
};
