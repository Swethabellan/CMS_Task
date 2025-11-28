"use client"

import { useEffect } from "react"

interface DeleteConfirmProps {
  title?: string
  message?: string
  itemName?: string
  onConfirm: () => void
  onCancel?: () => void
}

export function DeleteConfirm({ title, message, itemName, onConfirm, onCancel }: DeleteConfirmProps) {
  // Support both patterns: title/message or itemName
  const modalTitle = title || "Delete Item"
  const modalMessage = message || (itemName ? `Are you sure you want to delete ${itemName}?` : "Are you sure you want to delete this item?")
  
  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
  }
  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [])

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on the overlay, not the modal content
    if (e.target === e.currentTarget) {
      handleCancel()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleCancel()
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-foreground mb-2">{modalTitle}</h2>
        <p className="text-gray-600 mb-6">{modalMessage}</p>

        <div className="flex gap-3">
          {onCancel && (
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`${onCancel ? 'flex-1' : 'w-full'} px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors`}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
