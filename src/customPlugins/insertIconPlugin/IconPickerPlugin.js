// iconPickerPlugin.js

import {
  ButtonView,
  Plugin,
  addToolbarToDropdown,
  createDropdown,
} from "../../reqCkeditor.service";
import { showModal } from "./roughnessModal";
import { emitter } from "../utils";
import InsertIconCommand from "./InsertIconCommand";
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

    const schema = editor.model.schema;

    schema.register("imageInlineIcon", {
      isObject: true,
      isInline: true,
      allowWhere: "$text",
      allowAttributes: ["alt", "src", "srcset", "data-json", "id", "data-id"],
    });

    editor.commands.add("insertIcon", new InsertIconCommand(editor));
    editor.ui.componentFactory.add("iconPickerButton", (locale) => {
      const command = editor.commands.get("insertIcon");
      const buttons = insertIconList.map((icon) => {
        const listItem = new ButtonView();

        listItem.set({
          label: icon.label,
          icon: icon.icon,
          class: icon.iconName,
        });

        function insertIconFc(svgEl, iconName, svgValues) {
          const insertIconCmd = editor.commands.get("insertIcon");
          if (insertIconCmd) {
            insertIconCmd.execute({
              iconName,
              icon: svgEl,
              svgValues,
            });
          }
          editor.editing.view.focus();
          emitter.off("insertIcon", insertIconFc);
        }

        listItem.on("execute", () => {
          if (icon.isRoughness) {
            showModal();
          } else if (icon.isComplexSymbol) {
            showBaseModal(icon.icon, icon.iconName);
          } else {
            insertIconFc(icon.icon, icon.iconName);
            return;
          }
          emitter.off("insertIcon", insertIconFc);
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
      toolbarDropdown.bind("isOn", "isEnabled").to(command, "value", "isEnabled");
      return toolbarDropdown;
    });

    this._setupConversion();
  }

  _setupConversion() {
    const editor = this.editor;
    const t = editor.t;
    const conversion = editor.conversion;
    const imageUtils = editor.plugins.get("ImageUtils");

    function createImageViewElement(writer, modelElement) {
      const emptyElement = writer.createEmptyElement("img");
      const id = modelElement
        ? modelElement.getAttribute("data-id") || modelElement.getAttribute("id")
        : undefined;

      const container = writer.createContainerElement(
        "span",
        { class: "image-inline", id },
        { isAllowedInsideAttributeElement: true }
      )
      writer.insert(writer.createPositionAt(container, 0), emptyElement);
      return container;
    }

    function downcastImageAttribute(imageUtils, imageType, attributeKey) {
      return (dispatcher) => {
        dispatcher.on(`attribute:${attributeKey}:${imageType}`, converter);
      };

      function converter(evt, data, conversionApi) {
        if (!conversionApi.consumable.consume(data.item, evt.name)) {
          return;
        }

        const viewWriter = conversionApi.writer;
        const element = conversionApi.mapper.toViewElement(data.item);
        const img = imageUtils.findViewImgElement(element);

        viewWriter.setAttribute(data.attributeKey, data.attributeNewValue || "", img);
      }
    }

    function downcastSrcsetAttribute(imageUtils, imageType) {
      return (dispatcher) => {
        dispatcher.on(`attribute:srcset:${imageType}`, converter);
      };

      function converter(evt, data, conversionApi) {
        if (!conversionApi.consumable.consume(data.item, evt.name)) {
          return;
        }

        const writer = conversionApi.writer;
        const element = conversionApi.mapper.toViewElement(data.item);
        const img = imageUtils.findViewImgElement(element);

        if (data.attributeNewValue === null) {
          const srcset = data.attributeOldValue;

          if (srcset.data) {
            writer.removeAttribute("srcset", img);
            writer.removeAttribute("sizes", img);

            if (srcset.width) {
              writer.removeAttribute("width", img);
            }
          }
        } else {
          const srcset = data.attributeNewValue;

          if (srcset.data) {
            writer.setAttribute("srcset", srcset.data, img);
            // Always outputting `100vw`. See https://github.com/ckeditor/ckeditor5-image/issues/2.
            writer.setAttribute("sizes", "100vw", img);

            if (srcset.width) {
              writer.setAttribute("width", srcset.width, img);
            }
          }
        }
      }
    }

    function getImgViewElementMatcher(editor) {
      if (editor.plugins.has("ImageInlineEditing") !== editor.plugins.has("ImageBlockEditing")) {
        return {
          name: "img",
          attributes: {
            src: true,
            "data-id": true
          },
        };
      }
      const imageUtils = editor.plugins.get("ImageUtils");
      return (element) => {
        // Convert only images with src attribute.
        if (!imageUtils.isInlineImageView(element) || !element.hasAttribute("src")) {
          return null;
        }
        return { name: true, attributes: ["src", "data-id"] };
      };
    }

    conversion.for("dataDowncast").elementToElement({
      model: "imageInlineIcon",
      view: (modelElement, { writer }) => writer.createEmptyElement("img"),
    });

    conversion.for("editingDowncast").elementToElement({
      model: "imageInlineIcon",
      view: (modelElement, { writer }) =>
        imageUtils.toImageWidget(
          createImageViewElement(writer, modelElement),
          writer,
          t("image widget")
        ),
    });

    conversion
      .for("downcast")
      .add(downcastImageAttribute(imageUtils, "imageInlineIcon", "data-id"))
      .add(downcastImageAttribute(imageUtils, "imageInlineIcon", "src"))
      .add(downcastImageAttribute(imageUtils, "imageInlineIcon", "alt"))
      .add(downcastImageAttribute(imageUtils, "imageInlineIcon", "data-json"))
      .add(downcastSrcsetAttribute(imageUtils, "imageInlineIcon"));

    // More image related upcasts are in 'ImageEditing' plugin.
    conversion.for("upcast").elementToElement({
      view: getImgViewElementMatcher(editor, "imageInlineIcon"),
      model: (viewImage, { writer }) => 
        writer.createElement("imageInlineIcon", {
          src: viewImage.getAttribute("src"),
          "data-json": viewImage.getAttribute("data-json"),
          "data-id": viewImage.getAttribute("data-id"),
        }),

      converterPriority: "highest",
    });
  }
}
