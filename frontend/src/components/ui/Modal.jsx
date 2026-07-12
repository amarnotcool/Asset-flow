import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 animate-in fade-in duration-200" onClick={onClose}>
      <div className="w-[90%] max-w-[500px] max-h-[90vh] overflow-y-auto bg-bg-secondary rounded-xl shadow-lg border border-border-color p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button className="bg-transparent border-0 p-2 cursor-pointer rounded transition-colors duration-200 hover:bg-bg-primary" onClick={onClose}><X size={20} /></button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
