import { ButtonView } from "./ckeditor";

export function createTestItemToolbar(editor, name, icon, cb) {
    editor.ui.componentFactory.add(name, (locale) => {
        const button = new ButtonView(locale);
  
        button.set({
          label: name,
          icon,
          tooltip: true,
        });
  
        button.on("execute", () => {
          cb();
         });
  
        return button;
      });
}

// example 
// createTestItemToolbar(editor, "test", icon, () => {})
