// CustomLinkPlugin.js
import { linkIcon } from "./icons/insertSymbols";
import {
  ButtonView,
  ContextualBalloon,
  Plugin,
  clickOutsideHandler,
} from "../ckeditor";
// import { showModal } from "./roughnessModal";
// import { emitter, } from "./utils";
import "./styles/styles.css";
import { registerCustomLink } from "./registerCustomLink";
import { DblClickObserver } from "./customObservers";
import InsertCustomLInkCommand from "./InsertCustomLInkCommand";
import { executeEditorCmd, getSelectedLinkElement } from "./editorUtils";
import { checkClick, openLinkInNewWindow } from "./utils";
import { CustomLinkActionsView } from "./customViews";
// import { showBaseModal } from "./complexSvgModal";
// import IconPlugin from "../iconPlugin/IconPlugin";

export class CustomLinkPlugin extends Plugin {
  static get pluginName() {
    return "CustomLinkPlugin";
  }

  get _areActionsInPanel() {
    return this._balloon.hasView(this.actionsView);
  }

  init() {
    const editor = this.editor;
    const model = editor.model;
    const selection = model.document.selection;

    editor.commands.add(
      "insertCustomLink",
      new InsertCustomLInkCommand(editor)
    );

    this.actionsView = this._createActionsView();
    this._balloon = editor.plugins.get(ContextualBalloon);
    // Attach lifecycle actions to the the balloon.
    this._enableUserBalloonInteractions();

    registerCustomLink(editor);

    editor.editing.view.addObserver(DblClickObserver);

    this.listenTo(editor.editing.view.document, "dblclick", () => {
      // const customLink = getSelectedLinkElement.call(
      //   this,
      //   "customLink",
      //   "attributeElement"
      // );
      // const ranges = model.schema.getValidRanges(
      //   selection.getRanges(),
      //   "customLink"
      // );
      // const allowedRanges = [];
      // for (const element of selection.getSelectedBlocks()) {
      //   if (model.schema.checkAttribute(element, "customLink")) {
      //     allowedRanges.push(model.createRangeOn(element));
      //   }
      // }
      // const rangesToUpdate = allowedRanges.slice();
      // for (const range of ranges) {
      //   rangesToUpdate.push(range);
      //   model.change((writer) => {
      //     writer.setAttribute("customLink", "343434", range);
      //   });
      // }
      // console.log("allowedRanges", allowedRanges);
      // console.log("rangesToUpdate", rangesToUpdate);
      // console.log("dblclick", customLink, ranges);
    });

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
        executeEditorCmd(editor, "insertCustomLink", {
          href: "href",
          text: "text text",
        });
        // editor.fire('customLinkEvent', {eventType: 'insert'})
        // editor.fire('customLinkEvent', {eventType: 'update'})
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
    const viewDocument = this.editor.editing.view.document;

    // Handle click on view document and show panel when selection is placed inside the link element.
    // Keep panel open until selection will be inside the same link element.
    // this.listenTo(viewDocument, "click", () => {
    // const parentLink = this._getSelectedLinkElement();

    // if (parentLink) {
    //   // Then show panel but keep focus inside editor editable.
    //   this._showUI();
    // }
    // });

    // Focus the form if the balloon is visible and the Tab key has been pressed.
    // this.editor.keystrokes.set(
    //   "Tab",
    //   (data, cancel) => {
    //     if (
    //       this._areActionsVisible &&
    //       !this.actionsView.focusTracker.isFocused
    //     ) {
    //       this.actionsView.focus();
    //       cancel();
    //     }
    //   },
    //   {
    //     // Use the high priority because the link UI navigation is more important
    //     // than other feature's actions, e.g. list indentation.
    //     // https://github.com/ckeditor/ckeditor5-link/issues/146
    //     priority: "high",
    //   }
    // );

    // Close the panel on the Esc key press when the editable has focus and the balloon is visible.
    // this.editor.keystrokes.set("Esc", (data, cancel) => {
    //   if (this._isUIVisible) {
    //     this._hideUI();
    //     cancel();
    //   }
    // });

    // Close on click outside of balloon panel element.
    clickOutsideHandler({
      emitter: this.actionsView,
      activator: () => this._areActionsInPanel,
      contextElements: [this._balloon.view.element],
      callback: () => this._hideUI(),
    });
  }

  _createActionsView() {
    const editor = this.editor;
    const actionsView = new CustomLinkActionsView(editor.locale);
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
