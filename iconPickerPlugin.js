// iconPickerPlugin.js
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import {
  addToolbarToDropdown,
  ButtonView,
  createDropdown,
} from "@ckeditor/ckeditor5-ui";
import sing from "./icons/sign.svg";
import text from "./icons/text.svg";
import bold from "@ckeditor/ckeditor5-core/theme/icons/bold.svg";
import Widget from "@ckeditor/ckeditor5-widget/src/widget";
import WidgetResize from "@ckeditor/ckeditor5-widget/src/widgetresize";
import { emitter, replaceTextInSvg } from "./utils";
import { openEditSvgModal } from "./manageCustomModal";
import { insertContentEvent } from "./insertContentEvent";

class IconPickerPlugin extends Plugin {
  static get requires() {
    return [Widget, WidgetResize];
  }

  static get pluginName() {
    return "IconPickerPlugin";
  }

  init() {
    const editor = this.editor;

    insertContentEvent.call(this, editor)

    // editor.editing.view.addObserver(ClickObserver);

    // this.listenTo(editor.editing.view.document, 'selectionChange', (evt, data) => {
    //   // Is Double-click
    //   console.log('selectionChange');

    // }, { priority: 'highest' });

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
          console.log(selection, model);

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

        function insertIconFc(valuesSvg) {
          editor.execute("insertIcon", {
            iconName: icon.iconName,
            icon: replaceTextInSvg(icon.icon, valuesSvg),
          });
          editor.editing.view.focus();
          emitter.off("insertIcon", insertIconFc);
        }

        listItem.on("execute", () => {
          emitter.on("insertIcon", insertIconFc);
          openEditSvgModal(icon);
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
        icon: sing,
      },
      {
        iconName: "icon3",
        label: "Icon 3",
        icon: text,
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
