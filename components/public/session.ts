/** Anonymous per-browser id used only for first-party analytics. */
export function getSessionId() {
  try {
    let id = localStorage.getItem("ce_sid");
    if (!id) {
      id = crypto.randomUUID().replace(/-/g, "");
      localStorage.setItem("ce_sid", id);
    }
    return id;
  } catch {
    return "anonymous-session";
  }
}
