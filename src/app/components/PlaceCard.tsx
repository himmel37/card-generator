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
} from "lucide-react";

type EditField = "title" | "category" | "subtitle" | null;

export default function PlaceCard() {
  const [data, setData] = useState({
    imageUrl: "/riku.jpg",
    title: "내 이름은 김삼순",
    category: "드라마 김삼순",
    subtitle: "돈 주면 다 합니다",
    rating: 5.0,
    reviewCount: 9999,
  });

  const [editing, setEditing] = useState<EditField>(null);
  const [draft, setDraft] = useState("");

  const fileRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

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

  const cardRef = useRef<HTMLDivElement>(null);

  async function handleDownload() {
    if (!cardRef.current) return;

    try {
      // cacheBust를 true로 설정하여 이미지 캐시 문제를 방지합니다.
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2, // 결과물 화질을 높입니다.
      });

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
          {/* ⭐ 별점 + 리뷰 */}
          <div className="flex items-center gap-2 mt-1">
            <Stars rating={data.rating} />
            <span className="text-sm text-neutral-600">
              {data.rating.toFixed(1)}
            </span>
            <span className="text-sm text-neutral-400">
              (리뷰 {data.reviewCount})
            </span>
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
  function Stars({ rating }: { rating: number }) {
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;

    return (
      <div className="flex items-center gap-1" aria-label="rating stars">
        {[...Array(fullStars)].map((_, i) => (
          <span key={`f-${i}`} className="text-yellow-500">
            ★
          </span>
        ))}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`e-${i}`} className="text-gray-300">
            ★
          </span>
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
          px-2 py-2 text-sm font-medium shadow-sm
          active:scale-[0.97] transition bg-gray-200 text-gray-700"
      >
        {children}
      </button>
    );
  }
}
