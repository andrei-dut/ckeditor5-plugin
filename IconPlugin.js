import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import { toWidget, viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget/src/utils';
import sing from "./icons/sign.svg";
// Регистрируем новый тип элемента "icon"
class IconPlugin extends Plugin {
  static get pluginName() {
    return "IconPlugin";
  }

  init() {
    const editor = this.editor;

    editor.model.schema.register("icon", {
      isObject: true,
      allowWhere: "$block",
      allowAttributes: ["data-name", "data-icon"],
    });

    editor.conversion
      .for("upcast")
      .elementToElement({
        model: "icon",
        view: {
          name: "div",
          classes: "icon",
        },
      })
      .add((dispatcher) => {
        console.log(dispatcher);
        dispatcher.on("element:div", (evt, data, conversionApi) => {
          console.log(evt, data, conversionApi);
        });
      });

    editor.conversion.for("editingDowncast").elementToElement({
      model: "icon",
      view: (modelElement, viewWriter) => {
        console.log("editingDowncast");
        // console.log(modelElement.getAttribute("data-icon"));
        const span = viewWriter.writer.createRawElement(
          "span",
          {
            id: "foo-1234",
            class: 'widget'
          },
          function (domElement) {
            domElement.innerHTML = modelElement.getAttribute("data-icon");
          }
        );

        console.log(span);
        return span;
      },
    });

    editor.conversion.for("dataDowncast").elementToElement({
      model: "icon",
      view: (modelElement, viewWriter) => {
        console.log("dataDowncast");
        // console.log(modelElement.getAttribute("data-icon"));
        const span = viewWriter.writer.createRawElement(
          "span",
          {
            id: "foo-1234",
            class: 'widget'
          },
          function (domElement) {
            domElement.innerHTML = modelElement.getAttribute("data-icon");
          }
        );

        console.log(span);
        return span;
      },
    });
  }
}

export default IconPlugin;

{
  /* <defs/><g><path d="M 30 70 L 70 0" fill="none" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="stroke"/><path d="M 70 0 L 170 0" fill="none" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="stroke"/><ellipse cx="31" cy="36" rx="15" ry="15" fill="rgb(255, 255, 255)" stroke="rgb(0, 0, 0)" pointer-events="all"/><path d="M 30 70 L 0 10" fill="none" stroke="rgb(0, 0, 0)" stroke-miterlimit="10" pointer-events="stroke"/></g> */
}
