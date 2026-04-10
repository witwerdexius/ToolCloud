import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    const cls = ["tc-input", error ? "tc-input-error" : "", className ?? ""]
      .filter(Boolean)
      .join(" ");
    return <input ref={ref} className={cls} {...props} />;
  }
);

Input.displayName = "Input";
export { Input };
