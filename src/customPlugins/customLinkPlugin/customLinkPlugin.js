// CustomLinkPlugin.js
import { linkIcon } from "../icons/insertSymbols";
import {
  ButtonView,
  ContextualBalloon,
  Plugin,
  clickOutsideHandler,
} from "../../ckeditor";
import { registerCustomLink } from "./registerCustomLink";
import InsertCustomLInkCommand from "./InsertCustomLInkCommand";
import { getSelectedLinkElement } from "../editorUtils";
import { checkClick } from "../utils";
import { CustomLinkActionsView } from "../customViews";

export class CustomLinkPlugin extends Plugin {
  static get pluginName() {
    return "CustomLinkPlugin";
  }

  get _areActionsInPanel() {
    return this._balloon.hasView(this.actionsView);
  }

  init() {
    const editor = this.editor;

    editor.commands.add(
      "insertCustomLink",
      new InsertCustomLInkCommand(editor)
    );

    this.actionsView = this._createActionsView();
    this._balloon = editor.plugins.get(ContextualBalloon);
    // Attach lifecycle actions to the the balloon.
    this._enableUserBalloonInteractions();

    registerCustomLink(editor);

    this.listenTo(editor.editing.view.document, "click", () => {
      checkClick(() => {
        const customLink = getSelectedLinkElement.call(
          this,
          "customLink",
          "attributeElement"
        );
        if (customLink) {
          this._addActionsView();
        }
        // openLinkInNewWindow(customLink);
      });
    });

    editor.ui.componentFactory.add("customLink", (locale) => {
      const button = new ButtonView(locale);

      button.isEnabled = true;
      button.label = "link";
      button.icon = linkIcon;
      // button.keystroke = LINK_KEYSTROKE;
      button.tooltip = true;
      button.isToggleable = true;

      this.listenTo(button, "execute", () => {
        // executeEditorCmd(editor, "insertCustomLink", {
        //   href: "href",
        //   text: "text text",
        // });
        editor.fire('customLinkEvent', {eventType: 'openModal'})
      });

      return button;
    });
  }

  _addActionsView() {
    if (this._areActionsInPanel) {
      return;
    }
    console.log(this);
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
      // Make sure the target is calculated on demand at the last moment because a cached DOM range
      // (which is very fragile) can desynchronize with the state of the editing view if there was
      // any rendering done in the meantime. This can happen, for instance, when an inline widget
      // gets unlinked.
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
    console.log(this);
    console.log(this._areActionsInPanel);
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
    const linkCommand = editor.commands.get("insertCustomLink");
    const unlinkCommand = editor.commands.get("unlink");
    const LINK_KEYSTROKE = "Ctrl+K";

    actionsView.bind("href").to(linkCommand, "value");
    // actionsView.editButtonView.bind("isEnabled").to(linkCommand);
    actionsView.unlinkButtonView.bind("isEnabled").to(unlinkCommand);

    // Execute unlink command after clicking on the "Edit" button.
    this.listenTo(actionsView, "edit", () => {
      this._addFormView();
    });

    this.listenTo(actionsView, "clickedPreviewLink", () => {
      editor.fire("customLinkEvent", { eventType: "onNavLink" });
      this._hideUI();
    });

    // Execute unlink command after clicking on the "Unlink" button.
    this.listenTo(actionsView, "unlink", () => {
      editor.execute("unlink");
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
