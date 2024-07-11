import {
  createDropdown,
  View,
  addListToDropdown,
  Model,
  Collection,
  ButtonView,
} from "../../ckeditor";



function characterToUnicodeString(character) {
  if (character === null) {
    return "";
  }

  const hexCode = character.codePointAt(0).toString(16);

  return "U+" + ("0000" + hexCode).slice(-4);
}

export class CharacterInfoView extends View {
  constructor(locale) {
    super(locale);

    const bind = this.bindTemplate;

    this.set("character", null);

    this.set("name", null);

    this.bind("code").to(this, "character", characterToUnicodeString);

    this.setTemplate({
      tag: "div",
      children: [
        {
          tag: "span",
          attributes: {
            class: ["ck-character-info__name"],
          },
          children: [
            {
              // Note: ZWSP to prevent vertical collapsing.
              text: bind.to("name", (name) => (name ? name : "\u200B")),
            },
          ],
        },
        {
          tag: "span",
          attributes: {
            class: ["ck-character-info__code"],
          },
          children: [
            {
              text: bind.to("code"),
            },
          ],
        },
      ],
      attributes: {
        class: ["ck", "ck-character-info"],
      },
    });
  }
}

export class CharacterGridView extends View {
  constructor(locale) {
    super(locale);

    this.tiles = this.createCollection();

    this.setTemplate({
      tag: "div",
      children: [
        {
          tag: "div",
          attributes: {
            class: ["ck", "ck-character-grid__tiles"],
          },
          children: this.tiles,
        },
      ],
      attributes: {
        class: ["ck", "ck-character-grid"],
      },
    });
  }

  createTile(character, name) {
    const tile = new ButtonView(this.locale);

    tile.set({
      label: character,
      withText: true,
      class: "ck-character-grid__tile",
    });

    // Labels are vital for the users to understand what character they're looking at.
    // For now we're using native title attribute for that, see #5817.
    tile.extendTemplate({
      attributes: {
        title: name,
      },
      on: {
        mouseover: tile.bindTemplate.to("mouseover"),
      },
    });

    tile.on("mouseover", () => {
      this.fire("tileHover", { name, character });
    });

    tile.on("execute", () => {
      this.fire("execute", { name, character });
    });

    return tile;
  }
}

export class FormHeaderView extends View {
  constructor(locale, options = {}) {
    super(locale);

    const bind = this.bindTemplate;

    this.set("label", options.label || "");

    this.set("class", options.class || null);

    this.children = this.createCollection();

    this.setTemplate({
      tag: "div",
      attributes: {
        class: ["ck", "ck-form__header", bind.to("class")],
      },
      children: this.children,
    });

    const label = new View(locale);

    label.setTemplate({
      tag: "span",
      attributes: {
        class: ["ck", "ck-form__header__label"],
      },
      children: [{ text: bind.to("label") }],
    });

    this.children.add(label);
  }
}

export class SpecialCharactersNavigationView extends FormHeaderView {
  constructor(locale, groupNames) {
    super(locale);

    const t = locale.t;

    this.set("class", "ck-special-characters-navigation");

    this.groupDropdownView = this._createGroupDropdown(groupNames);
    this.groupDropdownView.panelPosition = locale.uiLanguageDirection === "rtl" ? "se" : "sw";

    this.label = t("Special characters");

    this.children.add(this.groupDropdownView);
  }

  get currentGroupName() {
    return this.groupDropdownView.value;
  }

  _createGroupDropdown(groupNames) {
    const locale = this.locale;
    const t = locale.t;
    const dropdown = createDropdown(locale);
    const groupDefinitions = this._getCharacterGroupListItemDefinitions(dropdown, groupNames);

    dropdown.set("value", groupDefinitions.first.model.label);

    dropdown.buttonView.bind("label").to(dropdown, "value");

    dropdown.buttonView.set({
      isOn: false,
      withText: true,
      tooltip: t("Character categories"),
      class: ["ck-dropdown__button_label-width_auto"],
    });

    dropdown.on("execute", (evt) => {
      dropdown.value = evt.source.label;
    });

    dropdown.delegate("execute").to(this);

    addListToDropdown(dropdown, groupDefinitions);

    return dropdown;
  }

  _getCharacterGroupListItemDefinitions(dropdown, groupNames) {
    const groupDefs = new Collection();

    for (const name of groupNames) {
      const definition = {
        type: "button",
        model: new Model({
          label: name,
          withText: true,
        }),
      };

      definition.model.bind("isOn").to(dropdown, "value", (value) => {
        return value === definition.model.label;
      });

      groupDefs.add(definition);
    }

    return groupDefs;
  }
}
