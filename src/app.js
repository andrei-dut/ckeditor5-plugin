import { ClassicEditor } from "./ckeditor";
import { CopyCutPastePlugin } from "./customPlugins/copyCutPastePlugin/copyCutPastePlugin";
import { CustomLinkPlugin } from "./customPlugins/customLinkPlugin/customLinkPlugin";
import {CustomListPlugin} from "./customPlugins/customListPlugin/customListPlugin";
import { viewToModelElem } from "./customPlugins/editorUtils";
import { IconPickerPlugin } from "./customPlugins/insertIconPlugin/IconPickerPlugin";
import { getArrayImgObjByHtmlString } from "./customPlugins/utils";
import { customSpecialCharacters } from "./customPlugins/vars";
import "./customPlugins/styles/styles.css";
import { parseAllReqDivTags, parseReqDivTags } from "./utils/utils";

// Ваша обычная HTML разметка
const htmlString = `
<div>
    <p>This is a paragraph.</p>
    <div>This is another div.</div>
</div>`;

// Преобразование HTML в строку base64
const base64String = btoa(htmlString);

// Создание элемента img
const img = new Image();
img.src = `data:image/html;base64,${base64String}`;

// Вставка элемента img в документ
document.body.appendChild(img);

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
        "specialCharacters",
        "Superscript",
        "Subscript",
        "customList",

        "test",
        "test1",
        "test2",

        "add",
        "remove",
        "moveUp",
        "moveDown",
        "levelUp",
        "levelDown",
      ],
    },
    removePlugins: ["ImageResize", "FontColor"],
    language: "ru",
    customSpecialCharacters,
  };
}

Editor.builtinPlugins.push(IconPickerPlugin);
Editor.builtinPlugins.push(CustomLinkPlugin);
Editor.builtinPlugins.push(CopyCutPastePlugin);
Editor.builtinPlugins.push(CustomListPlugin);

// delete selected content editor.model.deleteContent(modelSelect)

