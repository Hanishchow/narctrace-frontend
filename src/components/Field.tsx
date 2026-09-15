import type { InputHTMLAttributes, ReactNode } from "react";
import { useId } from "react";
import "./Field.css";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: ReactNode;
  error?: string;
}

export function Field({ label, hint, error, id, ...rest }: FieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const describedBy = error
    ? `${fieldId}-error`
    : hint
    ? `${fieldId}-hint`
    : undefined;
  return (
    <div className="field">
      <label className="field__label" htmlFor={fieldId}>
        {label}
      </label>
      <input
        id={fieldId}
        className={`field__input${error ? " field__input--error" : ""}`}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        {...rest}
      />
      {hint && !error && (
        <p id={`${fieldId}-hint`} className="field__hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${fieldId}-error`} className="field__error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
