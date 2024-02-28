// import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";
// import Essentials from "@ckeditor/ckeditor5-essentials/src/essentials";
// import Paragraph from "@ckeditor/ckeditor5-paragraph/src/paragraph";
// import Bold from "@ckeditor/ckeditor5-basic-styles/src/bold";
// import Italic from "@ckeditor/ckeditor5-basic-styles/src/italic";
// import "./styles/styles.css";
// import IconPickerPlugin from "./iconPlugin/iconPickerPlugin";
// import IconPlugin from './iconPlugin/IconPlugin';
// // import { openEditSvgModal, showModal } from "./js/manageCustomModal copy";

// console.log(ClassicEditor)

// ClassicEditor.create(document.querySelector("#editor"), {
//   plugins: [Essentials, Paragraph, Bold, Italic, IconPickerPlugin, IconPlugin],
//   toolbar: ["bold", "italic", "iconPickerButton"],
// })
//   .then((editor) => {
//     // openEditSvgModal()
//     // showModal()
//     console.log("Editor was initialized", editor);
//   })
//   .catch((error) => {
//     console.error(error.stack);
//   });

import { ClassicEditor } from "./ckeditor";
import { IconPickerPlugin } from "./finishPlugin/IconPickerPlugin";

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
        "Italic",
        "Underline",
        "Strikethrough",
        "Subscript",
        "Superscript",
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
      ],
    },
    language: "ru",
  };
}

Editor.builtinPlugins.push(IconPickerPlugin);


// Функция для перемещения строки списка вверх или вниз
function moveListItemInParent(source) {
  const anchor = source?.anchor;
  if(anchor) {

    console.log('source',source);
    setTimeout(() => {

        const olEl = findParent(source.anchor, 'ol')
        const selectLi = findParent(source.anchor, 'li')
        if(!olEl) return;
        // reverse()
        const previousSibling = selectLi.previousSibling
        const nextSibling = selectLi.nextSibling
        console.log('selectLi', selectLi, );
        if(previousSibling) {
          
          const prevind = previousSibling?.index;
          console.log('previousSibling',previousSibling, prevind);
          olEl._insertChild(prevind, selectLi);
        } else if(nextSibling) {
        
          const nextInd = nextSibling?.index;
          console.log('nextSibling',nextSibling, nextInd);
          olEl._insertChild(nextInd, selectLi);
        } else {
          console.log('else');
        }


        // olEl._insertChild(0, selectLi)
        // const children = [...olEl._children].reverse()
        // olEl._children = children;
        // console.log('findParent',olEl._children, children);
    }, );

  }
}

function findParent(element, parentName) {
  console.log(element, parentName);
  // Начинаем с переданного элемента
  let currentElement = element;

  if(!currentElement) return null
  // Рекурсивно ищем родителя
  while (currentElement) {
      const parentElement = currentElement.parent;

      // Если родитель найден, проверяем его с помощью переданной функции
      if (parentElement) {
          if (parentElement.name === parentName) {
              // Если функция возвращает true, возвращаем найденный родитель
              return parentElement;
          } else {
              // Иначе продолжаем искать в родителе родителя
              currentElement = parentElement;
          }
      } else {
          // Если текущий элемент не имеет родителя, значит, мы достигли корневого элемента
          // и завершаем поиск
          return null;
      }
  }

  return null; // Возвращаем null, если ничего не найдено
}

// delete selected content editor.model.deleteContent(modelSelect)


Editor.create(document.querySelector("#editor"), {})
  .then((editor) => {
    // openEditSvgModal()
    // showModal()
    console.log("Editor was initialized", editor);
    console.log("doc", editor.model.document);

    // editor.editing.view.document.selection.on("change", (e) => {
    //   console.log(2323);
    // })
    //   const source = e.source;

    //   console.log('editor.editing.view-change',e,source, source._ranges);
    //   setTimeout(() => {

    //       const olEl = findParent(source.anchor, 'ol')
    //       const selectLi = findParent(source.anchor, 'li')
    //       if(!olEl) return;
    //       // reverse()
    //       const previousSibling = selectLi.previousSibling
    //       const nextSibling = selectLi.nextSibling
    //       console.log('selectLi', selectLi, );
    //       if(previousSibling) {
            
    //         const prevind = previousSibling?.index;
    //         console.log('previousSibling',previousSibling, prevind);
    //         olEl._insertChild(prevind, selectLi);
    //       } else if(nextSibling) {
          
    //         const nextInd = nextSibling?.index;
    //         console.log('nextSibling',nextSibling, nextInd);
    //         olEl._insertChild(nextInd, selectLi);
    //       } else {
    //         console.log('else');
    //       }


    //       // olEl._insertChild(0, selectLi)
    //       // const children = [...olEl._children].reverse()
    //       // olEl._children = children;
    //       // console.log('findParent',olEl._children, children);
    //   }, );


    // })

    // editor.model.document.selection.on("change", (...args) => {
    //   return;
    //   const modelSelect = editor.model.document.selection
    //   const viewSelect = editor.editing.view.document.selection

    //   console.log("selChange", args);
    //   console.log(viewSelect, modelSelect);


    //   console.log( );
    //   const ranges = modelSelect.getRanges().next().value

    //   console.log(ranges.getContainedElement());

    //   console.log(editor.model.getSelectedContent(modelSelect) );

    //   let selectedList;
    //   for (const block of modelSelect.getSelectedBlocks()) {
    //     if(block.name === 'listItem') {
    //       // selectedList = block._clone(true);
    //       // block._removeChildren(0);
    //     }
    //     console.log("Selected Block:", block);
    //     // Вы можете выполнить действия с каждым выбранным блоком здесь
    // }

    //   moveListItem(editor, selectedList);
    //   // const selectedBlocks = Array.from(
    //   //   editor.model.document.selection.getSelectedBlocks()
    //   // );
    //   // console.log(selectedBlocks);
    //   // if (selectedBlocks.length > 0) {
    //   //   const selectedElement = selectedBlocks[0]; // Берем только первый выбранный элемент
    //   //   console.log("Selected Element:", selectedElement);
    //   // }

    //   // const selectedViewElement =
    //   //   editor.editing.view.document.selection.getSelectedElement();
    //   // console.log(
    //   //   selectedViewElement,
    //   //   editor.editing.view.document.selection.getSelectedElement,
    //   //   editor.editing.view.document.selection
    //   // );
    //   // if (selectedViewElement) {
    //   //   console.log("Selected View Element:", selectedViewElement);
    //   // }
    // });

    editor.model.document.on("change:data", () => {
      // console.log("data");
    });
  })
  .catch((error) => {
    console.error(error.stack);
  });
