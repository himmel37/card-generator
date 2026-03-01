"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";

type EditField = "title" | "category" | "subtitle" | null;

export default function PlaceCard() {
  const [data, setData] = useState({
    imageUrl: "/riku.jpg",
    title: "내 이름은 김삼순",
    category: "드라마 김삼순",
    subtitle: "돈 주면 다 합니다",
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
    const url = URL.createObjectURL(file);
    setData((prev) => ({ ...prev, imageUrl: url }));
  }

  const cardRef = useRef<HTMLDivElement>(null);

  async function handleDownload() {
    if (!cardRef.current) return;

    const dataUrl = await toPng(cardRef.current);

    const link = document.createElement("a");
    link.download = "card.png";
    link.href = dataUrl;
    link.click();
  }

  return (
    <div ref={cardRef} className="rounded-3xl overflow-hidden bg-white">
      <div className="relative w-full bg-black rounded-3xl overflow-hidden shadow-2xl">
        {/* 📷 이미지 영역 */}
        <div className="relative aspect-[390/500] group">
          <img
            src={data.imageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
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

          {/* 카테고리 */}
          <div className="mt-2">
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
          <div className="mt-2">
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
          <button
            onClick={handleDownload}
            className="mt-6 px-4 py-2 bg-black text-white rounded-xl"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
