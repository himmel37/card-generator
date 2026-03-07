"use client";

import { useRef, useState, useEffect } from "react";
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
    imageUrl: "/samsoon.jpg",
    title: "내 이름은 김삼순",
    category: "드라마 김삼순",
    subtitle: "단 한번도 사랑을 쉽게 해본 적 없어요",
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
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsImageLoaded(true);
    }
  }, []);

  function startEdit(field: EditField) {
    if (!field) return;
    setEditing(field);
    setDraft(data[field] ?? "");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function commit() {
    if (!editing) return;
    const value = draft.trim();
    setData((prev) => ({ ...prev, [editing]: value || undefined }));
    setEditing(null);
  }

  function handleFile(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setData((prev) => ({ ...prev, imageUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  }

  // 카드를 PNG dataUrl로 변환하는 공통 함수
  async function captureCard(): Promise<string> {
    if (!cardRef.current) throw new Error("카드 요소를 찾을 수 없습니다.");

    const isActuallyLoaded = imgRef.current?.complete || isImageLoaded;
    if (!isActuallyLoaded) throw new Error("이미지 로딩 중");

    await new Promise((r) => setTimeout(r, 800));

    const node = cardRef.current;
    const { width, height } = node.getBoundingClientRect();

    // 폰트 미리 로드 (캡처 전에 document에서 사용 중인 폰트를 강제 로드)
    await document.fonts.ready;

    return toPng(node, {
      cacheBust: true,
      pixelRatio: 2,
      // 투명 배경으로 → 둥근 모서리가 투명하게 잘림
      backgroundColor: "transparent",
      skipFonts: false, // 폰트 유지
      width,
      height,
      style: {
        transform: "scale(1)",
        borderRadius: "24px", // rounded-3xl = 1.5rem = 24px
        overflow: "hidden",
      },
      useCORS: true,
      allowTaint: true,
    } as any);
  }

  // 💾 저장: 모바일/데스크탑 모두 PNG 다운로드
  async function handleSave() {
    try {
      const dataUrl = await captureCard();

      const link = document.createElement("a");
      link.download = `${data.title || "card"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err: any) {
      if (err?.message === "이미지 로딩 중") {
        alert("이미지를 불러오는 중입니다. 잠시 후 다시 시도해 주세요!");
      } else {
        console.error("저장 실패:", err);
        alert("저장에 실패했습니다. 스크린샷을 이용해 주세요.");
      }
    }
  }

  // 📤 공유: 모바일은 Web Share API, 데스크탑은 클립보드 복사
  async function handleShare() {
    try {
      const dataUrl = await captureCard();

      // Blob & File 변환
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `${data.title || "card"}.png`, {
        type: "image/png",
      });

      // 모바일: Web Share API (파일 공유 지원 여부 확인)
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: data.title,
        });
        return;
      }

      // 데스크탑 fallback: 클립보드에 이미지 복사
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        alert("이미지가 클립보드에 복사되었습니다! (Ctrl+V로 붙여넣기)");
        return;
      }

      // 최후 fallback: 다운로드로 대체
      alert("공유가 지원되지 않는 환경입니다. 이미지를 다운로드합니다.");
      const link = document.createElement("a");
      link.download = `${data.title || "card"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err: any) {
      if (err?.name === "AbortError") return; // 사용자가 공유 취소한 경우
      if (err?.message === "이미지 로딩 중") {
        alert("이미지를 불러오는 중입니다. 잠시 후 다시 시도해 주세요!");
      } else {
        console.error("공유 실패:", err);
        alert("공유에 실패했습니다. 스크린샷을 이용해 주세요.");
      }
    }
  }

  return (
    <div
      ref={cardRef}
      className="rounded-3xl overflow-hidden bg-white"
      style={{ isolation: "isolate" }}
    >
      <div className="relative w-full bg-black rounded-3xl overflow-hidden shadow-2xl">
        {/* 📷 이미지 영역 */}
        <div className="relative aspect-[390/500] group">
          <img
            ref={imgRef}
            src={data.imageUrl}
            alt=""
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
            onLoad={() => setIsImageLoaded(true)}
            key={data.imageUrl}
            onError={() => {
              console.error("이미지 로드 실패");
              setIsImageLoaded(false);
            }}
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
              <CircleIconButton label="북마크" onClick={handleSave}>
                <Bookmark size={18} />
              </CircleIconButton>
              <CircleIconButton label="공유" onClick={handleShare}>
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
                onChange={(e) => {
                  let val = parseInt(e.target.value.replace(/[^0-9]/g, ""));
                  if (isNaN(val)) val = 0;
                  if (val > 9999) val = 9999;
                  setData((prev) => ({ ...prev, reviewCount: val }));
                }}
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
              onClick={handleSave}
            />
            <ActionButton
              label="공유"
              Icon={Share}
              variant="skyBlue"
              onClick={handleShare}
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
            size={18}
            onClick={() => onRate(num)}
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
