import React from 'react';

// Simple mock for react-markdown
const ReactMarkdown: React.FC<{ children: string; remarkPlugins?: any[] }> = ({ children }) => {
  return <div>{children}</div>;
};

export default ReactMarkdown;