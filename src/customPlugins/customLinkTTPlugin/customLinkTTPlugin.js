// CustomLinkTTPlugin.js
import { ContextualBalloon, Plugin, clickOutsideHandler } from "../../reqCkeditor.service";
import { registerCustomLink } from "./registerCustomLinkTT";
import InsertCdmLinkTTCmd from "./InsertCsmLinkTTCmd";
import {
  createItemToolbar,
  executeEditorCmd,
  findAttributeRange,
  getSelectedLinkElement,
} from "../editorUtils";
import { createClickChecker, emitter } from "../utils";
import { CustomLinkActionsView } from "../customViews";
import "../styles/linkPosition.css";
import { linkTT } from "../icons/insertSymbols";

export class CustomLinkTTPlugin extends Plugin {
  static get pluginName() {
    return "CustomLinkTTPlugin";
  }

  get _areActionsInPanel() {
    return this._balloon.hasView(this.actionsView);
  }

  destroy() {
    emitter.clearEvent("onInsertLinkTT");
  }

  init() {
    const editor = this.editor;
    const checkClick = createClickChecker();


    editor.commands.add("insertCsmLinkTT", new InsertCdmLinkTTCmd(editor));

    this.actionsView = this._createActionsView();
    this._balloon = editor.plugins.get(ContextualBalloon);
    // Attach lifecycle actions to the the balloon.
    this._enableUserBalloonInteractions();

    this._enableClickingAfterLink();

    registerCustomLink(editor);

    this.listenTo(editor.editing.view.document, "click", (e, domEventData) => {
      domEventData.preventDefault();
      const domTarget = domEventData.domTarget; // Получаем кликнутый элемент
      const viewElement = editor.editing.view.domConverter.mapDomToView(domTarget); // Преобразуем DOM элемент в view элемент CKEditor
      const viewIsCsmLink = viewElement?.getAttribute("class") === "custom-link-TT";

      let customLinkTT = getSelectedLinkElement.call(this, "customLinkTT", "attributeElement");
      customLinkTT = customLinkTT || (viewIsCsmLink ? viewElement : null);

      if (customLinkTT)
        checkClick(() => {
          if (customLinkTT) {
            this._addActionsView(customLinkTT);
          }
        });
    });

    createItemToolbar(
      editor,
      "customLinkTT",
      linkTT,
      () => {
        editor.fire("csmLinkTTEv", { eventType: "openModal" });
      },
      "Позиция"
    );

    function onInsertLinkTT(values) {
      executeEditorCmd(editor, "insertCsmLinkTT", values);
    }

    emitter.on("onInsertLinkTT", onInsertLinkTT);
  }

  _enableClickingAfterLink() {
    const editor = this.editor;
    const model = editor.model;

    function removeLinkAttributesFromSelection(writer, linkAttributes) {
      writer.removeSelectionAttribute("customLinkTT");

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
      if (!selection.hasAttribute("customLinkTT")) {
        return;
      }

      const position = selection.getFirstPosition();
      const linkRange = findAttributeRange(
        position,
        "customLinkTT",
        selection.getAttribute("customLinkTT"),
        model
      );

      if (position.isTouching(linkRange.start) || position.isTouching(linkRange.end)) {
        model.change((writer) => {
          removeLinkAttributesFromSelection(writer, getLinkAttributesAllowedOnText(model.schema));
        });
      }
    });
  }

  _addActionsView(clickedElement) {
    if (this._areActionsInPanel) {
      return;
    }

    const linkCommand = this.editor.commands.get("insertCsmLinkTT");
    linkCommand.refresh(clickedElement);

    this._balloon.add({
      view: this.actionsView,
      position: this._getBalloonPositionData(clickedElement),
    });
  }

  _getBalloonPositionData(clickedElement) {
    const view = this.editor.editing.view;
    const model = this.editor.model;
    const viewDocument = view.document;
    let target = null;
    const VISUAL_SELECTION_MARKER_NAME = "link-ui";

    if (model.markers.has(VISUAL_SELECTION_MARKER_NAME)) {
      // There are cases when we highlight selection using a marker (#7705, #4721).
      const markerViewElements = Array.from(
        this.editor.editing.mapper.markerNameToElements(VISUAL_SELECTION_MARKER_NAME)
      );
      const newRange = view.createRange(
        view.createPositionBefore(markerViewElements[0]),
        view.createPositionAfter(markerViewElements[markerViewElements.length - 1])
      );

      target = view.domConverter.viewRangeToDom(newRange);
    } else {
      target = () => {
        const targetLink =
          getSelectedLinkElement.call(this, "customLinkTT", "attributeElement") || clickedElement;

        return targetLink
          ? // When selection is inside link element, then attach panel to this element.
            view.domConverter.mapViewToDom(targetLink)
          : // Otherwise attach panel to the selection.
            view.domConverter.viewRangeToDom(viewDocument.selection.getFirstRange());
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
    const actionsView = new CustomLinkActionsView(editor.locale, editor, true);
    const linkCommand = editor.commands.get("insertCsmLinkTT");
    const unlinkCommand = editor.commands.get("unlink");
    const LINK_KEYSTROKE = "Ctrl+K";

    actionsView.bind("href").to(linkCommand, "value");
    actionsView.bind("text").to(linkCommand, "linkLabel");
    actionsView.editButtonView.bind("isEnabled").to(linkCommand);
    actionsView.unlinkButtonView.bind("isEnabled").to(unlinkCommand);

    // Execute unlink command after clicking on the "Edit" button.
    this.listenTo(actionsView, "edit", (e) => {
      const currentUid = e?.source?.href;
      if (currentUid) {
        editor.fire("csmLinkTTEv", { eventType: "editLinkTT", value: e?.source?.href });
      }
      this._hideUI();
    });

    // Execute unlink command after clicking on the "Unlink" button.
    this.listenTo(actionsView, "unlink", () => {
      executeEditorCmd(editor, "insertCsmLinkTT", {
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
