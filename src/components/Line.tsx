import React, { Fragment, useContext } from "react";
import { ContentBlock, ContentState, EditorBlock, SelectionState } from "draft-js";
import { EditorContext } from "./Editor";

const DEBUGGING = {
  LINE: false
};

export const Line = ({
  ...props
}: {
  block: any;
  contentState: ContentState;
  selection: SelectionState;
  blockProps: {
    onGlyphClick: (block: ContentBlock) => void;
    showLineNumbers: boolean;
  };
}) => {
  const { block, contentState } = props;
  const blockMap = contentState.getBlockMap().toArray();
  const blockKey = block.key;
  const currentText = block.getText() as string;
  // @ts-ignore
  const lineNumber = blockMap.findIndex((block) => blockKey === block.key) + 1;
  const size = `${blockMap.length}`.length;
  const lineValue = DEBUGGING.LINE ? blockKey : lineNumber;
  const getLineStatus = (warningBlocks: string[]) => {
    if (warningBlocks.includes(blockKey)) {
      return "warning";
    }
    return "";
  };
  return (
    <div
      className={`flex items-start relative
    ${props.blockProps.showLineNumbers ? "px-4" : "px-2"}
    `}
    >
      <EditorContext.Consumer>
        {({ warningBlocks }) => (
          <>
            <div
              contentEditable={false}
              // @ts-ignore
              readOnly={true}
              className={`absolute inset-0 ${
                getLineStatus(warningBlocks) === "warning" ? "bg-yellow-500/20" : ""
              }`}
            />
            {props.blockProps.showLineNumbers && (
              <div
                onClick={() => props.blockProps.onGlyphClick(block)}
                className={`
                  relative -left-5 flex-shrink-0 -mr-2 select-none text-right opacity-80
                  ${getLineStatus(warningBlocks) ? "bg-yellow-600/20" : "bg-transparent"}
                `}
                style={{
                  width: DEBUGGING.LINE ? "4rem" : `${Math.max(size + 1, 3)}ch`
                }}
                contentEditable={false}
                // @ts-ignore
                readOnly={true}
                data-line-value={lineValue}
              >
                <span>{lineValue}</span>
              </div>
            )}
          </>
        )}
      </EditorContext.Consumer>
      {/* Editable Area */}
      <div
        className="focus:outline-none whitespace-nowrap w-full relative"
        data-line-empty={block.getLength() === 0}
      >
        <EditorBlock {...props} readOnly={true} />
      </div>
      {/* Line Number */}
    </div>
  );
};
