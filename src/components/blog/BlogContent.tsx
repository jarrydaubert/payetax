'use client';

import type React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Props interface for the BlogContent component
 */
interface BlogContentProps {
  /** Markdown content to render */
  content: string;
}

/**
 * Client component for rendering markdown blog content
 * Uses remark-gfm for GitHub Flavored Markdown (tables, etc.)
 *
 * @param props - Component props containing the markdown content
 * @returns Rendered markdown content as React elements
 */
export default function BlogContent({ content }: BlogContentProps): React.ReactElement {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children, ...props }) => {
          const id =
            typeof children === 'string' ? children.toLowerCase().replace(/\s+/g, '-') : undefined;
          return <h1 className="text-3xl font-bold mt-8 mb-4" id={id} {...props} />;
        },
        h2: ({ children, ...props }) => {
          const id =
            typeof children === 'string' ? children.toLowerCase().replace(/\s+/g, '-') : undefined;
          return <h2 className="text-2xl font-bold mt-6 mb-3" id={id} {...props} />;
        },
        h3: ({ children, ...props }) => {
          const id =
            typeof children === 'string' ? children.toLowerCase().replace(/\s+/g, '-') : undefined;
          return <h3 className="text-xl font-bold mt-5 mb-2" id={id} {...props} />;
        },
        p: (props) => <p className="mb-4" {...props} />,
        ul: (props) => <ul className="list-disc pl-6 mb-4" {...props} />,
        ol: (props) => <ol className="list-decimal pl-6 mb-4" {...props} />,
        li: (props) => <li className="mb-1" {...props} />,
        a: (props) => (
          <a
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            {...props}
          />
        ),
        strong: (props) => <strong className="font-bold" {...props} />,
        em: (props) => <em className="italic" {...props} />,
        code: (props) => (
          <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded" {...props} />
        ),
        pre: (props) => (
          <pre
            className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-auto mb-4"
            {...props}
          />
        ),
        blockquote: (props) => (
          <blockquote
            className="border-l-4 border-gray-300 dark:border-gray-700 pl-4 italic my-4"
            {...props}
          />
        ),
        table: (props) => (
          <div className="overflow-x-auto my-6">
            <table
              className="border-collapse min-w-full border border-gray-300 dark:border-gray-700"
              {...props}
            />
          </div>
        ),
        thead: (props) => <thead className="bg-gray-100 dark:bg-gray-800" {...props} />,
        tbody: (props) => (
          <tbody className="divide-y divide-gray-300 dark:divide-gray-700" {...props} />
        ),
        tr: (props) => <tr className="hover:bg-gray-50 dark:hover:bg-gray-900" {...props} />,
        th: (props) => (
          <th
            className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left font-bold"
            {...props}
          />
        ),
        td: (props) => (
          <td className="border border-gray-300 dark:border-gray-700 px-4 py-2" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
