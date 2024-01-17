// iconPickerPlugin.js
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import {
  addToolbarToDropdown,
  ButtonView,
  createDropdown,
} from "@ckeditor/ckeditor5-ui";
import sing from "./icons/sign.svg";
import bold from "@ckeditor/ckeditor5-core/theme/icons/bold.svg";
import Widget from "@ckeditor/ckeditor5-widget/src/widget";
import WidgetResize from "@ckeditor/ckeditor5-widget/src/widgetresize";
import ClickObserver from "@ckeditor/ckeditor5-engine/src/view/observer/clickobserver";
import { replaceTextInSvg } from "./utils";
// import SelectionObserver from '@ckeditor/ckeditor5-engine/src/view/observer/selectionobserver';

class IconPickerPlugin extends Plugin {
  static get requires() {
    return [Widget, WidgetResize];
  }

  static get pluginName() {
    return "IconPickerPlugin";
  }

  init() {
    const editor = this.editor;

    editor.editing.view.addObserver(ClickObserver);

    this.listenTo(
      editor.editing.view.document,
      "click",
      (evt, data) => {
        const mapper = editor.editing.mapper;
        const domConverter = editor.editing.view.domConverter;
        const widgetView = data.target.findAncestor({
          classes: /^(ck-svg-widget)$/,
        });

        if (!widgetView) return;

        const imageModel = mapper.toModelElement(widgetView);
        const resizer = editor.plugins.get(WidgetResize).attachTo({
          modelElement: imageModel,
          viewElement: widgetView,
          editor,

          getHandleHost(domWidgetElement) {
            // console.log("getHandleHost");
            return domWidgetElement.querySelector("svg");
          },
          getResizeHost() {
            console.log("getResizeHost");
            // Return the model image element parent to avoid setting an inline element (<a>/<span>) as a resize host.
            return domConverter.mapViewToDom(
              mapper.toViewElement(imageModel.parent)
            );
          },
          // TODO consider other positions.
          isCentered() {
            return false;
          },

          onCommit(newValue) {
            // Get rid of the CSS class in case the command execution that follows is unsuccessful
            // (e.g. Track Changes can override it and the new dimensions will not apply). Otherwise,
            // the presence of the class and the absence of the width style will cause it to take 100%
            // of the horizontal space.
            console.log(newValue);

            editor.model.change((writer) => {
              const model = editor.model;
              const selection = model.document.selection;

              const selectedElement = selection.getSelectedElement();
              if (selectedElement.name === "icon") {
                console.log("selectedElement", selectedElement);
                writer.setAttribute("resizedWidth", newValue, selectedElement);
              }
            });

            // editor.execute( 'resizeImage', { width: newValue } );
          },
        });

        console.log("2323", resizer, widgetView);
        if (data.domEvent.detail === 2) {
          evt.stop();
        }
      },
      { priority: "highest" }
    );

    // this.listenTo(editor.editing.view.document, 'selectionChange', (evt, data) => {
    //   // Is Double-click
    //   console.log('selectionChange');

    // }, { priority: 'highest' });

    // editor.model.document.selection.on('change', (evt, data) => {

    //   const selectedElement = editor.model.document.selection.getSelectedElement();
    // console.log(evt, data, selectedElement);
    //   if (selectedElement?.is?.('element', 'icon')) {
    //     // Элемент вашего виджета (замените 'myCustomWidget' на тип вашего виджета)
    //     console.log('My custom widget is selected');
    //   } else {
    //     console.log('No custom widget is selected');
    //   }
    // });

    // Регистрация команды для вставки иконки

    editor.commands.add("insertIcon", {
      execute: (data) => {
        editor.model.change((writer) => {
          const model = editor.model;
          const selection = model.document.selection;

          const iconElement = writer.createElement("icon", {
            "data-name": data.iconName,
            "data-icon": data.icon,
          });

          model.insertContent(iconElement, selection);
        });
      },
    });

    // Добавление кнопки в тулбар
    editor.ui.componentFactory.add("iconPickerButton", (locale) => {
      const dropdown = createDropdown(locale);

      dropdown.buttonView.set({
        label: "Dropdown",
        withText: true,
      });
      // Добавление списка иконок в выпадающий список
      const iconList = this._getIconList();

      const buttons = iconList.map((icon) => {
        const listItem = new ButtonView();

        listItem.set({
          label: icon.label,
          icon: icon.icon,
        });

        listItem.on("execute", () => {
          editor.execute("insertIcon", {
            iconName: icon.iconName,
            icon: icon.icon,
          });
          editor.editing.view.focus();
          // dropdown.hide();
        });

        return listItem;
      });

      addToolbarToDropdown(dropdown, buttons);

      return dropdown;
    });
  }

  // Функция для получения списка иконок (замените этот код на свою логику)
  _getIconList() {
    return [
      {
        iconName: "icon1",
        label: "Icon 1",
        icon: replaceTextInSvg(sing),
      },
      {
        iconName: "icon2",
        label: "Icon 2",
        icon: bold,
      },
      // Добавьте свои иконки и их метки
    ];
  }
}

export default IconPickerPlugin;



