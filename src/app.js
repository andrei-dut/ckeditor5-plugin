import ClassicEditor from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";
import Essentials from "@ckeditor/ckeditor5-essentials/src/essentials";
import Paragraph from "@ckeditor/ckeditor5-paragraph/src/paragraph";
import Bold from "@ckeditor/ckeditor5-basic-styles/src/bold";
import Italic from "@ckeditor/ckeditor5-basic-styles/src/italic";
import "./styles/styles.css";
import IconPickerPlugin from "./iconPlugin/iconPickerPlugin";
import IconPlugin from './iconPlugin/IconPlugin';

ClassicEditor.create(document.querySelector("#editor"), {
  plugins: [Essentials, Paragraph, Bold, Italic, IconPickerPlugin, IconPlugin],
  toolbar: ["bold", "italic", "iconPickerButton"],
})
  .then((editor) => {
    console.log("Editor was initialized", editor);
  })
  .catch((error) => {
    console.error(error.stack);
  });