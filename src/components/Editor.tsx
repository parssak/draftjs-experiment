import React, { useEffect, useState } from "react";
import "draft-js/dist/Draft.css";
import { ContentBlock, Editor as DraftEditor, EditorState } from "draft-js";
import { onEnter, onTab } from "./actions";
import { Line } from "./Line";

const getCaretCoordinates = () => {
  let x = -1,
    y = -1;
  const isSupported = typeof window.getSelection !== "undefined";
  if (isSupported) {
    const selection = window.getSelection();
    if (selection && selection.rangeCount !== 0) {
      const range = selection.getRangeAt(0).cloneRange();
      range.collapse(true);
      const rect = range.getClientRects()[0];
      if (rect) {
        x = rect.left;
        y = rect.top;
      }
    }
  }
  return { x, y };
};

const useCaretCoordinates = () => {
  const [coordinates, setCoordinates] = useState({ x: -1, y: -1 });
  useEffect(() => {
    const updateCoords = () => {
      setCoordinates(getCaretCoordinates());
    };
    window.addEventListener("mouseup", updateCoords);
    window.addEventListener("keyup", updateCoords);
    window.addEventListener("keydown", updateCoords);

    return () => {
      window.removeEventListener("mouseup", updateCoords);
      window.removeEventListener("keyup", updateCoords);
      window.removeEventListener("keydown", updateCoords);
    };
  }, []);

  useEffect(() => {
    const resetCoords = () => {
      setCoordinates({ x: -1, y: -1 });
    };

    window.addEventListener("scroll", resetCoords);
    window.addEventListener("resize", resetCoords);

    return () => {
      window.addEventListener("scroll", resetCoords);
      window.addEventListener("resize", resetCoords);
    };
  }, []);

  return coordinates;
};

const blockRendererFn = (
  contentBlock: ContentBlock,
  options = {
    showLineNumbers: true,
    onGlyphClick: (_: ContentBlock) => {}
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

type BlockMeta = {
  status: "none" | "warning" | "error";
  info: string;
  isActive: boolean;
};

export type BlockMetaMap = Map<string, BlockMeta>;

export const EditorContext = React.createContext({
  blockStates: new Map()
} as {
  blockStates: BlockMetaMap;
});

const DEFAULT_BLOCK_META_DATA: BlockMeta = {
  status: "none",
  info: "",
  isActive: false
};

const focusedInEditor = () => {
  const activeElement = document.activeElement;
  return (
    activeElement instanceof HTMLElement &&
    activeElement.classList.contains("public-DraftEditor-content")
  );
};

export const Editor = ({ ...props }: Props) => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [blockStates, setBlockStates] = useState<BlockMetaMap>(new Map());
  const [hitEscape, setHitEscape] = useState(false);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    setHitEscape(false);
    switch (e.key) {
      case "Enter":
        setEditorState(onEnter(e, editorState));
        break;
      case "Tab":
        setEditorState(onTab(e, editorState));
        break;
      case "ArrowDown":
      case "ArrowUp":
        if (showDropdown) e.preventDefault();
      case "Escape":
        setHitEscape(true);
      default:
        break;
    }
  };

  // Cheap temp checking
  const lineError = (text: string) => {
    if (!text) return "";
    if (!text.includes("{{") && !text.includes("}}")) return "";
    if (text.includes("{{") && !text.includes("}}")) return "Unmatched open brace";
    if (!text.includes("{{") && text.includes("}}")) return "Unmatched close brace";
    return "";
  };

  useEffect(() => {
    const blockMap = editorState.getCurrentContent().getBlockMap();
    const blockKeys = blockMap.keySeq().toArray();
    const anchorKey = editorState.getSelection().getAnchorKey();
    const focusKey = editorState.getSelection().getFocusKey();
    console.debug('Editor useEffect', anchorKey, focusKey);

    const newBlockStates: BlockMetaMap = new Map(
      blockKeys.map((key) => [
        key,
        {
          ...(blockStates.get(key) ?? DEFAULT_BLOCK_META_DATA),
          status: lineError(blockMap.get(key).getText()) ? "error" : "none",
          info: lineError(blockMap.get(key).getText()),
          isActive: key === anchorKey && anchorKey === focusKey
        }
      ])
    );
    setBlockStates(newBlockStates);
  }, [editorState]);

  const onGlyphClick = (_: ContentBlock) => {};

  const { x, y } = useCaretCoordinates();

  const currentWord = React.useMemo(() => {
    const selection = editorState.getSelection();
    const currWord = editorState
      .getCurrentContent()
      .getBlockForKey(selection.getAnchorKey())
      .getText()
      .slice(0, selection.getAnchorOffset())
      .split(" ")
      .pop()
      ?.trim();

    return currWord;
  }, [editorState]);

  const showDropdown = React.useMemo(() => {
    if (
      x === -1 ||
      y === -1 ||
      !focusedInEditor() ||
      !currentWord ||
      hitEscape ||
      !editorState.getSelection().isCollapsed()
    )
      return false;
    return true;
  }, [x, y, currentWord, hitEscape, editorState]);

  return (
    <>
      <div {...props} onKeyDown={onKeyDown} className="font-mono overflow-hidden">
        <EditorContext.Provider value={{ blockStates }}>
          <DraftEditor
            editorState={editorState}
            onChange={setEditorState}
            blockRendererFn={(block: ContentBlock) =>
              blockRendererFn(block, {
                showLineNumbers: true,
                onGlyphClick
              })
            }
          />
        </EditorContext.Provider>
      </div>

      {showDropdown && (
        <div
          className="absolute font-mono p-1 z-[1] border bg-neutral-100 border-neutral-400 dark:bg-neutral-900 dark:border-neutral-600 rounded text-sm"
          style={{
            top: y + 20 + 4,
            left: x
          }}
        >
          {currentWord}
        </div>
      )}
    </>
  );
};
