// iconPickerPlugin.js
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import {
  addToolbarToDropdown,
  ButtonView,
  createDropdown,
} from "@ckeditor/ckeditor5-ui";
import Widget from "@ckeditor/ckeditor5-widget/src/widget";
import WidgetResize from "@ckeditor/ckeditor5-widget/src/widgetresize";
import { emitter } from "../utils/utils";
import { customIcons } from "../icons";
import { insertContentEvent } from "../events/insertContentEvent";
// import { openEditSvgModal } from "../js/manageCustomModal";
import { showModal } from "../js/manageCustomModal copy";

class IconPickerPlugin extends Plugin {
  static get requires() {
    return [Widget, WidgetResize];
  }

  static get pluginName() {
    return "IconPickerPlugin";
  }

  init() {
    const editor = this.editor;

    insertContentEvent.call(this, editor);

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
            "data-key": 'svg-roughness',
            "data-name": data.iconName,
            "data-icon": data.icon,
          });
          // console.log(selection, model, data, editor);



          model.insertContent(iconElement, selection);


          // const domElement = editor.editing.view.domConverter.viewToDom(iconElement);

          // // Выводим полученный DOM-элемент в консоль
          // console.log(domElement);
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

        function insertIconFc(svgEl) {
          // console.log(icon.icon);
          editor.execute("insertIcon", {
            iconName: icon.iconName,
            icon: svgEl,
            // icon: replaceTextInSvg(icon.icon, valuesSvg)
          });
          editor.editing.view.focus();
          emitter.off("insertIcon", insertIconFc);
        }

        listItem.on("execute", () => {
          emitter.on("insertIcon", insertIconFc);
          // openEditSvgModal(icon);
          showModal();
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
    return customIcons;
  }
}

export default IconPickerPlugin;
