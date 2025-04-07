/**
 * @file PostBody.jsx
 * @description Component to render the content of a post.
 * Converts newline characters into <br /> tags, and collapses recurring newlines.
 */
import React from 'react';
import '../../styles/UniversitySocialFeed.css';

const PostBody = ({ content }) => {
  if (Array.isArray(content)) {
    return (
      <div className="post-content">
        {content.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    );
  }

  const normalizedContent = content.replace(/\n{3,}/g, '\n\n');
  const lines = normalizedContent.split('\n');

  return (
    <div className="post-content">
      {lines.map((line, index) => (
        <React.Fragment key={index}>
          {line}
          {index !== lines.length - 1 && <br />}
        </React.Fragment>
      ))}
    </div>
  );
};

export default PostBody;
