import { ReactNode } from "react"

interface ModalProps {
  children: ReactNode
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const Modal = ({ children, isOpen, setIsOpen }: ModalProps) => {
  if (!isOpen) return null

  return (
    <div
      onClick={() => setIsOpen(false)}
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{
        backgroundColor: "rgba(115, 115, 115, 0.5)",
      }}
    >
      {children}
    </div>
  )
}

export default Modal
