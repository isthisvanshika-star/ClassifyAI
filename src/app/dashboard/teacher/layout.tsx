import Sidebar from "@/components/teacher/Sidebar";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <div className=" mt-50">
      <Sidebar />
      </div>
       <div className="flex flex-col items-center 2xl:-ml-[5rem] justify-center flex-1">
        <main className="w-[90rem] z-0  h-[50rem] overflow-y-hidden bg-white/5 rounded-lg backdrop-blur-xl border border-white/10 p-1 flex flex-col shadow-lg">{children}</main>
      </div>
    </div>
  );
}
