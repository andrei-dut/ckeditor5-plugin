import { ClassicEditor } from "./ckeditor";
import { CopyCutPastePlugin } from "./customPlugins/copyCutPastePlugin/copyCutPastePlugin";
import { CustomLinkPlugin } from "./customPlugins/customLinkPlugin/customLinkPlugin";
import { insertSymbol } from "./customPlugins/icons/insertSymbols";
import { IconPickerPlugin } from "./customPlugins/insertIconPlugin/IconPickerPlugin";

class Editor extends ClassicEditor {
  static addPlugin(plugin) {
    if (!this.builtinPlugins.includes(plugin)) {
      this.builtinPlugins.push(plugin);
    }
  }

  static defaultConfig = {
    toolbar: {
      items: [
        "Undo",
        "Redo",
        "|",
        "Bold",
        "|",
        "RemoveFormat",
        "|",
        "/",
        "NumberedList",
        "BulletedList",
        "Outdent",
        "Indent",
        "|",
        "FontColor",
        "FontBackgroundColor",
        "|",
        "/",
        "Heading",
        "FontFamily",
        "FontSize",
        "|",
        "ImageUpload",
        "link",
        "iconPickerButton",
        "customLink",
      ],
    },
    language: "ru",
  };
}

Editor.builtinPlugins.push(IconPickerPlugin);
Editor.builtinPlugins.push(CustomLinkPlugin);
// Editor.builtinPlugins.push(CopyCutPastePlugin);

// delete selected content editor.model.deleteContent(modelSelect)

Editor.create(document.querySelector("#editor"), {})
  .then((editor) => {
    const liObjects = {
      1: {
        number: 1,
        content: `Mix flour, <svg class="svg-spec4" style="width:139px;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" width="139px" height="139px" viewBox="-0.5 -0.5 27 21" content="<mxfile host=&quot;Electron&quot; modified=&quot;2024-02-01T06:05:00.016Z&quot; agent=&quot;Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) draw.io/21.5.1 Chrome/112.0.5615.204 Electron/24.6.0 Safari/537.36&quot; etag=&quot;aDNshRsoJRp37QUX5Kd4&quot; version=&quot;21.5.1&quot; type=&quot;device&quot;>
      <diagram name=&quot;Страница 1&quot; id=&quot;euyVlCI5q0NmR2s4yrTI&quot;>
        <mxGraphModel dx=&quot;1278&quot; dy=&quot;616&quot; grid=&quot;1&quot; gridSize=&quot;10&quot; guides=&quot;1&quot; tooltips=&quot;1&quot; connect=&quot;1&quot; arrows=&quot;1&quot; fold=&quot;1&quot; page=&quot;1&quot; pageScale=&quot;1&quot; pageWidth=&quot;827&quot; pageHeight=&quot;1169&quot; math=&quot;0&quot; shadow=&quot;0&quot;>
          <root>
            <mxCell id=&quot;0&quot; />
            <mxCell id=&quot;1&quot; parent=&quot;0&quot; />
            <mxCell id=&quot;MX83TFw8KlYx_IWatQdC-1&quot; value=&quot;&quot; style=&quot;shape=image;verticalLabelPosition=bottom;labelBackgroundColor=default;verticalAlign=top;aspect=fixed;imageAspect=0;image=data:image/png,iVBORw0KGgoAAAANSUhEUgAAAEQAAAA1CAYAAAD4bU3WAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAAFxEAABcRAcom8z8AAAI3SURBVGhD7ZktcgJBEEahQFD8F8UFcEgkFotG4zgDh+AASCQSiUQiOUAEEolKYVLpbJPuDuksyRJ22NmlX9VXY5bd6VcwfCE5z1jQahBAq0GYEIUJUZgQhQlRmBCFCVH4I6RWq70EC27oaVMoFF6DVYBn43Q6wXw+h3a7DdVqlcUIdFn2OR6PMJvNoNVqQblc/vYuQREMXZ5dUMR0OoVmswmVSkWL4Aj0suxxOBxgMpmcJZRKpTAJlxHo5dlhv9/DaDSCer0OxWIxbPiwCHSb9LPb7c4iLg7KWyLQ7dLLdruFwWAAjUYjbNCoEei26WOz2UCv1zsfljjHnRHo9ulhtVpBt9uNSwRHoMf4z2KxgE6nc+9H41oEepyfYKtEEapVuohAj/YLFMGt0rEIjkBb8ANulcEfnb+1ShcRaCvJwq0SD8oIrdJFBNpSMmCrHI/Ht7ZKFxFoa4+F6/WDzocoEWiLjwHrNbZKj0RwBNqqW7BV9vt9Vx0ijgi0ZTdgq4yxXruMQFuPl+Vy6bJVuohAI8QDt0r81sB7pygCjfJ/uFWiBA8Py6gRaKzb4VaJ9frBrdJFBBovOtgq+UfbhFqliwg05t9wvcaPRoZEcAQa9zrcKvF/GQnXa5cRaOyfYKscDodpPihviUDjf4GtMoYfbdMWgTQArNfrtLRKFxHO9Rpb5ZOK4HySz+ffgiXsgmfKexCvwE0ZF5gQhQlRmBCFCVGYEIUJUZgQhQlRmBCFCVEcaU2IXO4D8RBBDRzjSugAAAAASUVORK5CYII=;&quot; vertex=&quot;1&quot; parent=&quot;1&quot;>
              <mxGeometry x=&quot;30&quot; y=&quot;10&quot; width=&quot;25.66&quot; height=&quot;20&quot; as=&quot;geometry&quot; />
            </mxCell>
          </root>
        </mxGraphModel>
      </diagram>
    </mxfile>
    "></svg>baking powder, sugar, and salt.`,
      },
      2: { number: 2, content: "In another bowl, mix eggs, milk, and oil." },
      3: { number: 3, content: "Stir <span>both mixtures</span> together." },
      4: { number: 4, content: `Fill <a id="id_A" href="123">123</a> muffin tray 3/4 full.` },
      5: { number: 5, content: "Bake for 20 minutes." },
    };

    const _htmlContent = createHtmlFromLiObjects(liObjects);

    editor.setData(_htmlContent + " " + ` ${insertSymbol}`);

    console.log("Editor was initialized", editor.getData());
    console.log("doc", editor.model.document);

    editor.model.document.on("change:data", () => {
      // console.log("data");
    });

    // editor.editing.view.document.on("selectionChange", (e, data) => {
    //   const model = editor.model;
    //   const selection = model.document.selection;
    //   console.log("datselectionChangea", selection, data, e);
    //   window.selec = selection;
    // });

    editor.on("customLinkEvent", (e, currentData) => {
      console.log("call_customLinkEvent");

      const { eventType, value } = currentData || {};

      if (eventType === "onNavLink") {
        console.log("onNavLink", value);
      }

      if (eventType === "editSelectedLink") {
        console.log("editSelectedLink", value);
      }

      if (eventType === "insert") {
        console.log("insert", value);
      }

      if (eventType === "update") {
        console.log("update", value);
      }

      if (eventType === "openModal") {
        console.log(editor.commands.get("undo"));
        editor.commands
          .get("undo")
          .on("change:isEnabled", (e, args, newVal, oldVal) => {
            console.log(e, args, newVal, oldVal);
          });

        console.log("openModal", value);
      }

      // const currentData = _.find(arg)
    });

    editor.editing.view.document.on("clipboardOutput", (eventInfo, data) => {
      console.log(
        "clipboardOutput",
        eventInfo,
        data,
        editor.data.htmlProcessor.toData(data.content)
      );
    });

    editor.editing.view.document.on("clipboardInput", (eventInfo, data) => {
      console.log("clipboardInput", eventInfo, data);
    });

    editor.on("clicked", (e, currentData) => {
      console.log("clicked", e, currentData);
    });
    editor.editing.view.document.on("blur", (...arg) => {
      console.log("foc", arg);
    });
  })
  .catch((error) => {
    console.error(error.stack);
  });

