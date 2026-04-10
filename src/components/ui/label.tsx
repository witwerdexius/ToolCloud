interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({ required, children, style, ...props }: LabelProps) {
  return (
    <label
      style={{
        display: "block",
        fontSize: 13,
        fontWeight: 600,
        color: "#374151",
        marginBottom: 6,
        ...style,
      }}
      {...props}
    >
      {children}
      {required && <span style={{ marginLeft: 4, color: "#EF4444" }}>*</span>}
    </label>
  );
}
