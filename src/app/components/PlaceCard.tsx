"use client";

import { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import {
  Bookmark,
  Share2,
  X,
  CornerUpRight,
  Navigation2,
  Share,
  Star,
} from "lucide-react";

// ─── 타입 ───────────────────────────────────────────────
type EditField = "title" | "category" | "subtitle" | null;

// ─── 유틸 ───────────────────────────────────────────────
const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

// ─── 서브 컴포넌트 ───────────────────────────────────────
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

// ─── 메인 컴포넌트 ───────────────────────────────────────
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

  // ─── 편집 ──────────────────────────────────────────────
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

  // ─── 이미지 업로드 ─────────────────────────────────────
  function handleFile(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setIsImageLoaded(false);
      setData((prev) => ({ ...prev, imageUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  }

  // ─── 이미지 → base64 변환 (CORS 우회) ─────────────────
  async function toBase64(src: string): Promise<string> {
    // 이미 base64인 경우 (FileReader로 업로드한 이미지) 그대로 반환
    if (src.startsWith("data:")) return src;

    // 상대경로 → 절대 URL 변환 (모바일에서 /samsoon.jpg 같은 경로 대응)
    const absoluteSrc = src.startsWith("http")
      ? src
      : `${window.location.origin}${src}`;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("canvas context 없음"));
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/jpeg", 0.95));
      };
      img.onerror = reject;
      img.src = absoluteSrc + "?_cb=" + Date.now();
    });
  }

  // ─── 캡처 공통 로직 ────────────────────────────────────
  async function captureCard(): Promise<string> {
    if (!cardRef.current) throw new Error("카드 요소를 찾을 수 없습니다.");

    const isActuallyLoaded = imgRef.current?.complete || isImageLoaded;
    if (!isActuallyLoaded) throw new Error("이미지 로딩 중");

    // 캡처 전 이미지를 base64로 교체 → Safari CORS 까만 이미지 방지
    const originalSrc = data.imageUrl;
    try {
      const base64Src = await toBase64(originalSrc);
      if (imgRef.current) imgRef.current.src = base64Src;
      await new Promise((r) => setTimeout(r, 300));
    } catch {
      // 변환 실패 시 원본 그대로 진행
    }

    await document.fonts.ready;

    const canvas = await html2canvas(cardRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null, // 투명 배경 → 둥근 모서리 유지
      logging: false,
    });

    // 캡처 후 원본 src 복원
    if (imgRef.current) imgRef.current.src = originalSrc;

    return canvas.toDataURL("image/png");
  }

  // dataUrl → Blob/File 변환 공통 함수
  async function captureAsFile(): Promise<{
    dataUrl: string;
    blob: Blob;
    file: File;
  }> {
    const dataUrl = await captureCard();
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], `${data.title || "card"}.png`, {
      type: "image/png",
    });
    return { dataUrl, blob, file };
  }

  // ─── 에러 핸들러 ───────────────────────────────────────
  function handleCaptureError(err: any, action: "저장" | "공유") {
    if (err?.name === "AbortError") return;
    if (err?.message === "이미지 로딩 중") {
      alert("이미지를 불러오는 중입니다. 잠시 후 다시 시도해 주세요!");
    } else {
      // 에러 내용 그대로 alert으로 보여주기
      alert(`${action} 실패: ${err?.name} / ${err?.message} / ${String(err)}`);
    }
  }

  // ─── 저장 ──────────────────────────────────────────────
  async function handleSave() {
    try {
      const { dataUrl, file } = await captureAsFile();

      // 모바일: Web Share API → 갤러리 저장
      if (isMobile() && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: data.title });
        return;
      }

      // 데스크탑: <a download>
      const link = document.createElement("a");
      link.download = `${data.title || "card"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      handleCaptureError(err, "저장");
    }
  }

  // ─── 공유 ──────────────────────────────────────────────
  async function handleShare() {
    try {
      const { dataUrl, blob, file } = await captureAsFile();

      // 모바일: Web Share API
      if (isMobile() && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: data.title });
        return;
      }

      // 데스크탑: 클립보드 복사
      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        alert("이미지가 클립보드에 복사되었습니다! (Ctrl+V로 붙여넣기)");
        return;
      }

      // 최후 fallback: 다운로드
      alert("공유가 지원되지 않는 환경입니다. 이미지를 다운로드합니다.");
      const link = document.createElement("a");
      link.download = `${data.title || "card"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      handleCaptureError(err, "공유");
    }
  }

  // ─── 렌더 ──────────────────────────────────────────────
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
            key={data.imageUrl}
            onLoad={() => setIsImageLoaded(true)}
            onError={() => setIsImageLoaded(false)}
          />
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
          {/* 제목 + 아이콘 버튼 */}
          <div className="flex justify-between items-center">
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

          {/* 별점 + 리뷰 수 */}
          <div className="flex items-center gap-2 mt-2">
            <Stars
              rating={data.rating}
              onRate={(num) => setData((prev) => ({ ...prev, rating: num }))}
            />
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

          {/* 액션 버튼 */}
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
}