export function parseLiTags(htmlContent) {
  const tempElement = document.createElement("div");
  tempElement.innerHTML = htmlContent;

  const olElement = tempElement.querySelector("ol");

  if (!olElement) {
    return {};
  }

  const liObjects = {};

  const liTags = olElement.children;

  for (const child of liTags) {
    if (child.tagName && child.tagName.toLowerCase() === "li") {
      const liNumber = Object.keys(liObjects).length + 1;
      const liContent = child.innerHTML;
      liObjects[liNumber] = {
        number: liNumber,
        content: liContent,
      };
    }
  }

  return liObjects;
}

const htmlContent = `
  <ol>
  dfgdfg
  <p>fi343</p>
  <li>first item</li>
  <li>
    second item
    <ol>
      <li>second item first subitem</li>
      <li>second item second subitem</li>
      <li>second item third subitem</li>
    </ol>
  </li>
  <li>third item</li>
</ol>
  `;

const parsedLiTags = parseLiTags(htmlContent);
console.log(parsedLiTags);

function createHtmlFromLiObjects(liObjectsOrArray) {
  let htmlContent = "<ol>";
  if (Array.isArray(liObjectsOrArray)) {
    liObjectsOrArray.forEach((content) => {
      htmlContent += `<li id="id_LI" data-comment="Comment" class="asd">${content}</li>`;
    });
  } else {
    for (const key in liObjectsOrArray) {
      const liObject = liObjectsOrArray[key];
      htmlContent += `<li id="id_LI" data-comment="Comment" class="asd">${liObject.content}</li>`;
    }
  }
  htmlContent += "</ol>";
  return htmlContent;
}

// const liObjects = {
//   1: { number: 1, content: "Mix flour, baking powder, sugar, and salt." },
//   2: { number: 2, content: "In another bowl, mix eggs, milk, and oil." },
//   3: { number: 3, content: "Stir <p>both mixtures</p> together." },
//   4: { number: 4, content: `Fill <a href="123">123</a> muffin tray 3/4 full.` },
//   5: { number: 5, content: "Bake for 20 minutes." },
// };

// const _htmlContent = createHtmlFromLiObjects(liObjects);
// const __htmlContent = createHtmlFromLiObjects(["a", "b", "c"]);
// console.log(_htmlContent);
// console.log(__htmlContent);

// {name: 'svg',
// attrs: {color: 'red'}
// children: [{name: 'path',
// attrs: {color: 'red'}
// children: ['text']
// }]
// }
