import { useId, useState, type InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function FloatingInput({ label, value, defaultValue, className, ...rest }: Props) {
  const id = useId();
  const [internal, setInternal] = useState<string>(typeof defaultValue === "string" ? defaultValue : "");
  const current = (value as string | undefined) ?? internal;
  const filled = current !== undefined && current !== "";

  return (
    <div className={`relative ${className ?? ""}`}>
      <input
        id={id}
        {...rest}
        value={value as string | undefined}
        onChange={(e) => {
          if (value === undefined) setInternal(e.target.value);
          rest.onChange?.(e);
        }}
        placeholder=" "
        className="peer w-full h-14 px-4 pt-5 pb-1.5 rounded-xl bg-card border border-border text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition"
      />
      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-4 transition-all duration-150 text-muted-foreground
          ${filled ? "top-1.5 text-xs font-medium" : "top-4 text-base"}
          peer-focus:top-1.5 peer-focus:text-xs peer-focus:font-medium peer-focus:text-primary`}
      >
        {label}
      </label>
    </div>
  );
}
