import { emitter } from "../utils";


function addModal(content) {
  const modal = document.createElement("div");
  modal.className = "modal-background";

  const modalContent = document.createElement("div");

  modalContent.innerHTML = content;

  modalContent.className = "wrap-modal-ck-editor";

  const closeButton = modalContent.querySelector("#closeBtn");
  closeButton.innerHTML = "&times;";

  const wrapAllowanceInputs = modalContent.querySelector(".wrap-parametr-input");
  const parametrInput = wrapAllowanceInputs.querySelector("input");

  const _values = {type: 'number'};
  parametrInput.addEventListener("input", function () {
const inputValue = this.value;
    if(_values.type === 'text') {
      const newValue = inputValue.replace(/[0-9]/g, '');
      // Обновляем значение input
      this.value = newValue;
    }
    if(_values.type === 'number') {
      const newValue = inputValue.replace(/[^0-9+\-*/.]/g, '');

      // Обновляем значение input
      this.value = newValue;
    }

    const newText = this.value
      _values['parametr'] = newText;
  });

  function handleSelectChange(event) {
    _values.type = event.target.value;
    // parametrInput.type = _values.type;
    parametrInput.value = '';
}

const selectElement = modalContent.querySelector('#exampleSelect');

selectElement.addEventListener('change', handleSelectChange);

  const saveBtn = modalContent.querySelector("#saveBtn");

  if (saveBtn) {
    saveBtn.onclick = function () {
      if (_values.parametr) {
        emitter.emit("insertParametr", _values);
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

export const showParametrModal = (args) =>
  addModal(
    `<h2 style="text-align: center;font-size: 20px;margin: 0;">Установка значений:</h2>
    <div>
        <div class="wrap-parametr-select">
        <label for="exampleSelect">Выберите опцию:</label>
        <select id="exampleSelect" name="options">
        <option ${args ? args.type === 'number' ? 'selected' : '' : 'selected'} value="number">число</option>
        <option ${args?.type === 'text' ? 'selected' : ''} value="text">текст</option>
        </select>
        </div>
        <div class="wrap-parametr-input">
        <input type="text" id="x" name="x" placeholder="x" value="${args?.parametr || ''}"  required />
        </div>
    </div>
    <button id="saveBtn" type="button">Добавить</button>
    <button id="closeBtn" type="button">Добавить</button>
  `,
  args || {}
  );
