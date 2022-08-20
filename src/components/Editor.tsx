import React, { useState } from "react";
import "draft-js/dist/Draft.css";
import { ContentBlock, Editor as DraftEditor, EditorState } from "draft-js";
import { onEnter, onTab } from "./actions";
import { Line } from "./Line";

const blockRendererFn = (
  contentBlock: ContentBlock,
  options = {
    showLineNumbers: true,
    onGlyphClick: (block: ContentBlock) => {}
  }
) => {
  const type = contentBlock.getType();
  switch (type) {
    default:
      return {
        component: Line,
        editable: true,
        props: {
          showLineNumbers: options.showLineNumbers,
          onGlyphClick: options.onGlyphClick
        }
      };
  }
};

interface Props extends React.HTMLAttributes<HTMLDivElement> {}

export const EditorContext = React.createContext({
  warningBlocks: [] as string[]
});

export const Editor = ({ ...props }: Props) => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [showNumbers, setShowNumbers] = useState(true);
  const [warningBlocks, setWarningBlocks] = useState<string[]>([]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    switch (e.key) {
      case "Enter":
        setEditorState(onEnter(e, editorState));
        break;
      case "Tab":
        setEditorState(onTab(e, editorState));
        break;
      default:
        break;
    }
  };

  const onGlyphClick = (block: ContentBlock) => {
    const key = block.getKey();
    setWarningBlocks((prev) => {
      const newWarningBlocks = prev.includes(key) ? prev.filter((b) => b !== key) : [...prev, key];
      return newWarningBlocks;
    });
  };

  return (
    <div {...props} onKeyDown={onKeyDown} className="font-mono overflow-hidden">
      <EditorContext.Provider value={{ warningBlocks }}>
        <DraftEditor
          editorState={editorState}
          onChange={setEditorState}
          blockRendererFn={(block: ContentBlock) =>
            blockRendererFn(block, {
              showLineNumbers: showNumbers,
              onGlyphClick
            })
          }
        />
      </EditorContext.Provider>
    </div>
  );
};
