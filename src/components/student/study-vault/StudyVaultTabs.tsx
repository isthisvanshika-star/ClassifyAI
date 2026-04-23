"use client";

export default function StudyVaultTabs({
  TABS,
  activeTab,
  setActiveTab,
}: any) {
  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {TABS.map((tab: any) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
            activeTab === tab.id
              ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-[0_0_25px_rgba(6,182,212,0.5)] scale-105"
              : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}