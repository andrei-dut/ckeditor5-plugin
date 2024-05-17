import { ClassicEditor } from "./ckeditor";
import { CopyCutPastePlugin } from "./customPlugins/copyCutPastePlugin/copyCutPastePlugin";
import { CustomLinkPlugin } from "./customPlugins/customLinkPlugin/customLinkPlugin";
import { CustomListPlugin } from "./customPlugins/customListPlugin/customListPlugin";
import { removeAllParagraph, viewToModelElem } from "./customPlugins/editorUtils";
import { IconPickerPlugin } from "./customPlugins/insertIconPlugin/IconPickerPlugin";
import { getArrayImgObjByHtmlString } from "./customPlugins/utils";
import { customSpecialCharacters } from "./customPlugins/vars";
import "./customPlugins/styles/styles.css";
import { parseAllReqDivTags, parseReqDivTags } from "./utils/utils";
import { TestPlugin } from "./testPlugin/testPlugin";
import { AllowancePlugin } from "./customPlugins/allowancePlugin/allowancePlugin";
import "./style.css";
import { ParametrPlugin } from "./customPlugins/parametrPlugin/parametrPlugin";

// Ваша обычная HTML разметка
const htmlString = `
<div>
    <p>This is a paragraph.</p>
    <div>This is another div.</div>
</div>`;

// Преобразование HTML в строку base64
const base64String = btoa(htmlString);

// Создание элемента img
const img = new Image();
img.src = `data:image/html;base64,${base64String}`;

// Вставка элемента img в документ
document.body.appendChild(img);

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
        "FontFamily",
        "FontSize",
        "|",
        "ImageUpload",
        "link",
        "iconPickerButton",
        "customLink",
        "specialCharacters",
        "Superscript",
        "Subscript",
        "customList",

        "test",
        "test1",
        "test2",
        "allowance",

        "copy",
        "cut",
        "paste",
        "addReq",
        "removeReq",
        "levelUpReq",
        "levelDownReq",
        "moveUpReq",
        "moveDownReq",
        "parametr",

        "add",
        "remove",
        "moveUp",
        "moveDown",
        "levelUp",
        "levelDown",
      ],
    },
    removePlugins: ["ImageResize", "FontColor"],
    language: "ru",
    customSpecialCharacters,
  };
}

Editor.builtinPlugins.push(IconPickerPlugin);
Editor.builtinPlugins.push(CustomLinkPlugin);
Editor.builtinPlugins.push(CopyCutPastePlugin);
Editor.builtinPlugins.push(CustomListPlugin);
Editor.builtinPlugins.push(TestPlugin);
Editor.builtinPlugins.push(AllowancePlugin);
Editor.builtinPlugins.push(ParametrPlugin);

// delete selected content editor.model.deleteContent(modelSelect)

