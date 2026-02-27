import PlaceCard from "./components/PlaceCard";

export default function Page() {
  // 일단은 mock 데이터 (나중에 API로 교체)
  const place = {
    name: "내 이름은 김삼순",
    rating: 5.0,
    reviewCount: 9999,
    category: "드라마 김삼순",
    status: "영업 중",
    subtitle: "돈주면 다 합니다.",
    imageUrl:
      "https://photo.newsen.com/news_photo/2024/04/09/202404091114263510_1.jpg",
  };
  return (
    <main className="min-h-dvh bg-neutral-950 flex justify-center">
      {/* 모바일 프레임 느낌 (원하면 제거 가능) */}
      <div className="w-full max-w-[430px] min-h-dvh flex flex-col">
        {/* 상단 이미지 영역: 화면 남는 만큼 먹기 */}
        <div className="relative flex-1 overflow-hidden">
          <img
            src={place.imageUrl}
            alt={place.name}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
        </div>

        {/* 하단 카드 영역: 실제로 아래 공간 차지 + 위로 살짝 겹치기 */}
        <div className="-mt-20">
          <div className="rounded-3xl bg-white shadow-2xl -mt-20 relative z-10">
            <PlaceCard place={place} />
          </div>
        </div>
      </div>
    </main>
  );
}
