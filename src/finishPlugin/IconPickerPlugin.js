// iconPickerPlugin.js
import { insertSymbol } from "./icons/insertSymbols";
import {
  ButtonView,
  Plugin,
  addToolbarToDropdown,
  createDropdown,
} from "../ckeditor";
import { showModal } from "./customModal";
import { emitter } from "./utils";
import InsertIconCommand from "./InsertIconCommand";
import { registerIconSvg } from "./registerIconSvg";
import { insertContentEvent } from "./insertContentEvent";
import "./styles/styles.css";
import { insertIconList } from "./iconLists";
// import IconPlugin from "../iconPlugin/IconPlugin";

export class IconPickerPlugin extends Plugin {
  static get pluginName() {
    return "IconPickerPlugin";
  }

  init() {
    const editor = this.editor;
    // console.log('WidgetResize',editor.plugins.get("WidgetResize"));
    registerIconSvg(editor);
    insertContentEvent.call(this, editor);

    editor.commands.add("insertIcon", new InsertIconCommand(editor));

    editor.ui.componentFactory.add("iconPickerButton", (locale) => {
      const buttons = insertIconList.map((icon) => {
        const listItem = new ButtonView();

        listItem.set({
          label: icon.label,
          icon: icon.icon,
        });

        function insertIconFc(svgEl, isSymbol) {
          const insertIconCmd = editor.commands.get("insertIcon");

          if (insertIconCmd) {
            insertIconCmd.execute(
              isSymbol
                ? {
                    key: "symbol",
                    iconName: icon.iconName,
                    icon: icon.icon,
                  }
                : {
                    iconName: icon.iconName,
                    icon: svgEl,
                  }
            );
          }
          editor.editing.view.focus();
          emitter.off("insertIcon", insertIconFc);
        }

        listItem.on("execute", () => {
          if (icon.isRoughness) {
            emitter.on("insertIcon", insertIconFc);
            showModal();
          } else {
            insertIconFc(icon.icon, true);
          }

          // dropdown.hide();
        });

        return listItem;
      });

      const toolbarDropdown = createDropdown(locale);
      toolbarDropdown.buttonView.set({
        icon: insertSymbol,
        class: "icon-picker-button",
      });
      toolbarDropdown.class = "toolbar-insert-symbol";
      addToolbarToDropdown(toolbarDropdown, buttons);
      //   toolbarDropdown.render();
      return toolbarDropdown;
    });

  }
}
