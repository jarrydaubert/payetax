import {
  buildGitLabDeployRecoveryPayload,
  describeGitLabDeployRecoveryState,
  MANUAL_VERCEL_STATUS_NAME,
  parseGitLabDeployRecoveryState,
  resolveGitLabRecoverySha,
} from '../gitlabDeployRecovery';

describe('gitlabDeployRecovery helpers', () => {
  it('parses valid recovery states', () => {
    expect(parseGitLabDeployRecoveryState('success')).toBe('success');
    expect(parseGitLabDeployRecoveryState('failed')).toBe('failed');
  });

  it('rejects invalid recovery states', () => {
    expect(() => parseGitLabDeployRecoveryState('pending')).toThrow(
      'State must be either "success" or "failed".',
    );
  });

  it('prefers the pushed upstream SHA when one exists', () => {
    expect(
      resolveGitLabRecoverySha({
        currentSha: 'local-sha',
        upstreamSha: 'remote-sha',
      }),
    ).toBe('remote-sha');
  });

  it('falls back to the current SHA when no upstream SHA exists', () => {
    expect(
      resolveGitLabRecoverySha({
        currentSha: 'local-sha',
        upstreamSha: null,
      }),
    ).toBe('local-sha');
  });

  it('builds a GitLab status payload for successful recovery', () => {
    const payload = buildGitLabDeployRecoveryPayload({
      state: 'success',
      targetUrl: 'https://payetax.example.vercel.app',
      ref: 'main',
    });

    expect(payload.get('state')).toBe('success');
    expect(payload.get('name')).toBe(MANUAL_VERCEL_STATUS_NAME);
    expect(payload.get('target_url')).toBe('https://payetax.example.vercel.app');
    expect(payload.get('description')).toBe(describeGitLabDeployRecoveryState('success'));
    expect(payload.get('ref')).toBe('main');
  });

  it('builds a GitLab status payload for failed recovery', () => {
    const payload = buildGitLabDeployRecoveryPayload({
      state: 'failed',
      targetUrl: 'https://vercel.com/jgf-project-javelin/payetax/deployments/example',
    });

    expect(payload.get('state')).toBe('failed');
    expect(payload.get('description')).toBe(describeGitLabDeployRecoveryState('failed'));
    expect(payload.get('ref')).toBeNull();
  });

  it('rejects non-https target URLs', () => {
    expect(() =>
      buildGitLabDeployRecoveryPayload({
        state: 'success',
        targetUrl: 'http://insecure.example.com',
      }),
    ).toThrow('Target URL must be an https:// URL.');
  });
});
