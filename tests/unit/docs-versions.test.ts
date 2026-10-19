import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { lockSchema, packageVersions } from '../../src/lib/docs/lock.ts';
import { DOC_PAGES, requiredFiles } from '../../src/lib/docs/manifest.ts';
import { docsPath, docsVersion } from '../../src/lib/docs/versions.ts';

const root = new URL('../../', import.meta.url);
const archive = new URL('vendor/nelcota-docs-releases/v0.5.0/source.json', root);

describe('documentation versions', () => {
  it('reads package sections without mistaking dependency versions for the release', () => {
    const files: Record<string, string> = {
      'Cargo.toml':
        '[workspace.dependencies]\nversion = "9.9.9"\n[workspace.package]\nversion = "0.5.0"\n[profile.release]\n',
      'sdk/rust/Cargo.toml': '[package]\nversion = "0.1.4"\n[dependencies]\nversion = "8.8.8"',
      'sdk/typescript/package.json': '{"version":"0.2.1"}',
    };
    assert.deepEqual(
      packageVersions((path) => files[path] ?? ''),
      { server: '0.5.0', rust: '0.1.4', typescript: '0.2.1' },
    );
    assert.throws(() => packageVersions(() => ''), /JSON/);
    assert.throws(() =>
      packageVersions((path) =>
        path.endsWith('.json') ? '{"version":"latest"}' : (files[path] ?? ''),
      ),
    );
  });

  it('rejects unregistered snapshot ids and keeps the existing URLs', () => {
    assert.throws(() => docsVersion('../main'), /Unknown documentation version/);
    assert.throws(() => docsVersion('v0.4.0'), /Unknown documentation version/);
    assert.equal(docsPath(), 'docs/');
    assert.equal(docsPath('v0.5.0', 'sdk'), 'docs/versions/v0.5.0/sdk/');
  });

  it('freezes archive inventory and validates relative source paths', () => {
    const lock = lockSchema.parse(JSON.parse(readFileSync(archive, 'utf8')));
    assert.deepEqual(lock.versions, { server: '0.5.0', typescript: '0.2.0', rust: '0.1.3' });
    assert.equal(lock.ref, 'v0.5.0');
    const files = requiredFiles(lock.pages);
    assert.ok(files.includes('Cargo.toml'));
    assert.deepEqual(requiredFiles(lock.pages), files);
    assert.ok(
      requiredFiles([
        ...DOC_PAGES,
        { id: 'future', group: 'start', source: 'docs/future.md' },
      ]).includes('docs/future.md'),
    );
    assert.ok(!files.includes('docs/future.md'));
    assert.throws(() =>
      lockSchema.parse({ ...lock, pages: [{ ...lock.pages[0], source: '../outside.md' }] }),
    );
    assert.throws(() => lockSchema.parse({ ...lock, pages: [lock.pages[0], lock.pages[0]] }));
  });

  it('refuses an alternate ref before changing an archive or fetching a source', () => {
    const before = readFileSync(archive);
    const result = spawnSync(
      process.execPath,
      ['scripts/sync-docs.ts', '--version', 'v0.5.0', '--ref', 'main'],
      { cwd: root, encoding: 'utf8' },
    );
    assert.equal(result.status, 1);
    assert.match(result.stderr, /requires ref v0.5.0/);
    assert.deepEqual(readFileSync(archive), before);
  });

  it('checks every committed snapshot offline', () => {
    assert.match(
      execFileSync(process.execPath, ['scripts/sync-docs.ts', '--check'], {
        cwd: root,
        encoding: 'utf8',
      }),
      /matches Nelcota/,
    );
  });
});
