import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import useModal from '../../hooks/useModal';

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const centerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
};

const drawerVariants = {
  hidden: { x: '100%' },
  visible: { x: 0, transition: { type: 'spring', damping: 25, stiffness: 200 } },
  exit: { x: '100%', transition: { duration: 0.2 } },
};

function ModalBase({ isOpen, onClose, variant = 'center', maxWidth = 'max-w-lg', rounded = 'rounded-3xl', closeOnOverlay = true, children }) {
  const modalRef = useModal(isOpen, onClose);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          className={`fixed inset-0 z-50 ${variant === 'drawer' ? 'flex items-center justify-start' : 'flex items-center justify-center p-4'}`}
        >
          <motion.div
            key="modal-backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={closeOnOverlay ? onClose : undefined}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {variant === 'drawer' ? (
            <motion.div
              key="modal-panel"
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`relative bg-white dark:bg-dark-700 w-full ${maxWidth} h-full shadow-2xl z-10 overflow-hidden flex flex-col border-l border-gold-200/50 dark:border-dark-600`}
            >
              {children}
            </motion.div>
          ) : (
            <motion.div
              key="modal-panel"
              variants={centerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`relative bg-white dark:bg-dark-800 w-full ${maxWidth} ${rounded} shadow-2xl z-10 overflow-hidden border border-gold-200/50 dark:border-dark-600 max-h-[90vh] flex flex-col`}
            >
              {children}
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

function Header({ title, subtitle, onClose }) {
  return (
    <div className="p-5 sm:p-6 border-b border-gold-100 dark:border-dark-700 flex items-center justify-between bg-cream-50/50 dark:bg-dark-900/30 shrink-0">
      <div className="min-w-0">
        <h2 className="text-lg font-black text-text-primary dark:text-cream-50 truncate">{title}</h2>
        {subtitle && (
          <p className="text-[9px] text-gold-600 dark:text-gold-400 font-bold uppercase tracking-widest mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="w-10 h-10 flex items-center justify-center hover:bg-gold-50 dark:hover:bg-dark-700 rounded-xl transition-all text-text-muted dark:text-gold-400 shrink-0"
      >
        <X size={20} />
      </button>
    </div>
  );
}

function Body({ children, className = '' }) {
  return (
    <div className={`flex-1 overflow-y-auto p-5 sm:p-6 ${className}`}>
      {children}
    </div>
  );
}

function Footer({ children, className = '' }) {
  return (
    <div className={`p-5 sm:p-6 border-t border-gold-100 dark:border-dark-700 shrink-0 ${className}`}>
      {children}
    </div>
  );
}

ModalBase.Header = Header;
ModalBase.Body = Body;
ModalBase.Footer = Footer;

export { ModalBase };
export default ModalBase;
