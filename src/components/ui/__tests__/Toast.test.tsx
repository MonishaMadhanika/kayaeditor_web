import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ToastProvider, useToast } from '../../ui/Toast';

const Trigger: React.FC = () => {
  const { notify } = useToast();
  return (
    <button onClick={() => notify('Saved!', 'success', 0)}>Show</button>
  );
};

describe('ToastProvider', () => {
  it('shows toast when notify is called', () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: /show/i }));
    expect(screen.getByText('Saved!')).toBeInTheDocument();
  });
});


