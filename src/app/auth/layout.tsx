export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      style={{
        minHeight: "calc(100vh - 60px - 49px)", // header + footer
        background:
          "radial-gradient(1000px 500px at 50% -10%, #E8F5F0 0%, #F9FAFB 60%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 16px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 440 }}>{children}</div>
    </main>
  );
}
