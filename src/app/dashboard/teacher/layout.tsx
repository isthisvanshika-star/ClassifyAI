import Sidebar from "@/components/teacher/Sidebar";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <div className=" mt-52">
      <img src="/logo-nobg.png" className="2xl:ml-5 2xl:top-[63rem] 2xl:-left-[0rem] absolute 2xl:mb-5 2xl:w-40 2xl:h-11" alt="Background Image"/>
      <Sidebar />
      </div>
       <div className="flex flex-col items-center 2xl:-ml-[5rem] justify-center flex-1">
        <main className="w-[90rem] z-0  h-[55rem]  bg-white/5 rounded-lg backdrop-blur-xl border border-white/10 p-1 flex flex-col shadow-lg">{children}</main>
      </div>
    </div>
  );
}
