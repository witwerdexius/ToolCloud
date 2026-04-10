import packageJson from "../../../package.json";

export function Footer() {
  return (
    <footer
      style={{
        borderTop: "1px solid #F3F4F6",
        padding: "16px 24px",
        textAlign: "center",
        fontSize: 12,
        color: "#9CA3AF",
        background: "#fff",
      }}
    >
      ToolCloud &middot; v{packageJson.version}
    </footer>
  );
}
