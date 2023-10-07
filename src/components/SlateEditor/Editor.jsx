import React, {useCallback, useMemo, useState} from "react";
import {createEditor} from "slate";
import {withHistory} from "slate-history";
import {Editable, Slate, withReact} from "slate-react";
import Toolbar from "./Toolbar/Toolbar";
import {fontFamilyMap, sizeMap} from "./utils/SlateUtilityFunctions.js";
import withLinks from "./plugins/withLinks.js";
import withTables from "./plugins/withTable.js";
import withEmbeds from "./plugins/withEmbeds.js";
import "./Editor.css";
import Link from "./Elements/Link/Link";
import Image from "./Elements/Image/Image";
import Video from "./Elements/Video/Video";
import {html} from "./html";

var inline = require('inline-style-2-json');


const document = new DOMParser().parseFromString(html, 'text/html');

function convertToJSXElement(domElement) {
    // Use React.createElement to create a JSX element
    return React.createElement(
        domElement.tagName.toLowerCase(), // Element type
        {
            key: domElement.getAttribute('id') || domElement.getAttribute('class'), // Key (optional)
            // Add any other props or attributes you want to pass
            // For example, you can set attributes like className, id, etc.
        },
        // Convert child elements recursively
        Array.from(domElement.children).map(convertToJSXElement)
    );
}

// Create an array of JSX elements by converting each element in the HTMLCollection
const jsxElements = Array.from(document.body.children).map(convertToJSXElement);

function convertParagraphToSlateTextWithStyle(pElement) {
    const textNode = {
        text: pElement.textContent,
        className: pElement.className, // Preserve class name as a boolean
        id: pElement.id,
        style: pElement.style.cssText, // Preserve the style attribute
    };

    return {
        type: 'paragraph', // Define the type as per your Slate.js schema
        children: [textNode],
    };
}

let map2 = Array.from(document.body.children).map(convertParagraphToSlateTextWithStyle)
    .map(value => {
            let style = value.children.at(0).style;
            let inline1 = inline(style);

            let keys = Object.keys(inline1).map(value1 => value1.trim());

            let values = Object.values(inline1).map(value1 => value1.toString().trim().replace('"', '').replace('\"', ''));

            const merged = keys.reduce((obj, key, index) => ({...obj, [key]: values[index]}), {});

            value.children[0] = {
                ...value.children.at(0),
                ...merged
            };
            return value;
        }
    );

const Element = (props) => {
    const {attributes, children, element} = props;

    switch (element.type) {
        case "headingOne":
            return <h1 {...attributes}>{children}</h1>;
        case "headingTwo":
            return <h2 {...attributes}>{children}</h2>;
        case "headingThree":
            return <h3 {...attributes}>{children}</h3>;
        case "blockquote":
            return <blockquote {...attributes}>{children}</blockquote>;
        case "alignLeft":
            return (
                <div
                    style={{textAlign: "left", listStylePosition: "inside"}}
                    {...attributes}
                >
                    {children}
                </div>
            );
        case "alignCenter":
            return (
                <div
                    style={{textAlign: "center", listStylePosition: "inside"}}
                    {...attributes}
                >
                    {children}
                </div>
            );
        case "alignRight":
            return (
                <div
                    style={{textAlign: "right", listStylePosition: "inside"}}
                    {...attributes}
                >
                    {children}
                </div>
            );
        case "list-item":
            return <li {...attributes}>{children}</li>;
        case "orderedList":
            return (
                <ol type="1" {...attributes}>
                    {children}
                </ol>
            );
        case "unorderedList":
            return <ul {...attributes}>{children}</ul>;
        case "link":
            return <Link {...props} />;

        case "table":
            return (
                <table>
                    <tbody {...attributes}>{children}</tbody>
                </table>
            );
        case "table-row":
            return <tr {...attributes}>{children}</tr>;
        case "table-cell":
            return <td {...attributes}>{children}</td>;
        case "image":
            return <Image {...props} />;
        case "video":
            return <Video {...props} />;
        default:
            return <p {...attributes}>{children}</p>;
    }
};

const Leaf = ({attributes, children, leaf}) => {
    if (leaf.bold) {
        children = <strong>{children}</strong>;
    }

    if (leaf.code) {
        children = <code>{children}</code>;
    }

    if (leaf.italic) {
        children = <em>{children}</em>;
    }
    if (leaf.strikethrough) {
        children = (
            <span style={{textDecoration: "line-through"}}>{children}</span>
        );
    }
    if (leaf.underline) {
        children = <u>{children}</u>;
    }
    if (leaf.superscript) {
        children = <sup>{children}</sup>;
    }
    if (leaf.subscript) {
        children = <sub>{children}</sub>;
    }
    if (leaf.color) {
        children = <span style={{color: leaf.color}}>{children}</span>;
    }
    if (leaf.bgColor) {
        children = (
            <span style={{backgroundColor: leaf.bgColor}}>{children}</span>
        );
    }
    if (leaf.fontSize) {
        const size = sizeMap[leaf.fontSize];
        children = <span style={{fontSize: size}}>{children}</span>;
    }
    if (leaf.fontFamily) {
        const family = fontFamilyMap[leaf.fontFamily];
        children = <span style={{fontFamily: family}}>{children}</span>;
    }
    if (leaf.className) {
        children = <span className={leaf.className}>{children}</span>;
    }
    if (leaf.id) {
        children = <span className={leaf.id}>{children}</span>;
    }
    if (leaf.style) {
        children = <span style={inlineStylesToObject(leaf.style)}>{children}</span>;
    }
    return <span {...attributes}>{children}</span>;
};


function inlineStylesToObject(styles) {

    const regex = /([\w-]+)\s*:\s*((?:(?:"[^"]+")|(?:'[^']+')|[^;])*);?/g;

    const obj = {};

    let match;
    // eslint-disable-next-line no-cond-assign
    while (match = regex.exec(styles)) {
        obj[match[1]] = match[2].trim().replaceAll('"', '');
    }

    return obj;

}

const SlateEditor = () => {
    const editor = useMemo(
        () =>
            withHistory(withEmbeds(withTables(withLinks(withReact(createEditor()))))),
        []
    );

    const initialValue = useMemo(
        () =>
            JSON.parse(localStorage.getItem('content')) ||
            /*               {
                               type: 'paragraph',
                               children: [{text: 'A line of text in a paragraph.'}],
                           },*/
            map2
        ,
        []
    )

    const [value, setValue] = useState(initialValue);

    const renderElement = useCallback((props) => <Element {...props} />, []);

    const renderLeaf = useCallback((props) => {
        return <Leaf {...props} />;
    }, []);

    return (
        <Slate
            editor={editor}
            value={value}
            onChange={
                (newValue) => {
                    setValue(newValue)

                    const isAstChange = editor.operations.some(
                        op => 'set_selection' !== op.type
                    )
                    if (isAstChange) {
                        // Save the value to Local Storage.
                        const content = JSON.stringify(value)
                        localStorage.setItem('content', content);
                    }
                }
            }
        >
            <Toolbar/>
            <div
                className="editor-wrapper"
                style={{border: "1px solid #f3f3f3", padding: "0 10px"}}
            >
                <Editable
                    placeholder=""
                    renderElement={renderElement}
                    renderLeaf={renderLeaf}
                />
            </div>
        </Slate>
    );
};

export default SlateEditor;
