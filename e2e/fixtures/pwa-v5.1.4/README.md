# Pinned PWA upgrade fixtures

These are byte-identical copies of the public scripts at the `v5.1.4` tag, stored
as text so formatters cannot rewrite historical behaviour. Do not modernise them.
The upgrade test serves them as JavaScript on a disposable local origin.

| Fixture | Git blob at `v5.1.4` |
| --- | --- |
| `sw.js.txt` | `bea3df37e0cb4a73a4d81e905641a4431fb03478` |
| `register-sw.js.txt` | `66cd9946439f71d928b0f94d1c3c7c634a5e3ebb` |

Recheck with `git hash-object e2e/fixtures/pwa-v5.1.4/*.txt` and
`git rev-parse v5.1.4:public/sw.js v5.1.4:public/register-sw.js`.
