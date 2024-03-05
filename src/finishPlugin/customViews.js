import {
  ButtonView,
  FocusCycler,
  FocusTracker,
  KeystrokeHandler,
  View,
  ViewCollection,
} from "../ckeditor";
import { pencilIcon, unlinkIcon } from "./icons/insertSymbols";
import { ensureSafeUrl } from "./utils";

export class CustomLinkActionsView extends View {
  constructor(locale) {
    super(locale);

    const t = locale.t;

    this.focusTracker = new FocusTracker();

    this.keystrokes = new KeystrokeHandler();

    this.previewButtonView = this._createPreviewButton();

    this.unlinkButtonView = this._createButton(
      t("Unlink"),
      unlinkIcon,
      "unlink"
    );

    this.editButtonView = this._createButton(
      t("Edit link"),
      pencilIcon,
      "edit"
    );

    this.set("href");

    this._focusables = new ViewCollection();

    this._focusCycler = new FocusCycler({
      focusables: this._focusables,
      focusTracker: this.focusTracker,
      keystrokeHandler: this.keystrokes,
      actions: {
        // Navigate fields backwards using the Shift + Tab keystroke.
        focusPrevious: "shift + tab",

        // Navigate fields forwards using the Tab key.
        focusNext: "tab",
      },
    });

    this.setTemplate({
      tag: "div",

      attributes: {
        class: ["ck", "ck-link-actions", "ck-responsive-form"],

        tabindex: "-1",
      },

      children: [
        this.previewButtonView,
        this.editButtonView,
        this.unlinkButtonView,
      ],
    });
  }

  render() {
    super.render();

    const childViews = [
      this.previewButtonView,
      this.editButtonView,
      this.unlinkButtonView,
    ];

    childViews.forEach((v) => {
      // Register the view as focusable.
      this._focusables.add(v);

      // Register the view in the focus tracker.
      this.focusTracker.add(v.element);
    });

    // Start listening for the keystrokes coming from #element.
    this.keystrokes.listenTo(this.element);
  }

  /**
   * Focuses the fist {@link #_focusables} in the actions.
   */
  focus() {
    this._focusCycler.focusFirst();
  }

  _createButton(label, icon, eventName) {
    const button = new ButtonView(this.locale);

    button.set({
      label,
      icon,
      tooltip: true,
    });

    button.delegate("execute").to(this, eventName);

    return button;
  }

  /**
   * Creates a link href preview button.
   */
  _createPreviewButton() {
    const button = new ButtonView(this.locale);
    const bind = this.bindTemplate;
    const t = this.t;

    button.set({
      withText: true,
      tooltip: t("Open link in new tab"),
    });

    button.extendTemplate({
      attributes: {
        class: ["ck", "ck-link-actions__preview"],
        href: bind.to("href", (href) =>  href && ensureSafeUrl(href)
        ),
        target: "_blank",
        rel: "noopener noreferrer",
      },
    });

    button.bind("label").to(this, "href", (href) => {
      return href || t("This link has no URL");
    });

    button.bind("isEnabled").to(this, "href", (href) => !!href);

    button.template.tag = "a";
    button.template.eventListeners = {};

    return button;
  }
}
