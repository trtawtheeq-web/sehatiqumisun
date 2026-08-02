import { z } from "zod";

/**
 * Shared Qatar ID (QID) validation utilities.
 * Rules: exactly 11 digits, starts with 2 or 3, digits only (no spaces/letters).
 * Used by MedicalLogin, MedicalRegister and any future page collecting a QID.
 */

export const QID_LENGTH = 11;
export const QID_PATTERN = /^[23]\d{10}$/;

export const qatarIdSchema = z
  .string()
  .trim()
  .nonempty("يرجى إدخال رقم الهوية القطرية / الرقم الشخصي")
  .regex(/^\d+$/, "يجب أن يحتوي الرقم على أرقام فقط (0-9)")
  .length(QID_LENGTH, "رقم الهوية القطرية يجب أن يتكون من 11 رقماً بالضبط")
  .regex(/^[23]/, "رقم الهوية القطرية يجب أن يبدأ بـ 2 أو 3");

/** Strip whitespace + any non-digit and cap at 11 chars. */
export const sanitizeQatarId = (raw: string): string =>
  raw.replace(/\s+/g, "").replace(/\D/g, "").slice(0, QID_LENGTH);

/** True when the value passes the full QID schema. */
export const isValidQatarId = (value: string): boolean =>
  QID_PATTERN.test(value);

/** Live per-keystroke validation; empty string clears the error. */
export const validateQatarIdLive = (value: string): string | undefined => {
  if (value.length === 0) return undefined;
  const r = qatarIdSchema.safeParse(value);
  return r.success ? undefined : r.error.issues[0]?.message;
};

/** Contextual message for a pre-submit hard check. */
export const qatarIdErrorFor = (value: string): string | undefined => {
  if (QID_PATTERN.test(value)) return undefined;
  if (value.length !== QID_LENGTH)
    return "رقم الهوية القطرية يجب أن يتكون من 11 رقماً بالضبط";
  return "رقم الهوية القطرية يجب أن يبدأ بـ 2 أو 3";
};

/** Block spaces and non-digit characters at the keyboard level. */
export const qatarIdKeyDownGuard = (
  e: React.KeyboardEvent<HTMLInputElement>
): void => {
  if (e.key === " " || e.key === "Spacebar") {
    e.preventDefault();
    return;
  }
  if (
    e.key.length === 1 &&
    !/[0-9]/.test(e.key) &&
    !e.ctrlKey &&
    !e.metaKey
  ) {
    e.preventDefault();
  }
};

/**
 * Sanitize pasted content. Returns the cleaned value when the paste contained
 * junk (caller should apply it), or null when the paste was already clean.
 */
export const qatarIdPasteSanitizer = (
  e: React.ClipboardEvent<HTMLInputElement>
): string | null => {
  const text = e.clipboardData.getData("text");
  if (!/\D/.test(text) && text.length <= QID_LENGTH) return null;
  e.preventDefault();
  return sanitizeQatarId(text);
};