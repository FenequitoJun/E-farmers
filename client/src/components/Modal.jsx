import React from 'react';

export const Modal = ({ isOpen, title, children, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        {title && <h3>{title}</h3>}
        {children}
      </div>
    </div>
  );
};

export default Modal;
