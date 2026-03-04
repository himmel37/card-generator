"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import {
  Bookmark,
  Share2,
  X,
  CornerUpRight,
  Navigation2,
  Share,
  Star,
} from "lucide-react";

type EditField = "title" | "category" | "subtitle" | null;

export default function PlaceCard() {
  const [data, setData] = useState({
    imageUrl:
      "https://ojsfile.ohmynews.com/STD_IMG_FILE/2012/0810/IE001475335_STD.JPG",
    title: "내 이름은 김삼순",
    category: "드라마 김삼순",
    subtitle: "돈 주면 다 합니다",
    rating: 5.0,
    reviewCount: 9999,
  });

  const [editing, setEditing] = useState<EditField>(null);
  const [editingReview, setEditingReview] = useState(false);
  const [draft, setDraft] = useState("");
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  function startEdit(field: EditField) {
    if (!field) return;
    setEditing(field);
    setDraft(data[field] ?? "");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function commit() {
    if (!editing) return;

    const value = draft.trim();

    setData((prev) => ({
      ...prev,
      [editing]: value || undefined,
    }));

    setEditing(null);
  }

  function handleFile(file: File | null) {
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setData((prev) => ({
        ...prev,
        imageUrl: reader.result as string,
      }));
    };

    reader.readAsDataURL(file);
  }

  async function handleDownload() {
    if (!cardRef.current || !isImageLoaded) {
      alert("이미지가 아직 로딩 중입니다!");
      return;
    }

    try {
      // 💡 캡처 전 아주 짧은 대기 시간을 주어 렌더링을 안정화합니다.
      await new Promise((r) => setTimeout(r, 300));

      // cacheBust를 true로 설정하여 이미지 캐시 문제를 방지합니다.
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2, // 모바일 화질 보정
        skipFonts: true, // 폰트 로딩 문제로 인한 깨짐 방지
        includeQueryParams: true,
        backgroundColor: "#ffffff", // 배경색 명시 (검은 화면 방지)
        ...({
          useCORS: true,
        } as any),
      });

      // 만약 dataUrl이 너무 짧다면(캡처 실패) 에러 처리
      if (dataUrl.length < 1000) throw new Error("이미지 생성 실패");

      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], "card.png", { type: "image/png" });

      if (
        typeof navigator !== "undefined" &&
        navigator.share &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: "카드 저장",
        });
        return;
      }

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "card.png";
      link.click();
    } catch (err) {
      console.error("저장 중 오류 발생:", err);
      alert("이미지 저장에 실패했습니다.");
    }
  }

  // 별점 수정 함수
  const handleRating = (rate: number) => {
    setData((prev) => ({ ...prev, rating: rate }));
  };

  // 리뷰 수 수정 함수
  const handleReviewChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value.replace(/[^0-9]/g, ""));
    if (isNaN(val)) val = 0;
    if (val > 9999) val = 9999;
    setData((prev) => ({ ...prev, reviewCount: val }));
  };

  return (
    <div ref={cardRef} className="rounded-3xl overflow-hidden bg-white">
      <div className="relative w-full bg-black rounded-3xl overflow-hidden shadow-2xl">
        {/* 📷 이미지 영역 */}
        <div className="relative aspect-[390/500] group">
          <img
            src={data.imageUrl}
            alt=""
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
            onLoad={() => setIsImageLoaded(true)} // 이미지 로딩 완료 확인
            // 이미지 소스가 바뀔 때마다 상태 초기화
            key={data.imageUrl}
          />

          {/* hover overlay */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <span className="bg-black/60 text-white text-sm px-4 py-2 rounded-full">
              사진 변경
            </span>
          </div>

          <button
            onClick={() => fileRef.current?.click()}
            className="absolute inset-0"
          />

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
        </div>

        {/* 🧾 카드 영역 */}
        <div className="bg-white text-neutral-900 rounded-t-3xl -mt-16 relative z-10 p-6">
          <div className="flex justify-between items-center">
            {/* 제목 */}
            {editing === "title" ? (
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commit();
                  if (e.key === "Escape") setEditing(null);
                }}
                className="w-full text-lg font-semibold outline-none border-b"
              />
            ) : (
              <h1
                onClick={() => startEdit("title")}
                className="text-lg font-semibold cursor-text"
              >
                {data.title}
              </h1>
            )}
            <div className="flex items-center gap-3">
              <CircleIconButton label="북마크" onClick={handleDownload}>
                <Bookmark size={18} />
              </CircleIconButton>
              <CircleIconButton label="공유" onClick={handleDownload}>
                <Share2 size={18} />
              </CircleIconButton>
              <CircleIconButton label="삭제" onClick={() => {}}>
                <X size={18} />
              </CircleIconButton>
            </div>
          </div>
          {/* ⭐ 별점 + 리뷰 수정 */}
          <div className="flex items-center gap-2 mt-2">
            <div className="flex gap-0.5">
              <Stars
                rating={data.rating}
                onRate={(num) => setData((prev) => ({ ...prev, rating: num }))}
              />
            </div>
            <span className="text-sm font-bold text-neutral-800">
              {data.rating.toFixed(1)}
            </span>

            {editingReview ? (
              <input
                autoFocus
                type="number"
                className="w-16 text-sm border-b border-teal-500 outline-none"
                value={data.reviewCount}
                onChange={handleReviewChange}
                onBlur={() => setEditingReview(false)}
              />
            ) : (
              <span
                onClick={() => setEditingReview(true)}
                className="text-sm text-neutral-400 cursor-pointer"
              >
                (리뷰 {data.reviewCount})
              </span>
            )}
          </div>
          {/* 카테고리 */}
          <div className="mt-1">
            {editing === "category" ? (
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commit();
                  if (e.key === "Escape") setEditing(null);
                }}
                className="w-full text-sm outline-none border-b"
                placeholder="카테고리 입력"
              />
            ) : data.category ? (
              <p
                onClick={() => startEdit("category")}
                className="text-sm text-neutral-600 cursor-text"
              >
                {data.category}
              </p>
            ) : (
              <button
                onClick={() => startEdit("category")}
                className="text-sm text-neutral-400 italic"
              >
                카테고리 추가
              </button>
            )}
          </div>

          {/* 서브타이틀 */}
          <div className="mt-1">
            {editing === "subtitle" ? (
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commit();
                  if (e.key === "Escape") setEditing(null);
                }}
                className="w-full text-sm outline-none border-b"
                placeholder="서브타이틀 입력"
              />
            ) : data.subtitle ? (
              <p
                onClick={() => startEdit("subtitle")}
                className="text-sm text-neutral-500 cursor-text"
              >
                {data.subtitle}
              </p>
            ) : (
              <button
                onClick={() => startEdit("subtitle")}
                className="text-sm text-neutral-400 italic"
              >
                서브타이틀 추가
              </button>
            )}
          </div>
          {/* 🔘 액션 버튼들 */}
          <div className="mt-2 grid grid-cols-4 gap-2">
            <ActionButton
              label="경로"
              Icon={CornerUpRight}
              variant="darkGreen"
            />
            <ActionButton label="시작" Icon={Navigation2} variant="skyBlue" />
            <ActionButton
              label="저장"
              Icon={Bookmark}
              variant="skyBlue"
              onClick={handleDownload}
            />
            <ActionButton
              label="공유"
              Icon={Share}
              variant="skyBlue"
              onClick={handleDownload}
            />
          </div>
        </div>
      </div>
    </div>
  );

  function Stars({
    rating,
    onRate,
  }: {
    rating: number;
    onRate: (n: number) => void;
  }) {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((num) => (
          <Star
            key={num}
            size={18} // 여기서 size를 줍니다.
            onClick={() => onRate(num)} // 여기서 클릭 이벤트를 처리합니다.
            className={`cursor-pointer transition-colors ${
              num <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-neutral-200"
            }`}
          />
        ))}
      </div>
    );
  }

  function ActionButton({
    label,
    Icon,
    variant,
    onClick,
  }: {
    label: string;
    Icon: React.ComponentType<{ size?: number; className?: string }>;
    variant: "darkGreen" | "skyBlue";
    onClick?: () => void;
  }) {
    const base =
      "flex items-center justify-center w-full rounded-2xl transition active:scale-[0.97] p-2 gap-1";

    const styles = {
      darkGreen: "bg-teal-700 text-white",
      skyBlue: "bg-sky-100 text-sky-700",
    };

    return (
      <button
        type="button"
        onClick={onClick}
        className={`${base} ${styles[variant]}`}
      >
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
        <span className="text-[10px] sm:text-xs md:text-sm whitespace-nowrap">
          {label}
        </span>
      </button>
    );
  }

  function CircleIconButton({
    label,
    onClick,
    children,
  }: {
    label: string;
    onClick?: () => void;
    children: React.ReactNode;
  }) {
    return (
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className="flex items-center justify-center gap-2 rounded-full 
          px-2 py-2 text-sm font-medium
          active:scale-[0.97] transition bg-gray-200 text-gray-700"
      >
        {children}
      </button>
    );
  }
}
