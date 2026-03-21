export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <h1 className="text-lg font-semibold tracking-tight">3D Platform</h1>
        <nav className="flex gap-4 text-sm text-zinc-400">
          <a href="#" className="hover:text-white transition-colors">탐색</a>
          <a href="#" className="hover:text-white transition-colors">내 모델</a>
        </nav>
      </header>

      {/* Hero + Upload */}
      <section className="flex flex-col items-center justify-center flex-1 px-6 py-24 gap-8">
        <div className="text-center max-w-xl">
          <h2 className="text-4xl font-bold tracking-tight mb-3">
            3D 모델을 업로드하고<br />바로 공유하세요
          </h2>
          <p className="text-zinc-400 text-lg">
            GLB, OBJ, FBX 파일을 드래그하면 뷰어와 AR 링크가 생성됩니다
          </p>
        </div>

        {/* Drop Zone */}
        <div className="w-full max-w-lg border-2 border-dashed border-zinc-700 rounded-2xl p-16 flex flex-col items-center gap-4 hover:border-zinc-500 transition-colors cursor-pointer">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-3xl">
            ⬆
          </div>
          <div className="text-center">
            <p className="font-medium text-zinc-200">파일을 드래그하거나 클릭해서 업로드</p>
            <p className="text-sm text-zinc-500 mt-1">GLB · OBJ · FBX · STL · USDZ 지원</p>
          </div>
        </div>

        <p className="text-xs text-zinc-600">최대 파일 크기 100MB · 무료 공개</p>
      </section>
    </main>
  );
}
