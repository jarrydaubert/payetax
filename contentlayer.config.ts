// contentlayer.config.ts
import { defineDocumentType, makeSource } from 'contentlayer2/source-files';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import { codeImport } from 'remark-code-import';
import remarkGfm from 'remark-gfm';

const computedFields = {
  slugAsParams: {
    type: 'string' as const,
    resolve: (doc: any) => doc._raw.flattenedPath.split('/').slice(1).join('/'),
  },
  readingTime: {
    type: 'number' as const,
    resolve: (doc: any) => {
      // Estimate reading time: ~200 words per minute
      const wordsPerMinute = 200;
      const wordCount = doc.body.raw.trim().split(/\s+/).length;
      return Math.ceil(wordCount / wordsPerMinute);
    },
  },
  wordCount: {
    type: 'number' as const,
    resolve: (doc: any) => doc.body.raw.trim().split(/\s+/).length,
  },
};

export const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `blog/**/*.mdx`,
  contentType: 'mdx',
  fields: {
    title: {
      type: 'string',
      description: 'The title of the post',
      required: true,
    },
    slug: {
      type: 'string',
      description: 'URL slug for the post',
      required: false, // Auto-generated from filename if not provided
    },
    excerpt: {
      type: 'string',
      description: 'Short excerpt for SEO and post listings',
      required: true,
    },
    publishedAt: {
      type: 'date',
      description: 'Publication date',
      required: true,
    },
    updatedAt: {
      type: 'date',
      description: 'Last updated date',
      required: false,
    },
    category: {
      type: 'string',
      description: 'Post category (Tax Basics, Tax Tips, etc.)',
      required: true,
    },
    tags: {
      type: 'list',
      description: 'Post tags for categorization',
      of: { type: 'string' },
      required: false,
    },
    image: {
      type: 'string',
      description: 'Featured image URL',
      required: false,
    },
    imageAlt: {
      type: 'string',
      description: 'Alt text for featured image',
      required: false,
    },
    author: {
      type: 'string',
      description: 'Post author',
      required: false,
      default: 'TaxInsights Editorial Team',
    },
    readTime: {
      type: 'string',
      description: 'Estimated reading time',
      required: false,
    },
    featured: {
      type: 'boolean',
      description: 'Mark as featured post',
      required: false,
      default: false,
    },
    published: {
      type: 'boolean',
      description: 'Publication status',
      required: false,
      default: true,
    },
    seoTitle: {
      type: 'string',
      description: 'SEO title override',
      required: false,
    },
    seoDescription: {
      type: 'string',
      description: 'SEO description override',
      required: false,
    },
    seoKeywords: {
      type: 'list',
      description: 'SEO keywords (alternative to keywords)',
      of: { type: 'string' },
      required: false,
    },
    keywords: {
      type: 'list',
      description: 'SEO keywords',
      of: { type: 'string' },
      required: false,
    },
    canonicalUrl: {
      type: 'string',
      description: 'Canonical URL for the post',
      required: false,
    },
  },
  computedFields,
}));

export default makeSource({
  contentDirPath: './content',
  documentTypes: [Post],
  disableImportAliasWarning: true,
  mdx: {
    remarkPlugins: [remarkGfm, codeImport],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypePrettyCode,
        {
          theme: 'one-dark-pro',
          keepBackground: false,
          onVisitLine(node: any) {
            // Prevent lines from collapsing in `display: grid` mode
            if (node.children.length === 0) {
              node.children = [{ type: 'text', value: ' ' }];
            }
          },
          onVisitHighlightedLine(node: any) {
            node.properties.className.push('line--highlighted');
          },
          onVisitHighlightedWord(node: any) {
            node.properties.className = ['word--highlighted'];
          },
        },
      ],
      [
        rehypeAutolinkHeadings,
        {
          properties: {
            className: ['subheading-anchor'],
            ariaLabel: 'Link to section',
          },
        },
      ],
    ],
  },
});
