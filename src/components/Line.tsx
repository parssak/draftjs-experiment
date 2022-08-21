import React, { Fragment, useContext } from "react";
import { ContentBlock, ContentState, EditorBlock, SelectionState } from "draft-js";
import { BlockMetaMap, EditorContext } from "./Editor";

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
  // @ts-ignore
  const lineNumber = blockMap.findIndex((block) => blockKey === block.key) + 1;
  const size = `${blockMap.length}`.length;
  const lineValue = DEBUGGING.LINE ? blockKey : lineNumber;

  const getLineStatus = (blockStates: BlockMetaMap) => {
    const blockState = blockStates.get(blockKey);
    if (blockState) {
      return blockState.status;
    }
    return "";
  };

  const getActiveStatus = (blockStates: BlockMetaMap) => {
    const blockState = blockStates.get(blockKey);
    if (blockState) {
      return blockState.isActive;
    }
    return false;
  };

  const getLineInfo = (blockStates: BlockMetaMap) => {
    const blockState = blockStates.get(blockKey);
    if (blockState) {
      console.debug(blockState);
      return blockState.info;
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
        {({ blockStates }) => (
          <>
            {/* Background of line */}
            <div
              contentEditable={false}
              // @ts-ignore
              readOnly={true}
              className={`text-transparent absolute inset-0 border rounded  isolate select-none pointer-events-none 
              ${getLineStatus(blockStates) === "error" ? "bg-rose-500/10" : ""}
              ${getActiveStatus(blockStates) ? "border-neutral-400/40" : "border-transparent"}
                `}
            >
              &nbsp;
            </div>
            <div
              contentEditable={false}
              // @ts-ignore
              readOnly={true}
              className={` text-xs absolute inset-y-0 right-0 items-center flex px-2 rounded-r isolate select-none pointer-events-none 
              ${getLineStatus(blockStates) === "error" ? "bg-rose-200 z-10 text-red-700 font-medium" : ""}
                `}
            >
              {getLineInfo(blockStates)}
            </div>
            {props.blockProps.showLineNumbers && (
              <>
                <div
                  className={`absolute inset-y-0 left-0 text-transparent select-none pointer-events-none ${
                    getLineStatus(blockStates) === "error"
                      ? "bg-rose-600/30 rounded-l "
                      : "bg-transparent"
                  }`}
                  style={{
                    width: DEBUGGING.LINE ? "4rem" : `${Math.max(size + 1, 3)}ch`
                  }}
                  contentEditable={false}
                  // @ts-ignore
                  readOnly={true}
                >
                  <span>{lineValue}</span>
                </div>

                <div
                  onClick={() => props.blockProps.onGlyphClick(block)}
                  className={`
                  relative h-full flex-shrink-0 select-none text-right opacity-80
                  -left-4
                  
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
              </>
            )}
          </>
        )}
      </EditorContext.Consumer>
      {/* Editable Area */}
      <div
        className="focus:outline-none whitespace-nowrap w-full relative "
        data-line-empty={block.getLength() === 0}
      >
        <EditorBlock {...props} readOnly={true} />
      </div>
      {/* Line Number */}
    </div>
  );
};
