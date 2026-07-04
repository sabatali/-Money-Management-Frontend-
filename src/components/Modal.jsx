import Button from './Button'

const Modal = ({ isOpen, title, description, onClose, children, actions }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-app-overlay px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-app-border-strong bg-app-surface p-6 shadow-xl shadow-black/40">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-app-text">{title}</h3>
            {description ? (
              <p className="mt-1 text-sm text-app-muted">{description}</p>
            ) : null}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="mt-5">{children}</div>
        {actions ? <div className="mt-6 flex gap-3">{actions}</div> : null}
      </div>
    </div>
  )
}

export default Modal
