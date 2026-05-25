const ConfirmDialog = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl p-5 w-80 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-semibold text-[#1f2937]">
          {title || "Confirm Action"}
        </h3>

        <p className="text-sm text-[#6b7280] mt-2">
          {message || "Are you sure?"}
        </p>

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onCancel}
            className="px-3 py-1 border rounded-lg text-sm hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;