import UploadAndView from "./components/UploadAndView";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
        <h1 className="text-lg font-semibold tracking-tight">3D Platform</h1>
        <nav className="flex gap-4 text-sm text-zinc-400">
          <a href="#" className="hover:text-white transition-colors">탐색</a>
          <a href="#" className="hover:text-white transition-colors">내 모델</a>
        </nav>
      </header>

      <UploadAndView />
    </main>
  );
}
