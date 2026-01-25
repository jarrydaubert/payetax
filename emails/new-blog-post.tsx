// emails/new-blog-post.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface NewBlogPostEmailProps {
  title: string;
  excerpt: string;
  url: string;
  category?: string;
  unsubscribeUrl?: string;
}

const baseUrl = 'https://payetax.co.uk';

export function NewBlogPostEmail({
  title = 'New Blog Post Title',
  excerpt = 'This is a preview of the blog post content that gives readers a taste of what to expect...',
  url = 'https://payetax.co.uk/blog/example-post',
  category = 'Tax Tips',
  unsubscribeUrl = '{{{RESEND_UNSUBSCRIBE_URL}}}',
}: NewBlogPostEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>New on PayeTax: {title}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src={`${baseUrl}/images/logo-light.png`}
              width='120'
              height='32'
              alt='PayeTax'
              style={logo}
            />
          </Section>

          {/* Content */}
          <Section style={content}>
            <Text style={categoryBadge}>{category}</Text>
            <Heading style={heading}>{title}</Heading>
            <Text style={paragraph}>{excerpt}</Text>
            <Button style={button} href={url}>
              Read Full Article →
            </Button>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              You're receiving this because you subscribed to PayeTax updates.
            </Text>
            <Text style={footerText}>
              <Link href={unsubscribeUrl} style={footerLink}>
                Unsubscribe
              </Link>
              {' · '}
              <Link href={`${baseUrl}/privacy`} style={footerLink}>
                Privacy Policy
              </Link>
              {' · '}
              <Link href={baseUrl} style={footerLink}>
                PayeTax.co.uk
              </Link>
            </Text>
            <Text style={copyright}>© 2026 PayeTax. Free UK tax calculator.</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default NewBlogPostEmail;

// Styles
const main = {
  backgroundColor: '#0d1117',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '560px',
};

const header = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const logo = {
  margin: '0 auto',
};

const content = {
  backgroundColor: '#161b22',
  borderRadius: '12px',
  padding: '32px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
};

const categoryBadge = {
  display: 'inline-block',
  backgroundColor: 'rgba(6, 182, 212, 0.1)',
  color: '#06b6d4',
  fontSize: '12px',
  fontWeight: '600' as const,
  padding: '4px 12px',
  borderRadius: '9999px',
  marginBottom: '16px',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const heading = {
  color: '#ffffff',
  fontSize: '24px',
  fontWeight: '700' as const,
  lineHeight: '1.3',
  margin: '0 0 16px 0',
};

const paragraph = {
  color: '#8b949e',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 24px 0',
};

const button = {
  display: 'inline-block',
  background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
  color: '#0d1117',
  fontSize: '14px',
  fontWeight: '600' as const,
  padding: '12px 24px',
  borderRadius: '8px',
  textDecoration: 'none',
};

const divider = {
  borderColor: 'rgba(255, 255, 255, 0.1)',
  margin: '32px 0',
};

const footer = {
  textAlign: 'center' as const,
};

const footerText = {
  color: '#6e7681',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '0 0 8px 0',
};

const footerLink = {
  color: '#06b6d4',
  textDecoration: 'none',
};

const copyright = {
  color: '#484f58',
  fontSize: '11px',
  marginTop: '16px',
};
