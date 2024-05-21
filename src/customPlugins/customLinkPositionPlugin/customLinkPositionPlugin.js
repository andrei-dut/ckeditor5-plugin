// CustomLinkPositionPlugin.js
import { linkIcon } from "../icons/insertSymbols";
import {
  ButtonView,
  ContextualBalloon,
  Plugin,
  clickOutsideHandler,
} from "../../reqCkeditor.service";
import { registerCustomLink } from "./registerCustomLink";
import InsertCdmLinkPositionCmd from "./InsertCdmLinkPositionCmd";
import {
  executeEditorCmd,
  findAttributeRange,
  getSelectedLinkElement,
} from "../editorUtils";
import { checkClick } from "../utils";
import { CustomLinkActionsView } from "../customViews";
import { showLinkPositionModal } from "./csmLinkPositionModal";
import "../styles/linkPosition.css";

export class CustomLinkPositionPlugin extends Plugin {
  static get pluginName() {
    return "CustomLinkPositionPlugin";
  }

  get _areActionsInPanel() {
    return this._balloon.hasView(this.actionsView);
  }

  init() {
    const editor = this.editor;

    editor.commands.add(
      "insertCsmLinkPosition",
      new InsertCdmLinkPositionCmd(editor)
    );

    this.actionsView = this._createActionsView();
    this._balloon = editor.plugins.get(ContextualBalloon);
    // Attach lifecycle actions to the the balloon.
    this._enableUserBalloonInteractions();

    this._enableClickingAfterLink();

    registerCustomLink(editor);

    this.listenTo(editor.editing.view.document, "click", () => {
      checkClick(() => {
        const customLink = getSelectedLinkElement.call(
          this,
          "customLink",
          "attributeElement"
        );
        // const view = editor.editing.view;
        // const selection = view.document.selection;
        // const findLiElem = findParent(selection.anchor, "li");

        // console.log("findElem", findLiElem);
        console.log("customLink", customLink);

        if (customLink) {
          this._addActionsView();
        }

        // if (findLiElem) {
        //   editor.fire('selectionLiElem', { value: findLiElem } )
        // }
        // openLinkInNewWindow(customLink);
      });
    });

    editor.ui.componentFactory.add("customLinkPosition", (locale) => {
      const command = editor.commands.get("insertCsmLinkPosition");
      const button = new ButtonView(locale);

      button.isEnabled = true;
      button.label = "link";
      button.icon = linkIcon;
      // button.keystroke = LINK_KEYSTROKE;
      button.tooltip = true;
      button.isToggleable = true;

      this.listenTo(button, "execute", () => {
        showLinkPositionModal([
          {uid: 1, value: 'value' , position: '10'},
          {uid: 2, value: 'value2' , position: '20'},
          {uid: 3, value: 'value3' , position: '30'},
          {uid: 4, value: 'value4' , position: '40'},
        ])
        // editor.fire("customLinkEvent", { eventType: "openModal" });
      });


      button.bind("isOn", "isEnabled").to(command, "value", "isEnabled");
      return button;
    });
  }

  _enableClickingAfterLink() {
    const editor = this.editor;
    const model = editor.model;

    function removeLinkAttributesFromSelection(writer, linkAttributes) {
      writer.removeSelectionAttribute("customLink");

      for (const attribute of linkAttributes) {
        writer.removeSelectionAttribute(attribute);
      }
    }

    function getLinkAttributesAllowedOnText(schema) {
      const textAttributes = schema.getDefinition("$text").allowAttributes;

      return textAttributes.filter((attribute) => attribute.startsWith("link"));
    }

    // editor.editing.view.addObserver(MouseObserver);

    let clicked = false;

    // Detect the click.
    this.listenTo(editor.editing.view.document, "mousedown", () => {
      clicked = true;
    });

    // When the selection has changed...
    this.listenTo(editor.editing.view.document, "selectionChange", () => {
      if (!clicked) {
        return;
      }

      // ...and it was caused by the click...
      clicked = false;

      const selection = model.document.selection;

      // ...and no text is selected...
      if (!selection.isCollapsed) {
        return;
      }

      // ...and clicked text is the link...
      if (!selection.hasAttribute("customLink")) {
        return;
      }

      const position = selection.getFirstPosition();
      const linkRange = findAttributeRange(
        position,
        "customLink",
        selection.getAttribute("customLink"),
        model
      );

      if (
        position.isTouching(linkRange.start) ||
        position.isTouching(linkRange.end)
      ) {
        model.change((writer) => {
          removeLinkAttributesFromSelection(
            writer,
            getLinkAttributesAllowedOnText(model.schema)
          );
        });
      }
    });
  }

