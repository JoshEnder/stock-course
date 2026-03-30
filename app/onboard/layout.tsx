export default function OnboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100svh" }}>
      {children}
    </div>
  );
}
