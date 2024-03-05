
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
        "customLink"
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
    console.log("Editor was initialized", editor);
    console.log("doc", editor.model.document);


    editor.model.document.on("change:data", () => {
      // console.log("data");
    });

    editor.on("customLinkEvent", (e, currentData) => {
      

      const {eventType, value} = currentData || {};

      if(eventType === 'insert') {
        console.log("insert", value);
      }

      if(eventType === "update") {
        console.log("update", value);
      }
      if(eventType === "openModal") {
        console.log("openModal", value);
      }



      // const currentData = _.find(arg)
    });
    editor.editing.view.document.on("blur", (...arg) => {
      console.log("foc", arg);
    });
  })
  .catch((error) => {
    console.error(error.stack);
  });
