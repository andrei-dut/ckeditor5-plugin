// iconPickerPlugin.js
import {
  insertSymbol,
  mult1,
  mult2,
  sign,
  param,
  param_title,
  spec1,
  spec2,
  spec3,
  spec4,
  spec5,
  symbol_title,
  text_b,
  text_t,
} from "./icons/insertSymbols";
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
      const iconList = [
        {
          label: 1,
          icon: sign,
          iconName: "11",
        },
      ];

      const buttons = iconList.map((icon) => {
        const listItem = new ButtonView();

        listItem.set({
          label: icon.label,
          icon: icon.icon,
        });

        function insertIconFc(svgEl) {
          const insertIconCmd = editor.commands.get("insertIcon");

          if (insertIconCmd) {
            insertIconCmd.execute({
              iconName: icon.iconName,
              icon: svgEl,
            });
          }
          editor.editing.view.focus();
          emitter.off("insertIcon", insertIconFc);
        }

        listItem.on("execute", () => {
          emitter.on("insertIcon", insertIconFc);
          showModal();
          // dropdown.hide();
        });

        return listItem;
      });

      const toolbarDropdown = createDropdown(locale);
      toolbarDropdown.buttonView.set({
        icon: insertSymbol,
        class: "icon-picker-button",
      });
      addToolbarToDropdown(toolbarDropdown, buttons);
      //   toolbarDropdown.render();
      return toolbarDropdown;
    });

    editor.ui.componentFactory.add("iconListButton", (locale) => {
      const iconList = [
        {
          label: "mult1",
          icon: mult1,
          iconName: "mult1",
        },
        {
          label: "mult2",
          icon: mult2,
          iconName: "mult2",
        },
        {
          label: "param",
          icon: param,
          iconName: "param",
        },
        {
          label: "param_title",
          icon: param_title,
          iconName: "param_title",
        },
        {
          label: "spec1",
          icon: spec1,
          iconName: "spec1",
        },
        {
          label: "spec2",
          icon: spec2,
          iconName: "spec2",
        },
        {
          label: "spec3",
          icon: spec3,
          iconName: "spec3",
        },
        {
          label: "spec4",
          icon: spec4,
          iconName: "spec4",
        },
        {
          label: "spec5",
          icon: spec5,
          iconName: "spec5",
        },
        {
          label: "symbol_title",
          icon: symbol_title,
          iconName: "symbol_title",
        },
        {
          label: "text_b",
          icon: text_b,
          iconName: "text_b",
        },
        {
          label: "text_t",
          icon: text_t,
          iconName: "text_t",
        },
      ];

      const buttons = iconList.map((icon) => {
        const listItem = new ButtonView();

        listItem.set({
          label: icon.label,
          icon: icon.icon,
        });

        listItem.on("execute", () => {
          const insertIconCmd = editor.commands.get("insertIcon");

          if (insertIconCmd) {
            insertIconCmd.execute({
              key: "symbol",
              iconName: icon.iconName,
              icon: icon.icon,
            });
          }
        });

        return listItem;
      });

      const toolbarDropdown = createDropdown(locale);
      toolbarDropdown.buttonView.set({
        label: "Symbols",
        withText: true,
      });
      addToolbarToDropdown(toolbarDropdown, buttons);
      //   toolbarDropdown.render();
      return toolbarDropdown;
    });
  }
}
