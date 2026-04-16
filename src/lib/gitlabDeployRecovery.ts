export const MANUAL_VERCEL_STATUS_NAME = 'vercel-production-manual';

export type GitLabDeployRecoveryState = 'success' | 'failed';

interface BuildGitLabDeployRecoveryPayloadOptions {
  state: GitLabDeployRecoveryState;
  targetUrl: string;
  ref?: string;
}

interface ResolveGitLabRecoveryShaOptions {
  currentSha: string;
  upstreamSha?: string | null;
}

export function parseGitLabDeployRecoveryState(
  value: string | undefined,
): GitLabDeployRecoveryState {
  if (value === 'success' || value === 'failed') {
    return value;
  }

  throw new Error('State must be either "success" or "failed".');
}

export function describeGitLabDeployRecoveryState(state: GitLabDeployRecoveryState): string {
  return state === 'success'
    ? 'Production deployment verified manually after Vercel trigger drift.'
    : 'Production deployment failed during manual Vercel recovery.';
}

export function resolveGitLabRecoverySha({
  currentSha,
  upstreamSha,
}: ResolveGitLabRecoveryShaOptions): string {
  const normalizedUpstreamSha = upstreamSha?.trim();
  return normalizedUpstreamSha || currentSha;
}

export function buildGitLabDeployRecoveryPayload({
  state,
  targetUrl,
  ref,
}: BuildGitLabDeployRecoveryPayloadOptions): URLSearchParams {
  if (!targetUrl.startsWith('https://')) {
    throw new Error('Target URL must be an https:// URL.');
  }

  const payload = new URLSearchParams({
    state,
    name: MANUAL_VERCEL_STATUS_NAME,
    target_url: targetUrl,
    description: describeGitLabDeployRecoveryState(state),
  });

  if (ref) {
    payload.set('ref', ref);
  }

  return payload;
}
