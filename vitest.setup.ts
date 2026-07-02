import "@testing-library/jest-dom/vitest";

// Polyfills de geometria que o jsdom não implementa e o ProseMirror/Tiptap
// exige ao posicionar o cursor. Retornar retângulos vazios é suficiente
// porque os testes não fazem asserções de layout.
const emptyRect = {
  x: 0,
  y: 0,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: 0,
  height: 0,
  toJSON: () => ({}),
} as DOMRect;

const emptyRectList = (): DOMRectList =>
  Object.assign([] as DOMRect[], { item: () => null }) as unknown as DOMRectList;

for (const proto of [Element.prototype, Range.prototype]) {
  if (!proto.getClientRects || proto === Range.prototype) {
    proto.getClientRects = emptyRectList;
    proto.getBoundingClientRect = () => emptyRect;
  }
}

if (!document.elementFromPoint) {
  document.elementFromPoint = () => null;
}
