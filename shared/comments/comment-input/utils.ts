export function getCommentInputHeight(contentHeight: number) {
  return Math.min(Math.max(contentHeight, 52), 120);
}
