// src/lib/__tests__/debounce.test.ts

import { debounce } from '../debounce';

describe('Debounce Utility', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('should delay function execution', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 300);

    debouncedFn();
    expect(mockFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(300);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test('should cancel previous calls when called multiple times', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 300);

    debouncedFn();
    debouncedFn();
    debouncedFn();

    jest.advanceTimersByTime(300);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test('should pass arguments to the debounced function', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 300);

    debouncedFn('test', 123, { key: 'value' });

    jest.advanceTimersByTime(300);
    expect(mockFn).toHaveBeenCalledWith('test', 123, { key: 'value' });
  });

  test('should use the latest arguments when called multiple times', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 300);

    debouncedFn('first');
    debouncedFn('second');
    debouncedFn('third');

    jest.advanceTimersByTime(300);
    expect(mockFn).toHaveBeenCalledWith('third');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test('should work with default delay', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn); // Default delay should be applied

    debouncedFn();
    expect(mockFn).not.toHaveBeenCalled();

    // Advance by a reasonable default (usually 250-500ms)
    jest.advanceTimersByTime(500);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test('should handle zero delay', () => {
    const mockFn = jest.fn();
    const debouncedFn = debounce(mockFn, 0);

    debouncedFn();

    jest.advanceTimersByTime(0);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  test('should maintain this context', () => {
    const obj = {
      value: 42,
      method: jest.fn(function (this: any) {
        return this.value;
      }),
    };

    const debouncedMethod = debounce(obj.method.bind(obj), 300);
    debouncedMethod();

    jest.advanceTimersByTime(300);
    expect(obj.method).toHaveBeenCalled();
  });

  test('should handle multiple concurrent debounced functions', () => {
    const mockFn1 = jest.fn();
    const mockFn2 = jest.fn();
    const debouncedFn1 = debounce(mockFn1, 200);
    const debouncedFn2 = debounce(mockFn2, 400);

    debouncedFn1();
    debouncedFn2();

    jest.advanceTimersByTime(200);
    expect(mockFn1).toHaveBeenCalledTimes(1);
    expect(mockFn2).not.toHaveBeenCalled();

    jest.advanceTimersByTime(200); // Total 400ms
    expect(mockFn2).toHaveBeenCalledTimes(1);
  });

  test('should work with async functions', () => {
    const mockAsyncFn = jest.fn().mockResolvedValue('result');
    const debouncedFn = debounce(mockAsyncFn, 300);

    debouncedFn();

    jest.advanceTimersByTime(300);
    expect(mockAsyncFn).toHaveBeenCalledTimes(1);
  });
});
