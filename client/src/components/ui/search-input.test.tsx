import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchInput } from './search-input';

const PLACEHOLDER = 'Search books';
const DEBOUNCE_MS = 400;

describe('SearchInput', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const setup = (value = '') => {
    const onSearch = vi.fn();
    const view = render(
      <SearchInput value={value} onSearch={onSearch} placeholder={PLACEHOLDER} />,
    );
    const input = () => screen.getByRole<HTMLInputElement>('searchbox');
    const type = (text: string) => fireEvent.change(input(), { target: { value: text } });
    const rerender = (nextValue: string) =>
      view.rerender(
        <SearchInput value={nextValue} onSearch={onSearch} placeholder={PLACEHOLDER} />,
      );
    return { onSearch, input, type, rerender };
  };

  it('reports the trimmed value once the user stops typing', () => {
    const { onSearch, type } = setup();

    type(' du');
    type(' dune ');
    expect(onSearch).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(DEBOUNCE_MS));

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('dune');
  });

  it('follows the value when it changes from outside, e.g. browser navigation', () => {
    const { input, rerender } = setup('dune');

    rerender('');
    expect(input()).toHaveValue('');

    rerender('kobzar');
    expect(input()).toHaveValue('kobzar');
  });

  it('keeps what the user is typing when its own search comes back as the value', () => {
    const { onSearch, input, type, rerender } = setup();

    type('dun');
    act(() => vi.advanceTimersByTime(DEBOUNCE_MS));
    type('dune');
    rerender(onSearch.mock.calls[0][0]);

    expect(input()).toHaveValue('dune');
  });

  it('restores an earlier search when navigating back to it', () => {
    const { onSearch, input, type, rerender } = setup();

    type('dune');
    act(() => vi.advanceTimersByTime(DEBOUNCE_MS));
    rerender(onSearch.mock.calls[0][0]);
    rerender('');
    rerender('dune');

    expect(input()).toHaveValue('dune');
  });
});
