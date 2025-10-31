import React from 'react';

interface ModalProps {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ open, title, onClose, children, footer }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 w-[90%] max-w-md rounded-xl shadow-xl border border-ocean-100 dark:border-gray-700 transform transition-all duration-200 ease-out scale-95 opacity-0 animate-[modal_200ms_ease-out_forwards]">
        {title && (
          <div className="px-4 py-3 border-b border-ocean-100 dark:border-gray-700 text-ocean-800 dark:text-white font-semibold">
            {title}
          </div>
        )}
        <div className="p-4 text-sm text-gray-700 dark:text-gray-200">{children}</div>
        {footer && <div className="px-4 py-3 border-t border-ocean-100 dark:border-gray-700 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;

// inject keyframes
const style = document.createElement('style');
style.innerHTML = `@keyframes modal{to{opacity:1;transform:scale(1)}}`;
if (typeof document !== 'undefined' && !document.getElementById('modal-anim')) {
  style.id = 'modal-anim';
  document.head.appendChild(style);
}


