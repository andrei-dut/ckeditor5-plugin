import { ClassicEditor } from "./ckeditor";
import { CustomLinkPlugin } from "./customPlugins/customLinkPlugin/customLinkPlugin";
import { IconPickerPlugin } from "./customPlugins/insertIconPlugin/IconPickerPlugin";

class Editor extends ClassicEditor {
  static addPlugin(plugin) {
    if (!this.builtinPlugins.includes(plugin)) {
      this.builtinPlugins.push(plugin);
    }
  }

  static defaultConfig = {
    toolbar: {
      items: [
        "Undo",
        "Redo",
        "|",
        "Bold",
        "|",
        "RemoveFormat",
        "|",
        "/",
        "NumberedList",
        "BulletedList",
        "Outdent",
        "Indent",
        "|",
        "FontColor",
        "FontBackgroundColor",
        "|",
        "/",
        "Heading",
        "FontFamily",
        "FontSize",
        "|",
        "ImageUpload",
        "link",
        "iconPickerButton",
        "customLink",
      ],
    },
    language: "ru",
  };
}

Editor.builtinPlugins.push(IconPickerPlugin);
Editor.builtinPlugins.push(CustomLinkPlugin);

// delete selected content editor.model.deleteContent(modelSelect)

Editor.create(document.querySelector("#editor"), {})
  .then((editor) => {
    const liObjects = {
      1: { number: 1, content: "Mix flour, baking powder, sugar, and salt." },
      2: { number: 2, content: "In another bowl, mix eggs, milk, and oil." },
      3: { number: 3, content: "Stir <span>both mixtures</span> together." },
      4: { number: 4, content: "Fill muffin tray 3/4 full." },
      5: { number: 5, content: "Bake for 20 minutes." },
    };

    const _htmlContent = createHtmlFromLiObjects(liObjects);

    editor.setData(_htmlContent);

    console.log("Editor was initialized", editor);
    console.log("doc", editor.model.document);

    editor.model.document.on("change:data", () => {
      // console.log("data");
    });

    editor.editing.view.document.on("selectionChange", (e, data) => {
      const model = editor.model;
      const selection = model.document.selection;
      console.log("datselectionChangea", selection, data, e);
      window.selec = selection;
    });

    editor.on("customLinkEvent", (e, currentData) => {
      console.log("call_customLinkEvent");

      const { eventType, value } = currentData || {};

      if (eventType === "onNavLink") {
        console.log("onNavLink", value);
      }

      if (eventType === "editSelectedLink") {
        console.log("editSelectedLink", value);
      }

      if (eventType === "insert") {
        console.log("insert", value);
      }

      if (eventType === "update") {
        console.log("update", value);
      }

      function copyTextToClipboard(text) {

        const type = "text/plain";
        const blob = new Blob([text], { type });
        const data = [new ClipboardItem({ [type]: blob })];

        navigator.clipboard
          .write(data)
          .then(() => {
            console.log("Текст скопирован в буфер обмена");
          })
          .catch((err) => {
            console.error("Не удалось скопировать текст: ", err);
          });
      }

      if (eventType === "openModal") {
        const model = editor.model;

        try {
          var successful = document.execCommand("paste", false, '123');
          var msg = successful
            ? "Успешно скопировано в буфер обмена"
            : "Не удалось скопировать в буфер обмена";
          console.log(msg);

          const result = document.execCommand('paste')
          console.log('document.execCommand result: ', result);

          const viewDocument = editor.editing.view.document;

          const dataController = editor.data;
          const content = editor.data.toView(
            editor.model.getSelectedContent(modelDocument.selection)
          );

          viewDocument.fire("clipboardOutput", {
            dataTransfer: data.dataTransfer,
            content,
            method: 'paste',
          });



          // Пример использования
          // copyTextToClipboard("Текст для копирования");
        } catch (err) {
          console.error("Ошибка при копировании текста: ", err);
        }

        console.log(editor.commands.get("undo"));

        model.change((writer) => {
          const content = editor.data.toView(
            editor.model.getSelectedContent(window.selec)
          );

          console.log(content);
          console.log(editor.data.htmlProcessor.toData(content));

          // console.log(window.selec.getRanges());
          // console.log(window.selec._ranges);
          // writer.remove(window.selec._selection._ranges[0]);

          // editor.model.deleteContent(window.selec);
        });
        console.log("openModal", value);
      }

      // const currentData = _.find(arg)
    });

    editor.editing.view.document.on("clipboardOutput", (eventInfo, data) => {
      console.log("clipboardOutput", eventInfo, data, editor.data.htmlProcessor.toData(data.content));
    });

    editor.editing.view.document.on("clipboardInput", (eventInfo, data) => {
      console.log("clipboardInput", eventInfo, data);
    });

    editor.on("clicked", (e, currentData) => {
      console.log("clicked", e, currentData);
    });
    editor.editing.view.document.on("blur", (...arg) => {
      console.log("foc", arg);
    });
  })
  .catch((error) => {
    console.error(error.stack);
  });

export function parseLiTags(htmlContent) {
  const tempElement = document.createElement("div");
  tempElement.innerHTML = htmlContent;

  const olElement = tempElement.querySelector("ol");

  if (!olElement) {
    return {};
  }

  const liObjects = {};

  const liTags = olElement.children;

  for (const child of liTags) {
    if (child.tagName && child.tagName.toLowerCase() === "li") {
      const liNumber = Object.keys(liObjects).length + 1;
      const liContent = child.innerHTML;
      liObjects[liNumber] = {
        number: liNumber,
        content: liContent,
      };
    }
  }

  return liObjects;
}

const htmlContent = `
  <ol>
  dfgdfg
  <p>fi343</p>
  <li>first item</li>
  <li>
    second item
    <ol>
      <li>second item first subitem</li>
      <li>second item second subitem</li>
      <li>second item third subitem</li>
    </ol>
  </li>
  <li>third item</li>
</ol>
  `;

const parsedLiTags = parseLiTags(htmlContent);
console.log(parsedLiTags);

function createHtmlFromLiObjects(liObjectsOrArray) {
  let htmlContent = "<ol>";
  if (Array.isArray(liObjectsOrArray)) {
    liObjectsOrArray.forEach((content) => {
      htmlContent += `<li>${content}</li>`;
    });
  } else {
    for (const key in liObjectsOrArray) {
      const liObject = liObjectsOrArray[key];
      htmlContent += `<li>${liObject.content}</li>`;
    }
  }
  htmlContent += "</ol>";
  return htmlContent;
}

const liObjects = {
  1: { number: 1, content: "Mix flour, baking powder, sugar, and salt." },
  2: { number: 2, content: "In another bowl, mix eggs, milk, and oil." },
  3: { number: 3, content: "Stir <p>both mixtures</p> together." },
  4: { number: 4, content: "Fill muffin tray 3/4 full." },
  5: { number: 5, content: "Bake for 20 minutes." },
};

const _htmlContent = createHtmlFromLiObjects(liObjects);
const __htmlContent = createHtmlFromLiObjects(["a", "b", "c"]);
console.log(_htmlContent);
console.log(__htmlContent);