  _addActionsView() {
    if (this._areActionsInPanel) {
      return;
    }
    this._balloon.add({
      view: this.actionsView,
      position: this._getBalloonPositionData(),
    });
  }

  _getBalloonPositionData() {
    const view = this.editor.editing.view;
    const model = this.editor.model;
    const viewDocument = view.document;
    let target = null;
    const VISUAL_SELECTION_MARKER_NAME = "link-ui";

    if (model.markers.has(VISUAL_SELECTION_MARKER_NAME)) {
      // There are cases when we highlight selection using a marker (#7705, #4721).
      const markerViewElements = Array.from(
        this.editor.editing.mapper.markerNameToElements(
          VISUAL_SELECTION_MARKER_NAME
        )
      );
      const newRange = view.createRange(
        view.createPositionBefore(markerViewElements[0]),
        view.createPositionAfter(
          markerViewElements[markerViewElements.length - 1]
        )
      );

      target = view.domConverter.viewRangeToDom(newRange);
    } else {
      target = () => {
        const targetLink = getSelectedLinkElement.call(
          this,
          "customLink",
          "attributeElement"
        );

        return targetLink
          ? // When selection is inside link element, then attach panel to this element.
            view.domConverter.mapViewToDom(targetLink)
          : // Otherwise attach panel to the selection.
            view.domConverter.viewRangeToDom(
              viewDocument.selection.getFirstRange()
            );
      };
    }

    return { target };
  }

  _hideUI() {
    if (!this._areActionsInPanel) {
      return;
    }

    const editor = this.editor;

    this.stopListening(editor.ui, "update");
    this.stopListening(this._balloon, "change:visibleView");

    // Make sure the focus always gets back to the editable _before_ removing the focused form view.
    // Doing otherwise causes issues in some browsers. See https://github.com/ckeditor/ckeditor5-link/issues/193.
    editor.editing.view.focus();

    // Then remove the actions view because it's beneath the form.
    this._balloon.remove(this.actionsView);
  }

  _enableUserBalloonInteractions() {
    clickOutsideHandler({
      emitter: this.actionsView,
      activator: () => this._areActionsInPanel,
      contextElements: [this._balloon.view.element],
      callback: () => this._hideUI(),
    });
  }

  _createActionsView() {
    const editor = this.editor;
    const actionsView = new CustomLinkActionsView(editor.locale, editor);
    const linkCommand = editor.commands.get("insertCsmLinkPosition");
    const unlinkCommand = editor.commands.get("unlink");
    const LINK_KEYSTROKE = "Ctrl+K";

    actionsView.bind("href").to(linkCommand, "value");
    actionsView.bind("text").to(linkCommand, "linkLabel");
    // actionsView.editButtonView.bind("isEnabled").to(linkCommand);
    actionsView.unlinkButtonView.bind("isEnabled").to(unlinkCommand);

    // Execute unlink command after clicking on the "Edit" button.
    this.listenTo(actionsView, "edit", () => {
      editor.fire("customLinkEvent", { eventType: "editSelectedLink" });
      this._hideUI();
    });

    this.listenTo(actionsView, "clickedPreviewLink", (e) => {
      if (e?.source?.href ) {
        editor.fire("customLinkEvent", { eventType: "onNavLink", value: e?.source?.href });
      }
      this._hideUI();
    });

    // Execute unlink command after clicking on the "Unlink" button.
    this.listenTo(actionsView, "unlink", () => {
      editor.fire("customLinkEvent", { eventType: "removeSelectedLink" });
      executeEditorCmd(editor, "insertCsmLinkPosition", {
        isRemoveLink: true,
      });
      this._hideUI();
    });

    // Close the panel on esc key press when the **actions have focus**.
    actionsView.keystrokes.set("Esc", (data, cancel) => {
      this._hideUI();
      cancel();
    });

    // Open the form view on Ctrl+K when the **actions have focus**..
    actionsView.keystrokes.set(LINK_KEYSTROKE, (data, cancel) => {
      this._addFormView();
      cancel();
    });

    return actionsView;
  }
}
