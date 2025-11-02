// src/app/creator/layout.tsx
export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full max-w-screen-xl px-6 lg:px-10 mx-auto">
      {children}
    </div>
  );
}