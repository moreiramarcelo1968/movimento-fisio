"use client";

import type { ButtonSize, ButtonVariant } from "./button";
import { buttonClasses } from "./button";

export function ConfirmSubmit({
  children,
  message,
  variant = "danger",
  size = "sm",
  className,
}: {
  children: React.ReactNode;
  message: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return (
    <button
      type="submit"
      className={buttonClasses(variant, size, className)}
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
    >
      {children}
    </button>
  );
}
