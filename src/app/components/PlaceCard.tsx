"use client";
import {
  Navigation,
  UtensilsCrossed,
  Phone,
  Bookmark,
  Share2,
  X,
} from "lucide-react";

type Place = {
  name: string;
  rating: number;
  reviewCount: number;
  category: string;
  status: string;
  subtitle: string;
};

const actions = [
  {
    key: "route",
    label: "경로",
    Icon: Navigation,
    variant: "route" as const,
  },
  {
    key: "order",
    label: "주문",
    Icon: UtensilsCrossed,
    variant: "order" as const,
  },
  {
    key: "call",
    label: "통화",
    Icon: Phone,
    variant: "call" as const,
  },
  {
    key: "save",
    label: "저장됨",
    Icon: Bookmark,
    variant: "save" as const,
  },
];
export default function PlaceCard({ place }: { place: Place }) {
  return (
    <section
      className="bg-white text-black
    rounded-t-3xl
    p-5 shadow-xl"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold text-black">{place.name}</h1>
        <div className="flex items-center gap-2">
          <CircleIconButton label="북마크" onClick={() => {}}>
            <Bookmark size={18} />
          </CircleIconButton>

          <CircleIconButton label="공유" onClick={() => {}}>
            <Share2 size={18} />
          </CircleIconButton>

          <CircleIconButton label="닫기" onClick={() => {}}>
            <X size={18} />
          </CircleIconButton>
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
        {actions.map(({ key, label, Icon, variant }) => (
          <ActionButton key={key} label={label} Icon={Icon} variant={variant} />
        ))}
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
type ButtonVariant = "route" | "order" | "call" | "save";
function ActionButton({
  label,
  Icon,
  variant,
}: {
  label: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  variant: ButtonVariant;
}) {
  const base =
    "flex items-center justify-center gap-2 rounded-full px-3 py-3 text-sm font-medium active:scale-[0.98] transition";

  const styles: Record<ButtonVariant, { wrapper: string; icon: string }> = {
    route: {
      wrapper: "bg-teal-700 text-white",
      icon: "text-white",
    },
    order: {
      wrapper: "bg-sky-100 text-sky-700",
      icon: "text-sky-700",
    },
    call: {
      wrapper: "bg-emerald-100 text-emerald-700",
      icon: "text-emerald-700",
    },
    save: {
      wrapper: "bg-gray-200 text-gray-700",
      icon: "text-gray-700",
    },
  };
  return (
    <button className={`${base} ${styles[variant].wrapper}`} type="button">
      <Icon size={18} className={styles[variant].icon} />
      <span>{label}</span>
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
      className="h-9 w-9 rounded-full bg-slate-100 text-slate-700 shadow-sm
                 flex items-center justify-center
                 hover:bg-slate-200 active:scale-[0.97] transition"
    >
      {children}
    </button>
  );
}
