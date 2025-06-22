"use client";
import dynamic from "next/dynamic";

const IridescenceComponent = dynamic(
  () => import("@/components/magicui/iridescence"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full bg-[radial-gradient(ellipse_at_center,rgba(180,180,255,0.2),rgba(0,0,0,0))]" />
    ),
  }
);

export default function AuthBackground() {
  return (
    <div className="absolute inset-0 -z-10">
      <IridescenceComponent
        color={[1, 1, 1]}
        mouseReact={true}
      />
    </div>
  );
} 