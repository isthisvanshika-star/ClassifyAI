export default function ModalFooter({
  onClose,
  handleSave,
  handleSaveAndNext,
  isLoading,
  isNextLoading,
  hasNext,
}: any) {
  return (
    <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-white/10">
      <button
        onClick={onClose}
        className="py-2.5 px-4 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition"
      >
        Close
      </button>

      <button
        onClick={handleSave}
        disabled={isLoading || isNextLoading}
        className="py-2.5 px-5 bg-cyan-500/20 border border-cyan-400/40 
        hover:bg-cyan-400/30 text-cyan-300 rounded-xl transition-all"
      >
        {isLoading ? "Saving..." : "Save"}
      </button>

      {hasNext && (
        <button
          onClick={handleSaveAndNext}
          disabled={isLoading || isNextLoading}
          className="py-2.5 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 
          text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] 
          hover:scale-105 rounded-xl transition-all flex items-center gap-2"
        >
          {isNextLoading ? "Saving..." : "Save & Next"}
        </button>
      )}
    </div>
  );
}
