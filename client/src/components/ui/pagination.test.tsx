import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Pagination } from './pagination';

describe('Pagination', () => {
  it('renders nothing for a single page', () => {
    const { container } = render(<Pagination page={1} totalPages={1} onPageChange={vi.fn()} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('shows all pages when there are only a few', () => {
    render(<Pagination page={2} totalPages={4} onPageChange={vi.fn()} />);

    expect(screen.getByRole('navigation')).toHaveTextContent('1234');
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page');
  });

  it('collapses distant pages into ellipses', () => {
    render(<Pagination page={5} totalPages={10} onPageChange={vi.fn()} />);

    expect(screen.getByRole('navigation')).toHaveTextContent('1…456…10');
  });

  it('disables "previous" on the first page and navigates on click', async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={1} totalPages={10} onPageChange={onPageChange} />);

    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await userEvent.click(screen.getByRole('button', { name: '10' }));

    expect(onPageChange.mock.calls).toEqual([[2], [10]]);
  });
});
