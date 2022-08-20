import { EditorState, Modifier, SelectionState } from "draft-js";

const TAB_CHARACTER = "\t";
type KeyHandler = (event: React.KeyboardEvent<HTMLDivElement>, es: EditorState) => EditorState;

// #region -- Information Getters --
const getTabInfo = (line: string) => {
  const matches = line.matchAll(/^\t+/g);
  const tabCount = matches?.next()?.value?.[0]?.length ?? 0;
  return {
    tabCount
  };
};

const getInfo = (es: EditorState) => {
  const cc = es.getCurrentContent();
  const sel = es.getSelection();
  const block = cc.getBlockForKey(sel.getStartKey());
  return {
    cc,
    sel,
    block
  };
};

const getSelectionInfo = (es: EditorState) => {
  const sel = es.getSelection();
  const currBlock = es.getCurrentContent().getBlockForKey(sel.getAnchorKey());
  const start = sel.getStartOffset();
  const end = sel.getEndOffset();
  const currText = currBlock.getText();
  const before: string = currText.substring(0, start);
  const after: string = currText.substring(end);
  return {
    key: sel.getAnchorKey(),
    currText,
    before,
    after
  };
};

// #endregion

/**
 * Splits the current block
 */
export const onEnter: KeyHandler = (event, es) => {
  event.preventDefault();
  const { cc, sel, block } = getInfo(es);
  const nC = Modifier.splitBlock(cc, sel);
  let nES = EditorState.push(es, nC, "split-block");
  const { tabCount } = getTabInfo(block.getText());
  if (tabCount > 0) {
    const nC = Modifier.insertText(
      nES.getCurrentContent(),
      nES.getSelection(),
      TAB_CHARACTER.repeat(tabCount)
    );
    nES = EditorState.push(nES, nC, "insert-characters");
  }

  return nES;
};

/**
 * Inserts a tab character at the current cursor position.
 * If shift is held, will try to remove a leading tab character.
 */
export const onTab: KeyHandler = (event, es) => {
  event.preventDefault();
  const { cc, sel, block } = getInfo(es);
  if (!event.shiftKey) {
    const nC = Modifier.insertText(cc, sel, TAB_CHARACTER);
    const nES = EditorState.push(es, nC, "insert-characters");
    return nES;
  }

  const { tabCount } = getTabInfo(block.getText());
  if (tabCount === 0) return es;

  const { before } = getSelectionInfo(es);

  // Remove the first character (leading tab)
  const targetSel = new SelectionState({
    anchorKey: sel.getStartKey(),
    anchorOffset: 0,
    focusKey: sel.getStartKey(),
    focusOffset: 1
  });
  const nC = Modifier.removeRange(cc, targetSel, "backward");
  let nES = EditorState.push(es, nC, "remove-range");

  // Move selection back to where it should be.
  // If not performed, the caret will remain where the tab was removed.
  const targetOffset = before.length - 1;
  nES = EditorState.forceSelection(
    nES,
    sel.merge({
      anchorOffset: targetOffset,
      focusOffset: targetOffset
    })
  );

  return nES;
  //
};
