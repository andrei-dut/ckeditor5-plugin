// CustomLinkPlugin.js
import { linkIcon } from "./icons/insertSymbols";
import { ButtonView, Plugin } from "../ckeditor";
// import { showModal } from "./roughnessModal";
// import { emitter, } from "./utils";
import InsertIconCommand from "./InsertIconCommand";
import "./styles/styles.css";
import { registerCustomLink } from "./registerCustomLink";
import { DblClickObserver } from "./customObservers";
// import { showBaseModal } from "./complexSvgModal";
// import IconPlugin from "../iconPlugin/IconPlugin";

function setLink(editor) {
  const href = "dfdfdfd";
  const text = "ссылка";
  const model = editor.model;
  const selection = model.document.selection;

  editor.model.deleteContent(selection);

  model.change((writer) => {
    const position = selection.getFirstPosition();
    const link = writer.createElement("customLink", { href, text });

    writer.insertText(text, link);
    console.log("link", link);

    writer.insert(link, position);
  });
}

function isLinkElement(node) {
  return node.is("containerElement") && !!node.getCustomProperty("customLink");
}

function findLinkElementAncestor(position) {
  return position.getAncestors().find((ancestor) => isLinkElement(ancestor));
}

export class CustomLinkPlugin extends Plugin {
  static get pluginName() {
    return "CustomLinkPlugin";
  }

  _getSelectedLinkElement() {
    const view = this.editor.editing.view;
    const selection = view.document.selection;
    const selectedElement = selection.getSelectedElement();

    // The selection is collapsed or some widget is selected (especially inline widget).
    if (selection.isCollapsed || selectedElement) {
      return findLinkElementAncestor(selection.getFirstPosition());
    } else {
      // The range for fully selected link is usually anchored in adjacent text nodes.
      // Trim it to get closer to the actual link element.
      const range = selection.getFirstRange().getTrimmed();
      const startLink = findLinkElementAncestor(range.start);
      const endLink = findLinkElementAncestor(range.end);

      if (!startLink || startLink != endLink) {
        return null;
      }

      // Check if the link element is fully selected.
      if (view.createRangeIn(startLink).getTrimmed().isEqual(range)) {
        return startLink;
      } else {
        return null;
      }
    }
  }

  init() {
    const editor = this.editor;

    editor.editing.view.addObserver(DblClickObserver);

    this.listenTo(editor.editing.view.document, "dblclick", () => {
      console.log("dblclick");
    });

    this.listenTo(editor.editing.view.document, "click", (e) => {
      const parentLink = this._getSelectedLinkElement();
      console.log("click", e, parentLink);
    });

    editor.commands.add("insertIcon", new InsertIconCommand(editor));

    editor.set("isDelegateLink", true);
    console.log(editor);

    registerCustomLink(editor);

    // this._enableClickingAfterLink();

    editor.ui.componentFactory.add("customLink", (locale) => {
      const button = new ButtonView(locale);

      button.isEnabled = true;
      button.label = "link";
      button.icon = linkIcon;
      // button.keystroke = LINK_KEYSTROKE;
      button.tooltip = true;
      button.isToggleable = true;

      // Show the panel on button click.
      this.listenTo(button, "execute", () => {
        setLink(editor);
        // editor.execute(
        //   "link",
        //   'test url',
        // );
      });

      button.delegate("execute").to(editor, "lala");

      return button;
    });
  }
}

// editor.ui.componentFactory.add("link", (locale) => {
//   const button = new buttonview_ButtonView(locale);

//   button.isEnabled = true;
//   button.label = t("Link");
//   button.icon = icons_link;
//   button.keystroke = LINK_KEYSTROKE;
//   button.tooltip = true;
//   button.isToggleable = true;

//   // Bind button to the command.
//   button.bind("isEnabled").to(linkCommand, "isEnabled");
//   button.bind("isOn").to(linkCommand, "value", (value) => !!value);

//   // Show the panel on button click.
//   this.listenTo(button, "execute", () => this._showUI(true));

//   return button;
// });
