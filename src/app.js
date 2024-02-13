import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";
import Essentials from "@ckeditor/ckeditor5-essentials/src/essentials";
import Paragraph from "@ckeditor/ckeditor5-paragraph/src/paragraph";
import Bold from "@ckeditor/ckeditor5-basic-styles/src/bold";
import Italic from "@ckeditor/ckeditor5-basic-styles/src/italic";
import "./styles/styles.css";
import IconPickerPlugin from "./iconPlugin/iconPickerPlugin";
import IconPlugin from './iconPlugin/IconPlugin';
// import { openEditSvgModal, showModal } from "./js/manageCustomModal copy";




ClassicEditor.create(document.querySelector("#editor"), {
  plugins: [Essentials, Paragraph, Bold, Italic, IconPickerPlugin, IconPlugin],
  toolbar: ["bold", "italic", "iconPickerButton"],
})
  .then((editor) => {
    // openEditSvgModal()
    // showModal()
    console.log("Editor was initialized", editor);
  })
  .catch((error) => {
    console.error(error.stack);
  });


//   import ckeditor from './ckeditor/ckeditor'


// console.log(ckeditor);
// console.log(ckeditor.ClassicEditor.create);


// ckeditor.ClassicEditor.create(document.querySelector("#editor"), {
//   toolbar: [
//       'Undo', 'Redo', '|',
//       'Bold', 'Italic', 'Underline', 'Strikethrough', 'Subscript', 'Superscript', '|',
//       'RemoveFormat', '|',
//       '/',
//       'NumberedList', 'BulletedList', 'Outdent', 'Indent', '|',
//       'FontColor', 'FontBackgroundColor', '|',
//       '/',
//       'Heading', 'FontFamily', 'FontSize', '|', 'ImageUpload'
//   ],
//   startupFocus: false // N/A CKEDITOR5
// })
//   .then((editor) => {
//     // openEditSvgModal()
//     // showModal()
//     console.log("Editor was initialized", editor);
//   })
//   .catch((error) => {
//     console.error(error.stack);
//   });
