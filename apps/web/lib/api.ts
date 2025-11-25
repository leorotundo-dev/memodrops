const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";

function buildHeaders() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json"
  };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("memodrops_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
}

export async function apiGet(path: string) {
  const res = await fetch(API_URL + path, {
    method: "GET",
    headers: buildHeaders()
  });
  if (!res.ok) {
    throw new Error(`GET ${path} failed: ${res.status}`);
  }
  return res.json();
}

export async function apiPost(path: string, body: any) {
  const res = await fetch(API_URL + path, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    throw new Error(`POST ${path} failed: ${res.status}`);
  }
  return res.json();
}