Editor.create(document.querySelector("#editor"), {})
  .then((editor) => {
    const textTEst = `<div class="requirement ck-widget" data-custom_comment="111"  contenteditable="false"  id="req_1" >
    <div class="aw-requirement-marker">
    
      <span class="aw-ckeditor-marker-element" title="1">1</span>   
      </div>
      
      <div class="aw-requirement-content">
        <div class="aw-requirement-bodytext ck-editor__editable ck-editor__nested-editable" isdirty="false" contenteditable="true">
        <p>Содержи        <span class="aw-req-allowance">
      
        <span class="allowance-number">1</span>
        <span class="allowance-number">2</span>

      </span>моеcv <span class="aw-req-parametrText ck-widget" data-type="text" contenteditable="false">ghghg</span>
      

      <img src="data:image/svg+xml;base64,CjxzdmcKICAgd2lkdGg9IjExLjUiCiAgIGhlaWdodD0iMTIuNSIKICAgdmlld0JveD0iMCAwIDExLjUwMDAwMSAxMi41IgogICB2ZXJzaW9uPSIxLjEiCiAgIGlkPSJzdmcxIgogICBpbmtzY2FwZTp2ZXJzaW9uPSIxLjMuMiAoMDkxZTIwZSwgMjAyMy0xMS0yNSwgY3VzdG9tKSIKICAgc29kaXBvZGk6ZG9jbmFtZT0idHJpYW5nbGVSaWdodC5zdmciCiAgIHhtbG5zOmlua3NjYXBlPSJodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy9uYW1lc3BhY2VzL2lua3NjYXBlIgogICB4bWxuczpzb2RpcG9kaT0iaHR0cDovL3NvZGlwb2RpLnNvdXJjZWZvcmdlLm5ldC9EVEQvc29kaXBvZGktMC5kdGQiCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHNvZGlwb2RpOm5hbWVkdmlldwogICAgIGlkPSJuYW1lZHZpZXcxIgogICAgIHBhZ2Vjb2xvcj0iI2ZmZmZmZiIKICAgICBib3JkZXJjb2xvcj0iIzAwMDAwMCIKICAgICBib3JkZXJvcGFjaXR5PSIwLjI1IgogICAgIGlua3NjYXBlOnNob3dwYWdlc2hhZG93PSIyIgogICAgIGlua3NjYXBlOnBhZ2VvcGFjaXR5PSIwLjAiCiAgICAgaW5rc2NhcGU6cGFnZWNoZWNrZXJib2FyZD0iMCIKICAgICBpbmtzY2FwZTpkZXNrY29sb3I9IiNkMWQxZDEiCiAgICAgaW5rc2NhcGU6ZG9jdW1lbnQtdW5pdHM9InB4IgogICAgIGlua3NjYXBlOnpvb209IjQ1LjI1NDgzNCIKICAgICBpbmtzY2FwZTpjeD0iNS45MjIwMTkzIgogICAgIGlua3NjYXBlOmN5PSI1LjI5MjI1MjMiCiAgICAgaW5rc2NhcGU6d2luZG93LXdpZHRoPSIxOTIwIgogICAgIGlua3NjYXBlOndpbmRvdy1oZWlnaHQ9IjEwMTciCiAgICAgaW5rc2NhcGU6d2luZG93LXg9Ii04IgogICAgIGlua3NjYXBlOndpbmRvdy15PSItOCIKICAgICBpbmtzY2FwZTp3aW5kb3ctbWF4aW1pemVkPSIxIgogICAgIGlua3NjYXBlOmN1cnJlbnQtbGF5ZXI9InN2ZzEiCiAgICAgc2hvd2dyaWQ9ImZhbHNlIiAvPgogIDxkZWZzCiAgICAgaWQ9ImRlZnMxIiAvPgogIDxnCiAgICAgaW5rc2NhcGU6bGFiZWw9ItCh0LvQvtC5IDEiCiAgICAgaW5rc2NhcGU6Z3JvdXBtb2RlPSJsYXllciIKICAgICBpZD0ibGF5ZXIxIgogICAgIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0yLjUzNTkyMTQsLTIuNzk5NzUwMikiIC8+CiAgPHBhdGgKICAgICBzdHlsZT0iZmlsbDpub25lO3N0cm9rZTojMDAwMDAwO3N0cm9rZS13aWR0aDowLjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lIgogICAgIGlua3NjYXBlOmxhYmVsPSJUcmlhbmdsZSIKICAgICBkPSJtIDAuOTUxMzAwOTUsMS4wNTM1MTcgdiAxMSBsIDkuNTI2Mjc5MDUsLTUuNSB6IgogICAgIGlkPSJwYXRoMTEiIC8+Cjwvc3ZnPgoK" alt="triangleRight" data-id="triangleRight" data-json="{}">

      </p>

        </div>
        </div>
      
      
     </div>`;

    const textTEst01 = `<div class="requirement ck-widget"  contenteditable="false"     >
    <div class="aw-requirement-marker">
    
      <span class="aw-ckeditor-marker-element" title="2">2</span>   
      </div>
      
      <div class="aw-requirement-content">
        <div class="aw-requirement-bodytext ck-editor__editable ck-editor__nested-editable" isdirty="false" contenteditable="true"><p>Содержимоеcv
        
        <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMjEiIHZpZXdCb3g9IjAgMCAzNSAyMSIgdmVyc2lvbj0iMS4xIiBpZD0ibXVsdDIiIHN0eWxlPSJmb250LXNpemU6MTJweDsiIHhtbG5zOmlua3NjYXBlPSJodHRwOi8vd3d3Lmlua3NjYXBlLm9yZy9uYW1lc3BhY2VzL2lua3NjYXBlIiB4bWxuczpzb2RpcG9kaT0iaHR0cDovL3NvZGlwb2RpLnNvdXJjZWZvcmdlLm5ldC9EVEQvc29kaXBvZGktMC5kdGQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6c3ZnPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+Cgo8ZyBpbmtzY2FwZTpsYWJlbD0iTGF5ZXIgMSIgaW5rc2NhcGU6Z3JvdXBtb2RlPSJsYXllciIgaWQ9ImxheWVyMSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNS42NzUyMjk1NDk0MDc5NTksIDApIj4KCiA8dGV4dCB4bWw6c3BhY2U9InByZXNlcnZlIiBzdHlsZT0iZm9udC1zdHlsZTpub3JtYWw7Zm9udC12YXJpYW50Om5vcm1hbDtmb250LXdlaWdodDpub3JtYWw7Zm9udC1zdHJldGNoOm5vcm1hbDtmb250LXNpemU6aW5oZXJpdDtmb250LWZhbWlseTpzYW5zLXNlcmlmOy1pbmtzY2FwZS1mb250LXNwZWNpZmljYXRpb246J3NhbnMtc2VyaWYsIE5vcm1hbCc7Zm9udC12YXJpYW50LWxpZ2F0dXJlczpub3JtYWw7Zm9udC12YXJpYW50LWNhcHM6bm9ybWFsO2ZvbnQtdmFyaWFudC1udW1lcmljOm5vcm1hbDtmb250LXZhcmlhbnQtZWFzdC1hc2lhbjpub3JtYWw7ZmlsbDojMDAwMDAwO3N0cm9rZS13aWR0aDowLjk1MDgwNCIgeD0iMC45MDMxOTMxMiIgeT0iMTguNDg3MDI0IiBpZD0idGV4dDEiIHRyYW5zZm9ybT0ic2NhbGUoMC45OTY0ODkwOSwxLjAwMzUyMzMpIj48dHNwYW4gc29kaXBvZGk6cm9sZT0ibGluZSIgaWQ9InRzcGFuMSIgeD0iLTUuNjc1MjI5NTQ5NDA3OTU5IiB5PSIyMSIgc3R5bGU9ImZvbnQtc3R5bGU6bm9ybWFsO2ZvbnQtdmFyaWFudDpub3JtYWw7Zm9udC13ZWlnaHQ6bm9ybWFsO2ZvbnQtc3RyZXRjaDpub3JtYWw7Zm9udC1zaXplOmluaGVyaXQ7Zm9udC1mYW1pbHk6c2Fucy1zZXJpZjstaW5rc2NhcGUtZm9udC1zcGVjaWZpY2F0aW9uOidzYW5zLXNlcmlmLCBOb3JtYWwnO2ZvbnQtdmFyaWFudC1saWdhdHVyZXM6bm9ybWFsO2ZvbnQtdmFyaWFudC1jYXBzOm5vcm1hbDtmb250LXZhcmlhbnQtbnVtZXJpYzpub3JtYWw7Zm9udC12YXJpYW50LWVhc3QtYXNpYW46bm9ybWFsO3N0cm9rZS13aWR0aDowLjk1MDgwNCI+MTwvdHNwYW4+PC90ZXh0PgoKICAgICAgPHRleHQgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgc3R5bGU9ImZvbnQtc3R5bGU6bm9ybWFsO2ZvbnQtdmFyaWFudDpub3JtYWw7Zm9udC13ZWlnaHQ6bm9ybWFsO2ZvbnQtc3RyZXRjaDpub3JtYWw7Zm9udC1zaXplOmluaGVyaXQ7Zm9udC1mYW1pbHk6c2Fucy1zZXJpZjstaW5rc2NhcGUtZm9udC1zcGVjaWZpY2F0aW9uOidzYW5zLXNlcmlmLCBOb3JtYWwnO2ZvbnQtdmFyaWFudC1saWdhdHVyZXM6bm9ybWFsO2ZvbnQtdmFyaWFudC1jYXBzOm5vcm1hbDtmb250LXZhcmlhbnQtbnVtZXJpYzpub3JtYWw7Zm9udC12YXJpYW50LWVhc3QtYXNpYW46bm9ybWFsO2ZpbGw6IzAwMDAwMDtzdHJva2Utd2lkdGg6MC45MjE3NzciIHg9IjEyLjcyOTE5MSIgeT0iMTAuMTQ5NDk2IiBpZD0idGV4dDIiIHRyYW5zZm9ybT0ic2NhbGUoMS4wMDcyNTE3LDAuOTkyODAwNTIpIj48dHNwYW4gc29kaXBvZGk6cm9sZT0ibGluZSIgaWQ9InRzcGFuMiIgeD0iNi42NTI1NzE2NzgxNjE2MjEiIHk9IjEwLjE0OTQ5NiIgc3R5bGU9ImZvbnQtc3R5bGU6bm9ybWFsO2ZvbnQtdmFyaWFudDpub3JtYWw7Zm9udC13ZWlnaHQ6bm9ybWFsO2ZvbnQtc3RyZXRjaDpub3JtYWw7Zm9udC1zaXplOmluaGVyaXQ7Zm9udC1mYW1pbHk6c2Fucy1zZXJpZjstaW5rc2NhcGUtZm9udC1zcGVjaWZpY2F0aW9uOidzYW5zLXNlcmlmLCBOb3JtYWwnO2ZvbnQtdmFyaWFudC1saWdhdHVyZXM6bm9ybWFsO2ZvbnQtdmFyaWFudC1jYXBzOm5vcm1hbDtmb250LXZhcmlhbnQtbnVtZXJpYzpub3JtYWw7Zm9udC12YXJpYW50LWVhc3QtYXNpYW46bm9ybWFsO3N0cm9rZS13aWR0aDowLjkyMTc3NyI+MjwvdHNwYW4+PC90ZXh0PgogPHRleHQgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgc3R5bGU9ImZvbnQtc3R5bGU6bm9ybWFsO2ZvbnQtdmFyaWFudDpub3JtYWw7Zm9udC13ZWlnaHQ6bm9ybWFsO2ZvbnQtc3RyZXRjaDpub3JtYWw7Zm9udC1zaXplOmluaGVyaXQ7Zm9udC1mYW1pbHk6c2Fucy1zZXJpZjstaW5rc2NhcGUtZm9udC1zcGVjaWZpY2F0aW9uOidzYW5zLXNlcmlmLCBOb3JtYWwnO2ZvbnQtdmFyaWFudC1saWdhdHVyZXM6bm9ybWFsO2ZvbnQtdmFyaWFudC1jYXBzOm5vcm1hbDtmb250LXZhcmlhbnQtbnVtZXJpYzpub3JtYWw7Zm9udC12YXJpYW50LWVhc3QtYXNpYW46bm9ybWFsO2ZpbGw6IzAwMDAwMDtzdHJva2Utd2lkdGg6MC4zNjkxOTkiIHg9IjIzLjU2MTgzNCIgeT0iMTkuNDAyOTEyIiBpZD0idGV4dDMiIHRyYW5zZm9ybT0ic2NhbGUoMC45ODI0NDg5OSwxLjAxNzg2NDUpIj48dHNwYW4gc29kaXBvZGk6cm9sZT0ibGluZSIgaWQ9InRzcGFuMyIgeD0iMTQiIHk9IjE5LjQwMjkxMiIgc3R5bGU9ImZvbnQtc3R5bGU6bm9ybWFsO2ZvbnQtdmFyaWFudDpub3JtYWw7Zm9udC13ZWlnaHQ6bm9ybWFsO2ZvbnQtc3RyZXRjaDpub3JtYWw7Zm9udC1zaXplOmluaGVyaXQ7Zm9udC1mYW1pbHk6c2Fucy1zZXJpZjstaW5rc2NhcGUtZm9udC1zcGVjaWZpY2F0aW9uOidzYW5zLXNlcmlmLCBOb3JtYWwnO2ZvbnQtdmFyaWFudC1saWdhdHVyZXM6bm9ybWFsO2ZvbnQtdmFyaWFudC1jYXBzOm5vcm1hbDtmb250LXZhcmlhbnQtbnVtZXJpYzpub3JtYWw7Zm9udC12YXJpYW50LWVhc3QtYXNpYW46bm9ybWFsO3N0cm9rZS13aWR0aDowLjM2OTE5OSI+MzwvdHNwYW4+PC90ZXh0PgogPHBhdGggc3R5bGU9ImZpbGw6bm9uZTtmaWxsLXJ1bGU6ZXZlbm9kZDtzdHJva2U6IzAwMDAwMDtzdHJva2Utd2lkdGg6MC45ODU2MDhweDtzdHJva2UtbGluZWNhcDpidXR0O3N0cm9rZS1saW5lam9pbjptaXRlcjtzdHJva2Utb3BhY2l0eToxIiBkPSJNIDUuMTI4MjAyLDE4LjgwNzEyNyAxOS44NjExNjYsNS44MTI3NjEzIiBpZD0icGF0aDQiIGlua3NjYXBlOmNvbm5lY3Rvci10eXBlPSJwb2x5bGluZSIgaW5rc2NhcGU6Y29ubmVjdG9yLWN1cnZhdHVyZT0iMCI+PC9wYXRoPgoKPC9nPgo8L3N2Zz4=" alt="mult2" data-id="mult2" data-json="{&quot;name&quot;:&quot;mult2&quot;,&quot;value&quot;:&quot;1 <Q2!3> &quot;}">
        </p></div>
        </div>
        
  </div>`;

    const textTEst2 = `<div class="requirement ck-widget"   contenteditable="false"     >
    <div class="aw-requirement-marker">
    
      <span class="aw-ckeditor-marker-element" title="3">3</span>   
      </div>
      
      <div class="aw-requirement-content">
        <div class="aw-requirement-bodytext ck-editor__editable ck-editor__nested-editable" isdirty="false" contenteditable="true"><p>Содержимоеcv</p></div>
        </div>
        </div>`;

    setTimeout(() => {
      editor.setData(`<p>${" " + " " + textTEst + " " + textTEst01 + " " + textTEst2}</p>`);
      removeAllParagraph(editor)
      // editor.set("isReadOnly", true);
    }, 500);

    console.log("Editor was initialized", editor);
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

    editor.on("selectionLiElem", (e, currentData) => {
      console.log("selectionLiElem", currentData);
      const value = currentData.value;
      const model = editor.model;
      model.change((writer) => {
        if (value) {
          value._setAttribute("data-custom_comment", 222);
          // writer.setAttribute("data-custom_comment", 222, viewToModelElem(editor, value));
          console.log("data-custom_comment", 222, value);
        }
      });
    });

    editor.on("selectionReqElem", (e, currentData) => {
      console.log("selectionReqElem", currentData);
      const value = currentData.value;

      const reqDom = editor.editing.view.domConverter.mapViewToDom(value);


      const reqString = reqDom.outerHTML;

      console.log("moveReqToLib_contents", reqDom, reqString);

      const model = editor.model;
      model.change((writer) => {
        if (value) {
          value._setAttribute("data-custom_comment", 222);
          writer.setAttribute("data-custom_comment", 222, viewToModelElem(editor, value));
          console.log("data-custom_comment", 222, value);
        }
      });
    });

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
        // console.log(editor.commands.get("undo"));
        // editor.commands
        //   .get("undo")
        //   .on("change:isEnabled", (e, args, newVal, oldVal) => {
        //     console.log(e, args, newVal, oldVal);
        //   });

        console.log("parseReqDivTags", editor.getData(), parseReqDivTags(editor.getData()));

        // console.log(editor.getData());
        console.log(getArrayImgObjByHtmlString(editor.getData()));

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
  const startRex = /^\s*<li\b[^>]*>/i;
  if (Array.isArray(liObjectsOrArray)) {
    liObjectsOrArray.forEach((content) => {
      const wrapInLiTag = startRex.test(content) && /<\/li>\s*$/i.test(content);
      htmlContent += wrapInLiTag ? `${content}` : `<li>${content}</li>`;
    });
  } else {
    for (const key in liObjectsOrArray) {
      const liObject = liObjectsOrArray[key];
      const wrapInLiTag = startRex.test(liObject.content) && /<\/li>\s*$/i.test(liObject.content);
      htmlContent += wrapInLiTag ? `${liObject.content}` : `<li>${liObject.content}</li>`;
    }
  }
  htmlContent += "</ol>";
  return htmlContent;
}

// const liObjects = {
//   1: { number: 1, content: "Mix flour, baking powder, sugar, and salt." },
//   2: { number: 2, content: "In another bowl, mix eggs, milk, and oil." },
//   3: { number: 3, content: "Stir <p>both mixtures</p> together." },
//   4: { number: 4, content: "Fill muffin tray 3/4 full." },
//   5: { number: 5, content: "Bake for 20 minutes." },
// };

// const _htmlContent = createHtmlFromLiObjects(liObjects);
// const __htmlContent = createHtmlFromLiObjects(["a", "b", "c"]);
// console.log(_htmlContent);
// console.log(__htmlContent);
