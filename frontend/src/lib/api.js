const API_HEADERS = {
  "Content-Type": "application/json",
};

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    ...API_HEADERS,
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(path, { ...options, headers });
  const responseText = await response.text();
  let data = {};

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch (_error) {
      data = { message: responseText };
    }
  }

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status}).`);
  }

  return data;
}
