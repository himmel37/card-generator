"use client";

import { useRef, useState, useEffect, type ReactElement } from "react";
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
}): ReactElement {
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
}): ReactElement {
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
}): ReactElement {
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

// ─── Lucide SVG path 데이터 ──────────────────────────────
const LUCIDE_PATHS: Record<string, string> = {
  bookmark: "M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z",
  share2: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13",
  x: "M18 6L6 18M6 6l12 12",
  cornerUpRight: "M15 14l5-5-5-5M4 20v-7a4 4 0 0 1 4-4h12",
  navigation2: "M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z",
  share: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13",
  starFilled:
    "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
};

// SVG path를 Canvas에 그리는 헬퍼
function drawSvgIcon(
  ctx: CanvasRenderingContext2D,
  iconKey: string,
  x: number,
  y: number,
  size: number,
  color: string,
  filled = false
) {
  const pathData = LUCIDE_PATHS[iconKey];
  if (!pathData) return;

  const scale = size / 24;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const path = new Path2D(pathData);
  if (filled) {
    ctx.fillStyle = color;
    ctx.fill(path);
  } else {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2 / scale;
    ctx.fillStyle = "transparent";
    ctx.stroke(path);
  }
  ctx.restore();
}

async function drawCard(
  data: {
    imageUrl: string;
    title: string;
    category: string;
    subtitle: string;
    rating: number;
    reviewCount: number;
  },
  storyMode = false
): Promise<string> {
  const DPR = 2;
  const W = 390;
  const OVERLAP = 64;
  const PADDING = 24;
  const RADIUS = 12; // 모서리 반지름 줄임
  const INNER_RADIUS = 12; // 이미지↔카드 겹치는 부분

  // 정보 영역 높이
  let infoH = PADDING + 24;
  infoH += 36;
  if (data.category) infoH += 26;
  if (data.subtitle) infoH += 24;
  infoH += 16 + 40 + 10;

  // 스토리 모드: 9:16 전체 높이에서 정보 영역을 빼고 이미지 영역을 늘림
  const STORY_H = Math.round((W * 16) / 9);
  const IMG_H = storyMode ? STORY_H - infoH + OVERLAP : Math.round((W * 4) / 4); // 피드 비율
  const CARD_H = IMG_H + infoH - OVERLAP;

  const canvas = document.createElement("canvas");
  canvas.width = W * DPR;
  canvas.height = CARD_H * DPR;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(DPR, DPR);

  ctx.save();
  // 스토리 모드만 바깥 모서리 둥글게, 피드 모드는 사각형
  if (storyMode) {
    roundRect(ctx, 0, 0, W, CARD_H, RADIUS);
    ctx.clip();
  }

  // ── 이미지
  try {
    const img = await loadImage(data.imageUrl);
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const targetAspect = W / IMG_H;
    let sx = 0,
      sy = 0,
      sw = img.naturalWidth,
      sh = img.naturalHeight;
    if (imgAspect > targetAspect) {
      sw = img.naturalHeight * targetAspect;
      sx = (img.naturalWidth - sw) / 2;
    } else {
      sh = img.naturalWidth / targetAspect;
      sy = (img.naturalHeight - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, IMG_H);
  } catch {
    ctx.fillStyle = "#e5e7eb";
    ctx.fillRect(0, 0, W, IMG_H);
  }

  // ── 하단 흰 카드 영역 (위쪽 모서리만 둥글게 - 항상)
  const cardY = IMG_H - OVERLAP;
  ctx.beginPath();
  ctx.moveTo(0 + INNER_RADIUS, cardY);
  ctx.lineTo(W - INNER_RADIUS, cardY);
  ctx.quadraticCurveTo(W, cardY, W, cardY + INNER_RADIUS);
  ctx.lineTo(W, CARD_H);
  ctx.lineTo(0, CARD_H);
  ctx.lineTo(0, cardY + INNER_RADIUS);
  ctx.quadraticCurveTo(0, cardY, INNER_RADIUS, cardY);
  ctx.closePath();
  ctx.fillStyle = "#ffffff";
  ctx.fill();

  const textX = PADDING;
  let textY = cardY + PADDING + 18;

  // ── 제목
  ctx.fillStyle = "#171717";
  ctx.font = `600 18px -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif`;
  ctx.fillText(data.title || "", textX, textY);

  // ── 동그란 아이콘 버튼 3개 (X, 공유, 북마크 - 오른쪽부터)
  const circleR = 17;
  const circleGap = 8;
  const circleY = textY - 6;
  const circleButtons = [
    { icon: "x", color: "#374151" },
    { icon: "share2", color: "#374151" },
    { icon: "bookmark", color: "#374151" },
  ];

  circleButtons.forEach((btn, i) => {
    const cx = W - PADDING - circleR - i * (circleR * 2 + circleGap);
    // 원 배경
    ctx.beginPath();
    ctx.arc(cx, circleY, circleR, 0, Math.PI * 2);
    ctx.fillStyle = "#e5e7eb";
    ctx.fill();
    // 아이콘
    const iconSize = 16;
    drawSvgIcon(
      ctx,
      btn.icon,
      cx - iconSize / 2,
      circleY - iconSize / 2,
      iconSize,
      btn.color
    );
  });

  // ── 별점
  textY += 34;
  const starSize = 18;
  const starGap = 2;
  const filledCount = Math.round(data.rating);
  for (let i = 0; i < 5; i++) {
    const starX = textX + i * (starSize + starGap);
    drawSvgIcon(
      ctx,
      "starFilled",
      starX,
      textY - starSize,
      starSize,
      i < filledCount ? "#facc15" : "#e5e7eb",
      true
    );
  }

  const starEndX = textX + 5 * (starSize + starGap) + 8;
  ctx.font = `700 14px -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif`;
  ctx.fillStyle = "#171717";
  ctx.fillText(data.rating.toFixed(1), starEndX, textY);
  const ratingW = ctx.measureText(data.rating.toFixed(1)).width;
  ctx.font = `400 14px -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif`;
  ctx.fillStyle = "#a3a3a3";
  ctx.fillText(`(리뷰 ${data.reviewCount})`, starEndX + ratingW + 6, textY);

  // ── 카테고리
  if (data.category) {
    textY += 26;
    ctx.font = `400 14px -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif`;
    ctx.fillStyle = "#525252";
    ctx.fillText(data.category, textX, textY);
  }

  // ── 서브타이틀
  if (data.subtitle) {
    textY += 24;
    ctx.font = `400 14px -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif`;
    ctx.fillStyle = "#737373";
    ctx.fillText(data.subtitle, textX, textY);
  }

  // ── 액션 버튼 4개
  const btnY = textY + 16;
  const btnH = 40;
  const btnGap = 8;
  const btnW = (W - PADDING * 2 - btnGap * 3) / 4;
  const actionButtons = [
    { label: "경로", icon: "cornerUpRight", dark: true },
    { label: "시작", icon: "navigation2", dark: false },
    { label: "저장", icon: "bookmark", dark: false },
    { label: "공유", icon: "share", dark: false },
  ];

  actionButtons.forEach((btn, i) => {
    const bx = PADDING + i * (btnW + btnGap);

    // 버튼 배경 (rounded-2xl = 16px)
    roundRect(ctx, bx, btnY, btnW, btnH, 16);
    ctx.fillStyle = btn.dark ? "#0f766e" : "#e0f2fe";
    ctx.fill();

    // 아이콘 + 텍스트 중앙 정렬
    const iconSize = 15;
    const iconColor = btn.dark ? "#ffffff" : "#0369a1";
    ctx.font = `500 12px -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif`;
    const textW = ctx.measureText(btn.label).width;
    const totalW = iconSize + 4 + textW;
    const startX = bx + (btnW - totalW) / 2;
    const iconY = btnY + (btnH - iconSize) / 2;

    drawSvgIcon(ctx, btn.icon, startX, iconY, iconSize, iconColor);

    ctx.fillStyle = iconColor;
    ctx.textAlign = "left";
    ctx.fillText(btn.label, startX + iconSize + 4, btnY + btnH / 2 + 4);
  });
  ctx.textAlign = "left";

  ctx.restore(); // 카드 translate/clip 해제
  return canvas.toDataURL("image/png");
}
async function loadImage(src: string): Promise<HTMLImageElement> {
  // 상대경로 → 절대 URL
  const absoluteSrc =
    src.startsWith("data:") || src.startsWith("http")
      ? src
      : `${window.location.origin}${src}`;

  // fetch로 blob 변환 (CORS 우회, Safari 호환)
  const res = await fetch(absoluteSrc, { cache: "no-store" });
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(blobUrl);
      resolve(img);
    };
    img.onerror = reject;
    img.src = blobUrl;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ─── 메인 컴포넌트 ───────────────────────────────────────
export default function PlaceCard(): ReactElement {
  const [data, setData] = useState({
    imageUrl: "/cafe.jpg",
    title: "Two Hearts Bakery Cafe",
    category: "Cafe",
    subtitle: "오리가 귀여움",
    rating: 3.0,
    reviewCount: 1208,
  });

  const [editing, setEditing] = useState<EditField>(null);
  const [editingReview, setEditingReview] = useState(false);
  const [draft, setDraft] = useState("");
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [showSaveSheet, setShowSaveSheet] = useState(false);

  const fileRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
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

  // ─── 캡처: Canvas로 직접 그리기 ────────────────────────
  async function captureCard(storyMode = false): Promise<string> {
    const isActuallyLoaded = imgRef.current?.complete || isImageLoaded;
    if (!isActuallyLoaded) throw new Error("이미지 로딩 중");
    return drawCard(data, storyMode);
  }

  // ─── dataUrl → Blob/File 변환 ──────────────────────────
  async function captureAsFile(
    storyMode = false
  ): Promise<{ dataUrl: string; blob: Blob; file: File }> {
    const dataUrl = await captureCard(storyMode);
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], `${data.title || "card"}.png`, {
      type: "image/png",
    });
    return { dataUrl, blob, file };
  }

  // ─── 에러 핸들러 ───────────────────────────────────────
  function handleCaptureError(err: unknown, action: "저장" | "공유") {
    if ((err as { name?: string })?.name === "AbortError") return;
    if ((err as { message?: string })?.message === "이미지 로딩 중") {
      alert("이미지를 불러오는 중입니다. 잠시 후 다시 시도해 주세요!");
    } else {
      console.error(`${action} 실패:`, err);
      alert(`${action}에 실패했습니다. 스크린샷을 이용해 주세요.`);
    }
  }

  // ─── 저장 ──────────────────────────────────────────────
  async function handleSave(storyMode = false) {
    setShowSaveSheet(false);
    try {
      const { dataUrl, file } = await captureAsFile(storyMode);

      if (isMobile() && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: data.title });
        return;
      }

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

      if (isMobile() && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: data.title });
        return;
      }

      if (navigator.clipboard && window.ClipboardItem) {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        alert("이미지가 클립보드에 복사되었습니다! (Ctrl+V로 붙여넣기)");
        return;
      }

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
      className="rounded-xl overflow-hidden bg-white"
      style={{ isolation: "isolate" }}
    >
      <div className="relative w-full bg-black rounded-xl overflow-hidden shadow-2xl">
        {/* 📷 이미지 영역 */}
        <div className="relative aspect-[4/5] group">
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
              <CircleIconButton
                label="북마크"
                onClick={() => setShowSaveSheet(true)}
              >
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
              onClick={() => setShowSaveSheet(true)}
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

      {/* 💾 저장 형식 선택 시트 */}
      {showSaveSheet && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          onClick={() => setShowSaveSheet(false)}
        >
          <div
            className="w-full max-w-sm bg-white rounded-t-3xl p-6 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
            <p className="text-base font-semibold text-neutral-800 mb-4">
              저장 형식 선택
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleSave(false)}
                className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 active:bg-gray-100 transition"
              >
                <div className="w-12 h-12 rounded-xl bg-sky-100 flex items-center justify-center text-sky-600 text-xl">
                  🖼️
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-neutral-800">
                    피드용 저장
                  </p>
                  <p className="text-xs text-neutral-400">
                    인스타 피드에 올리기 좋아요
                  </p>
                </div>
              </button>
              <button
                onClick={() => handleSave(true)}
                className="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 active:bg-gray-100 transition"
              >
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 text-xl">
                  📱
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-neutral-800">
                    스토리용 저장
                  </p>
                  <p className="text-xs text-neutral-400">
                    인스타 스토리에 꽉 차게 저장해요
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
