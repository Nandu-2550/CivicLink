export function setCitizenSession(payload) {
  localStorage.setItem("token", payload.token);
  localStorage.setItem("user", JSON.stringify(payload.user));
  localStorage.removeItem("authority");
}

export function setAuthoritySession(payload) {
  localStorage.setItem("token", payload.token);
  localStorage.setItem("authority", JSON.stringify({ department: payload.department }));
  localStorage.removeItem("user");
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("authority");
}

export function getUser() {
  return JSON.parse(localStorage.getItem("user") || "null");
}

export function getAuthority() {
  return JSON.parse(localStorage.getItem("authority") || "null");
}
