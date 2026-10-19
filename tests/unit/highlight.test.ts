import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { splitSqlHeredoc } from '../../src/lib/highlight.ts';

describe('splitSqlHeredoc', () => {
  it('splits a SQL heredoc into the shell before, the SQL body and the shell after', () => {
    const code =
      "mkdir -p migrations\ncat > m.sql <<'SQL'\nCREATE TABLE t ();\nSQL\nnelcota migrate";

    const parts = splitSqlHeredoc(code);

    assert.deepEqual(parts, {
      before: "mkdir -p migrations\ncat > m.sql <<'SQL'",
      body: 'CREATE TABLE t ();',
      after: 'SQL\nnelcota migrate',
    });
  });

  it('keeps the line count, so line numbers and copy stay intact', () => {
    const code = "cat > m.sql <<'SQL'\nSELECT 1;\nSELECT 2;\nSQL";

    const parts = splitSqlHeredoc(code);

    assert.ok(parts != null);
    const lines = [parts.before, parts.body, parts.after].join('\n').split('\n');
    assert.equal(lines.length, code.split('\n').length);
  });

  it('returns null when there is no SQL heredoc', () => {
    assert.equal(splitSqlHeredoc('curl -fsS http://127.0.0.1:8000'), null);
    assert.equal(splitSqlHeredoc("cat <<'EOF'\nx\nEOF"), null);
  });
});
