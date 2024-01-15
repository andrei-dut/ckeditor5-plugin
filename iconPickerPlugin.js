// iconPickerPlugin.js
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import {
  addToolbarToDropdown,
  ButtonView,
  createDropdown,
  SplitButtonView,
  IconView,
} from "@ckeditor/ckeditor5-ui";
import List from "@ckeditor/ckeditor5-list/src/list";
import sing from "./icons/sign.svg";
import bold from "@ckeditor/ckeditor5-core/theme/icons/bold.svg";

class IconPickerPlugin extends Plugin {
  static get pluginName() {
    return "IconPickerPlugin";
  }

  init() {
    const editor = this.editor;

    // Регистрация команды для вставки иконки

    editor.commands.add("insertIcon", {
      execute: (data) => {
        editor.model.change((writer) => {
          const model = editor.model;
          const selection = model.document.selection;
          const position = selection.getFirstPosition();
          const parentElement = position.parent;
          const clonedElement = model.clone(parentElement);

          const iconElement = writer.createElement("icon", {
            "data-name": data.iconName,
            "data-icon": data.icon,
          });

          console.log(selection);
          console.log(parentElement, clonedElement);

          // console.log(1, iconElement);
          // console.log(2, editor.model.document.getRoot().getChild( 0 ));
          // writer.insert( iconElement, editor.model.document.getRoot().getChild( 0 ), 'after' );

          model.insertContent(
            iconElement,
            model.document.selection
          );
          
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
          // editor.commands.get( 'insertIcon' ).execute('insertIcon' )
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
      // dropdown.panelView.children.add(list);

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
        iconName: "icon2",
        label: "Icon 2",
        icon: bold,
      },
      // Добавьте свои иконки и их метки
    ];
  }
}

export default IconPickerPlugin;
