import { sanitizeSensitiveData } from '../../../../src/shared/logger/sanitize-sensitive-data';

describe('sanitizeSensitiveData', () => {
  it('returns primitives unchanged', () => {
    expect(sanitizeSensitiveData(null)).toBeNull();
    expect(sanitizeSensitiveData(undefined)).toBeUndefined();
    expect(sanitizeSensitiveData(123)).toBe(123);
    expect(sanitizeSensitiveData('str')).toBe('str');
  });

  it('sanitizes sensitive keys in objects and arrays', () => {
    const input = {
      password: 'secret',
      nested: {
        apiKey: 'key',
        list: [{ secretToken: 't' }, { ok: 'v' }]
      },
      arr: ['a', { creditCardNumber: '4111' }]
    };

    const out = sanitizeSensitiveData(input);
    expect(out.password).toBe('***');
    expect(out.nested.apiKey).toBe('***');
    expect(out.nested.list[0].secretToken).toBe('***');
    expect(out.nested.list[1].ok).toBe('v');
    expect(out.arr[1].creditCardNumber).toBe('***');
  });

  it('handles top-level array input', () => {
    const arr = [{ password: 'p1' }, { token: 't1' }];
    const out = sanitizeSensitiveData(arr as any);
    expect(Array.isArray(out)).toBe(true);
    expect(out[0].password).toBe('***');
    expect(out[1].token).toBe('***');
  });

  it('skips inherited properties (hasOwnProperty branch)', () => {
    const proto: any = { inheritedSecret: 'i' };
    const obj = Object.create(proto);
    obj.ownField = 'v';

    const out = sanitizeSensitiveData(obj as any);
    // ownField should be present and unchanged (not sensitive)
    expect(out.ownField).toBe('v');
    // inheritedSecret should not be copied into sanitized (since it's inherited)
    expect(out.inheritedSecret).toBeUndefined();
  });
});
