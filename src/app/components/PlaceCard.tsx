type Place = {
  name: string;
  rating: number;
  reviewCount: number;
  category: string;
  status: string;
  subtitle: string;
};
export default function PlaceCard({ place }: { place: Place }) {
  return (
    <section
      className="bg-white text-black
    rounded-t-3xl
    p-5 shadow-xl"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold text-black">{place.name}</h1>
        <div className="">
          <RoundButton label="북"></RoundButton>
          <RoundButton label="공"></RoundButton>
          <RoundButton label="삭"></RoundButton>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
        <span className="font-semibold">{place.rating.toFixed(1)}</span>
        <Stars />
        <span className="text-gray-500">
          ({place.reviewCount.toLocaleString()})
        </span>
      </div>
      <div className="mt-1 text-sm text-gray-600">{place.category}</div>
      <div className="mt-3 flex items-center gap-2 text-sm">
        <span className="font-semibold text-blue-600">{place.status}</span>
        <span className="text-gray-700">{place.subtitle}</span>
      </div>
      <div className="mt-5 grid grid-cols-4 gap-3">
        <ActionButton label="경로" /> <ActionButton label="주문" />
        <ActionButton label="통화" /> <ActionButton label="저장됨" />
      </div>
    </section>
  );
}
function Stars() {
  // 일단은 “별 5개 고정” (나중에 rating 기반으로 바꿔도 됨)
  return (
    <div className="flex gap-0.5" aria-label="rating stars">
      {"★★★★★".split("").map((s, i) => (
        <span key={i} className="text-yellow-500">
          {s}
        </span>
      ))}
    </div>
  );
}
function ActionButton({ label }: { label: string }) {
  return (
    <button
      className="rounded-full bg-slate-100 px-3 py-3 text-sm font-medium text-slate-800 active:scale-[0.98]"
      type="button"
    >
      {label}
    </button>
  );
}
function RoundButton({ label }: { label: string }) {
  return (
    <button className="rounded-full bg-slate-100 w-8 h-8 m-0.5" type="button">
      {label}
    </button>
  );
}
