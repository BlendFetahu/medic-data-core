// client/src/components/common/ConfirmModal.jsx
export default function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow">
        <h4 className="text-lg font-semibold mb-2">{title}</h4>
        <p className="text-gray-700 mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <button className="px-4 py-2 rounded-lg border" onClick={onCancel}>
            Cancel
          </button>
          <button className="px-4 py-2 rounded-lg bg-red-600 text-white" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
