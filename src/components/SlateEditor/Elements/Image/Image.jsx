import { useSelected, useFocused } from "slate-react";
import "./Image.css";
import React from "react";

const Image = ({ attributes, element, children }) => {
  const { url, width, height, src } = element;
  const selected = useSelected();
  const focused = useFocused();
  let finalUrl = "";
  if (src && !url) {
    finalUrl = src;
  }
  if (!src && url) {
    finalUrl = url;
  }
  return (
    <div
      {...attributes}
      className="element-image"
      style={{
        display: "flex",
        justifyContent: "center",
        boxShadow: selected && focused && "0 0 3px 3px lightgray"
      }}
    >
      <details>
        <summary>Toggle Switch</summary>
        Foldable Content[enter image description here][1]
      </details>
      <div contentEditable={false} style={{ width: width, height: height }}>
        <details>
          <summary>Toggle Switch</summary>
          Foldable Content[enter image description here][1]
        </details>
        <img alt={element.alt} src={finalUrl} />
      </div>
      {children}
    </div>
  );
};

export default Image;
