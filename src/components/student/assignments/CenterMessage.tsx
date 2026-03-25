const CenterMessage = ({ text }: { text: string }) => {
  return (
    <div className="flex justify-center items-center h-[80vh]">
      <p className="text-red-400 bg-red-500/10 px-6 py-3 rounded-xl border border-red-500/30">
        {text}
      </p>
    </div>
  );
};

export default CenterMessage;