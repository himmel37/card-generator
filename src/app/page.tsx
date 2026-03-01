import PlaceCard from "./components/PlaceCard";

export default function Page() {
  return (
    <main className="min-h-dvh bg-neutral-950 flex items-center justify-center p-6">
      <div className="w-[390px] max-w-full">
        <PlaceCard />
      </div>
    </main>
  );
}
