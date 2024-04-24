
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
  const allowanceInputs = wrapAllowanceInputs.querySelectorAll("input");

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

export const showAllowanceModal = (args) =>
  addModal(
    `<h2 style="text-align: center;font-size: 20px;margin: 0;">Установка значений:</h2>
    <div>
        <div class="wrap-allowance-icon">
            <span class="aw-req-allowance-icon">
                <span id="allowance_x" class="allowance-number">${args?.oldValues.x || "X"}</span>
                <span id="allowance_y" class="allowance-number">${args?.oldValues.y || "Y"}</span>
            </span>
        </div>
        <div class="wrap-allowance-inputs">
        <input type="text" id="x" name="x" placeholder="x"  required />
        <input type="text" id="y" name="y" placeholder="y" required />
        </div>
    </div>
    <button id="saveBtn" type="button">Добавить</button>
    <button id="closeBtn" type="button">Добавить</button>
  `,
  args || {}
  );
