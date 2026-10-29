import merge from 'deepmerge';
import { mergeConfig } from 'jest-config';

function poisonedInput() {
  return JSON.parse('{"__proto__":{"injectedFlag":true}}');
}

function expectSafePrototype(value: unknown) {
  expect(Object.getPrototypeOf(value)).toBe(Object.prototype);
  expect(value).not.toHaveProperty('injectedFlag');
  expect(Object.hasOwn(value as object, '__proto__')).toBe(false);
  expect({}).not.toHaveProperty('injectedFlag');
}

describe('Jest deepmerge dependency security and compatibility', () => {
  it.each([
    null,
    undefined,
    0,
    false,
    'placeholder',
  ])('does not poison the returned prototype through a %s placeholder', (placeholder) => {
    const result = merge({ settings: placeholder }, { settings: poisonedInput() });
    expectSafePrototype(result.settings);
  });

  it('rejects prototype keys from null-prototype sources and targets', () => {
    expectSafePrototype(merge(Object.create(null), poisonedInput()));
    const source = Object.assign(Object.create(null), poisonedInput());
    expectSafePrototype(merge(Object.create(null), source));
  });

  it('rejects an own prototype key when copying the target', () => {
    expectSafePrototype(merge(poisonedInput(), {}));
    expectSafePrototype(merge({ nested: poisonedInput() }, {}).nested);
  });

  it('skips forbidden keys before reading their values in either argument', () => {
    const dangerous = Object.defineProperty({}, '__proto__', {
      enumerable: true,
      get() {
        throw new Error('Forbidden value must not be read');
      },
    });
    expectSafePrototype(merge(dangerous, {}));
    expectSafePrototype(merge(Object.create(null), dangerous));
  });

  it('does not mutate the global prototype through constructor/prototype data', () => {
    const source = JSON.parse('{"constructor":{"prototype":{"injectedFlag":true}}}');
    expectSafePrototype(merge(Object.create(null), source));
  });

  it('protects the actual Jest configuration merge entry point', () => {
    const result = mergeConfig(
      { globals: { settings: null } },
      { globals: { settings: poisonedInput() } },
    );
    expectSafePrototype(result.globals?.settings);
  });

  it('preserves Jest nested overrides, concatenated arrays and input immutability', () => {
    const defaults = { globals: { service: { enabled: true, ports: [80] } } };
    const overrides = { globals: { service: { timeout: 20, ports: [443] } } };
    const expected = {
      globals: { service: { enabled: true, timeout: 20, ports: [80, 443] } },
    };
    expect(mergeConfig(defaults, overrides)).toEqual(expected);
    expect(merge.all([defaults, overrides])).toEqual(expected);
    expect(merge(defaults.globals, overrides.globals)).toEqual(expected.globals);
    expect(defaults.globals.service.ports).toEqual([80]);
    expect(overrides.globals.service.ports).toEqual([443]);
  });

  it('preserves atomic configuration values and enumerable symbols', () => {
    const date = new Date('2026-01-01T00:00:00Z');
    const regex = /test/i;
    const callback = () => true;
    const key = Symbol('configuration');
    const result = merge({ date, regex, callback, [key]: { enabled: true } }, {});
    expect(result.date).toBe(date);
    expect(result.regex).toBe(regex);
    expect(result.callback).toBe(callback);
    expect(result[key]).toEqual({ enabled: true });
  });
});
