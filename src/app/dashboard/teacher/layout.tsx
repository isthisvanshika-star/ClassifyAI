import Sidebar from "@/components/teacher/Sidebar";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-transparent  text-white">
      
      {/* ✅ SIDEBAR */}
      <div className="relative mt-60">
        <Sidebar />

        {/* Logo */}
        <img
          src="/logo-nobg.png"
          className="absolute bottom-5 left-6 w-32 opacity-80"
          alt="Logo"
        />
      </div>

      {/* ✅ MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto">
        
        {/* Container */}
        <div className="p-6 max-w-[1600px] mx-auto">
          
          {/* Glass Wrapper */}
          <main className="w-full min-h-[calc(100vh-3rem)] bg-white/5 rounded-2xl backdrop-blur-xl border border-white/10 p-6 shadow-lg">
            {children}
          </main>

        </div>
      </div>
    </div>
  );
}