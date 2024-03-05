// iconPickerPlugin.js

import {
  ButtonView,
  Plugin,
  addToolbarToDropdown,
  createDropdown,
} from "../../ckeditor";
import { showModal } from "./roughnessModal";
import { emitter } from "../utils";
import InsertIconCommand from "./InsertIconCommand";
import { registerIconSvg } from "./registerIconSvg";
import { insertContentEvent } from "./insertContentEvent";
import "../styles/styles.css";
import { insertIconList } from "./iconLists";
import { showBaseModal } from "./complexSvgModal";
import { insertSymbol } from "../icons/insertSymbols";
// import IconPlugin from "../iconPlugin/IconPlugin";

export class IconPickerPlugin extends Plugin {
  static get pluginName() {
    return "IconPickerPlugin";
  }

  init() {
    const editor = this.editor;

    registerIconSvg(editor);
    insertContentEvent.call(this, editor);

    editor.commands.add("insertIcon", new InsertIconCommand(editor));

    console.log(editor);

    editor.ui.componentFactory.add("iconPickerButton", (locale) => {
      const buttons = insertIconList.map((icon) => {
        const listItem = new ButtonView();

        listItem.set({
          label: icon.label,
          icon: icon.icon,
        });

        function insertIconFc(svgEl, isSimpleSymbol) {
          const insertIconCmd = editor.commands.get("insertIcon");

          if (insertIconCmd) {
            insertIconCmd.execute(
              isSimpleSymbol
                ? {
                    key: "simpleSymbol",
                    iconName: icon.iconName,
                    icon: icon.icon,
                  }
                : {
                    key: isSimpleSymbol
                      ? "simpleSymbol"
                      : icon.isComplexSymbol
                      ? "complexSymbol"
                      : "roughnessSymbol",
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
            showModal();
          } else if (icon.isComplexSymbol) {
            showBaseModal(icon.icon);
          } else {
            insertIconFc(icon.icon, true);
            return;
          }
          emitter.on("insertIcon", insertIconFc);
          // dropdown.hide();
        });
        listItem.delegate("execute").to(editor, "lala");
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
