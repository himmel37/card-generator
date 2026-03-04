import PlaceCard from "./components/PlaceCard";

export default function Page() {
  return (
    // min-h-dvh: 모바일 브라우저 주소창을 제외한 실제 높이에 맞춤
    // p-0: 모바일에서 좌우 여백을 없애서 꽉 차게 만듦 (필요시 p-2 정도로 조정)
    <main className="min-h-dvh bg-neutral-950 flex items-center justify-center p-0 sm:p-6">
      {/* w-full: 기본적으로 가로를 꽉 채움
        max-w-[450px]: 하지만 너무 커지는 건 방지 (데스크탑/태블릿 대응)
      */}
      <div className="w-full max-w-[450px] animate-in fade-in zoom-in duration-500">
        <PlaceCard />
      </div>
    </main>
  );
}
