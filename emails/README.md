# Email Templates

Newsletter and notification email templates for PayeTax.

## Current Implementation

Templates use **raw HTML strings** (template literals) for simplicity and zero runtime dependencies.

## Files

- `welcome.tsx` - Welcome email for new newsletter subscribers
- `new-blog-post.tsx` - Notification when new blog posts are published

## Dependencies

`@react-email/components` is installed but not yet used. It's kept for potential future migration to React Email components (better DX, preview tooling).

See `docs/setup/RESEND.md` for newsletter setup and usage.

## Usage

```typescript
import { generateNewBlogPostHtml } from '@/emails/new-blog-post';
import { generateWelcomeEmailHtml } from '@/emails/welcome';

// Generate HTML string for Resend
const html = generateNewBlogPostHtml({ title, excerpt, url, recipientEmail });
```