Editor.create(document.querySelector("#editor"), {})
  .then((editor) => {



    const textTEst = `<div class="requirement ck-widget"  contenteditable="false"   >
    <div class="aw-requirement-marker">
    
      <span class="aw-ckeditor-marker-element" title="1">1</span>   
      </div>
      
      <div class="aw-requirement-content">
        <div class="aw-requirement-bodytext ck-editor__editable ck-editor__nested-editable" isdirty="false" contenteditable="true"><p>Содержимоеcv</p></div>
        </div><div class="ck ck-reset_all ck-widget__type-around"><div class="ck ck-widget__type-around__button ck-widget__type-around__button_before" title="Вставить параграф перед блоком"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8"><path d="M9.055.263v3.972h-6.77M1 4.216l2-2.038m-2 2 2 2.038"></path></svg></div><div class="ck ck-widget__type-around__button ck-widget__type-around__button_after" title="Вставить параграф после блока"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8"><path d="M9.055.263v3.972h-6.77M1 4.216l2-2.038m-2 2 2 2.038"></path></svg></div><div class="ck ck-widget__type-around__fake-caret"></div>
      
      
      </div></div>`;

    const textTEst01 = `<div class="requirement ck-widget"  contenteditable="false"     >
    <div class="aw-requirement-marker">
    
      <span class="aw-ckeditor-marker-element" title="2">2</span>   
      </div>
      
      <div class="aw-requirement-content">
        <div class="aw-requirement-bodytext ck-editor__editable ck-editor__nested-editable" isdirty="false" contenteditable="true"><p>Содержимоеcv</p></div>
        </div><div class="ck ck-reset_all ck-widget__type-around"><div class="ck ck-widget__type-around__button ck-widget__type-around__button_before" title="Вставить параграф перед блоком"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8"><path d="M9.055.263v3.972h-6.77M1 4.216l2-2.038m-2 2 2 2.038"></path></svg></div><div class="ck ck-widget__type-around__button ck-widget__type-around__button_after" title="Вставить параграф после блока"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8"><path d="M9.055.263v3.972h-6.77M1 4.216l2-2.038m-2 2 2 2.038"></path></svg></div><div class="ck ck-widget__type-around__fake-caret"></div>
      
      
      </div></div>`;

    const textTEst2 = `<div class="requirement ck-widget"   contenteditable="false"     >
    <div class="aw-requirement-marker">
    
      <span class="aw-ckeditor-marker-element" title="3">3</span>   
      </div>
      
      <div class="aw-requirement-content">
        <div class="aw-requirement-bodytext ck-editor__editable ck-editor__nested-editable" isdirty="false" contenteditable="true"><p>Содержимоеcv</p></div>
        </div><div class="ck ck-reset_all ck-widget__type-around"><div class="ck ck-widget__type-around__button ck-widget__type-around__button_before" title="Вставить параграф перед блоком"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8"><path d="M9.055.263v3.972h-6.77M1 4.216l2-2.038m-2 2 2 2.038"></path></svg></div><div class="ck ck-widget__type-around__button ck-widget__type-around__button_after" title="Вставить параграф после блока"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 8"><path d="M9.055.263v3.972h-6.77M1 4.216l2-2.038m-2 2 2 2.038"></path></svg></div><div class="ck ck-widget__type-around__fake-caret"></div>
      
      ${textTEst}
      </div></div>`;

    setTimeout(() => {
      editor.setData(

          " " +
          " " +
          textTEst +
          " " +
          textTEst01 +
          " " +
          textTEst2 
      );
    }, 500);

    console.log("Editor was initialized", editor);
    console.log("doc", editor.model.document);

    editor.model.document.on("change:data", () => {
      // console.log("data");
    });

    // editor.editing.view.document.on("selectionChange", (e, data) => {
    //   const model = editor.model;
    //   const selection = model.document.selection;
    //   console.log("datselectionChangea", selection, data, e);
    //   window.selec = selection;
    // });

    editor.on("selectionLiElem", (e, currentData) => {
      console.log("selectionLiElem", currentData);
      const value = currentData.value;
      const model = editor.model;
      model.change((writer) => {
        if (value) {
          value._setAttribute("data-custom_comment", 222);
          // writer.setAttribute("data-custom_comment", 222, viewToModelElem(editor, value));
          console.log("data-custom_comment", 222, value);
        }
      });
    });

    editor.on("selectionReqElem", (e, currentData) => {
      console.log("selectionReqElem", currentData);
      const value = currentData.value;
      const model = editor.model;
      model.change((writer) => {
        if (value) {
          value._setAttribute("data-custom_comment", 222);
          writer.setAttribute("data-custom_comment", 222, viewToModelElem(editor, value));
          console.log("data-custom_comment", 222, value);
        }
      });
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

      if (eventType === "openModal") {
        // console.log(editor.commands.get("undo"));
        // editor.commands
        //   .get("undo")
        //   .on("change:isEnabled", (e, args, newVal, oldVal) => {
        //     console.log(e, args, newVal, oldVal);
        //   });




console.log("parseReqDivTags",editor.getData(), parseAllReqDivTags(editor.getData()));



        // console.log(editor.getData());
        console.log(getArrayImgObjByHtmlString(editor.getData()));

        console.log("openModal", value);
      }

      // const currentData = _.find(arg)
    });

    editor.editing.view.document.on("clipboardOutput", (eventInfo, data) => {
      console.log(
        "clipboardOutput",
        eventInfo,
        data,
        editor.data.htmlProcessor.toData(data.content)
      );
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
  const startRex = /^\s*<li\b[^>]*>/i;
  if (Array.isArray(liObjectsOrArray)) {
    liObjectsOrArray.forEach((content) => {
      const wrapInLiTag = startRex.test(content) && /<\/li>\s*$/i.test(content);
      htmlContent += wrapInLiTag ? `${content}` : `<li>${content}</li>`;
    });
  } else {
    for (const key in liObjectsOrArray) {
      const liObject = liObjectsOrArray[key];
      const wrapInLiTag = startRex.test(liObject.content) && /<\/li>\s*$/i.test(liObject.content);
      htmlContent += wrapInLiTag ? `${liObject.content}` : `<li>${liObject.content}</li>`;
    }
  }
  htmlContent += "</ol>";
  return htmlContent;
}

// const liObjects = {
//   1: { number: 1, content: "Mix flour, baking powder, sugar, and salt." },
//   2: { number: 2, content: "In another bowl, mix eggs, milk, and oil." },
//   3: { number: 3, content: "Stir <p>both mixtures</p> together." },
//   4: { number: 4, content: "Fill muffin tray 3/4 full." },
//   5: { number: 5, content: "Bake for 20 minutes." },
// };

// const _htmlContent = createHtmlFromLiObjects(liObjects);
// const __htmlContent = createHtmlFromLiObjects(["a", "b", "c"]);
// console.log(_htmlContent);
// console.log(__htmlContent);
