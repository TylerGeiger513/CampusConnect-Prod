/**
 * @file RichPostEditor.jsx
 * @description Rich text editor that highlights hashtags inline.
 * Hashtags matching /^#[\w]{1,32}$/ are rendered as links.
 */
import React, { useMemo, useCallback } from 'react';
import { createEditor, Text, Node } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';

const RichPostEditor = ({ value, onChange, placeholder }) => {
  const editor = useMemo(() => withReact(createEditor()), []);

  // Compute the initial Slate document from the parent value only once.
  const initialSlateValue = useMemo(
    () => [{ type: 'paragraph', children: [{ text: value || '' }] }],
    [] // run on mount only
  );

  const renderLeaf = useCallback(props => {
    if (props.leaf.hashtag) {
      return (
        <a {...props.attributes} className="hashtag">
          {props.children}
        </a>
      );
    }
    return <span {...props.attributes}>{props.children}</span>;
  }, []);

  const decorate = useCallback(([node, path]) => {
    const ranges = [];
    if (!Text.isText(node)) return ranges;
    const { text } = node;
    const regex = /#[\w]{1,32}/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      ranges.push({
        anchor: { path, offset: match.index },
        focus: { path, offset: match.index + match[0].length },
        hashtag: true,
      });
    }
    return ranges;
  }, []);

  return (
    <Slate
      editor={editor}
      initialValue={initialSlateValue}
      onChange={newValue => {
        // Extract plain text from the Slate document.
        const plainText = newValue.map(node => Node.string(node)).join('\n');
        onChange(plainText);
      }}
    >
      <Editable
        className="rich-editor"
        placeholder={placeholder || "What's on your mind?"}
        renderLeaf={renderLeaf}
        decorate={decorate}
      />
    </Slate>
  );
};

export default RichPostEditor;
