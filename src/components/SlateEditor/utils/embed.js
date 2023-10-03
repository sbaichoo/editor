import { Transforms } from "slate";

import { createParagraph } from "./paragraph";
export const createImageNode = (alt, { url, width, height, src }) => ({
  type: "image",
  alt,
  url,
  width,
  height,
  src,
  children: [{ text: "" }]
});
export const createVideoNode = ({ url, width, height }) => ({
  type: "video",
  url,
  width,
  height,
  children: [{ text: "" }]
});

export const insertEmbed = (editor, embedData, format) => {
  const { url, width, height, src } = embedData;
  console.log("embedData", embedData);
  if (src && !url) {
    console.log("im here");
    embedData.width = width ? `${width}px` : "100%";
    embedData.height = height ? `${height}px` : "auto";
  }
  if (!url && !src) return;
  embedData.width = width ? `${width}px` : "100%";
  embedData.height = height ? `${height}px` : "auto";
  const embed =
    format === "image"
      ? createImageNode("EditorImage", embedData)
      : createVideoNode(embedData);

  console.log(format);
  console.log("embed", embed);
  Transforms.insertNodes(editor, embed, { select: true });
  Transforms.insertNodes(editor, createParagraph(""), { mode: "highest" });
};
