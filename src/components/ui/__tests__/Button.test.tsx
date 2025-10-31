import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from '../../ui/Button';

describe('Button', () => {
  it('renders label and handles click', () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    const btn = screen.getByRole('button', { name: /click me/i });
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalled();
  });

  it('applies variant and size classes', () => {
    render(<Button variant="secondary" size="sm">Small</Button>);
    const btn = screen.getByRole('button', { name: /small/i });
    expect(btn.className).toMatch(/secondary|border/);
  });
});


