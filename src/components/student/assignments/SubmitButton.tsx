const SubmitButton = ({ hasSubmitted, onClick }: any) => {
  if (hasSubmitted) return null;

  return (
    <div className="mt-8 flex justify-end">
      <button
        onClick={onClick}
        className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-3 px-8 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all transform hover:scale-105"
      >
        Prepare Submission
      </button>
    </div>
  );
};

export default SubmitButton;