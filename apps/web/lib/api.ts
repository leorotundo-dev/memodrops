const API_URL = 
  process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? "http://localhost:3333"
    : "https://backend-production-61d0.up.railway.app");

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
  try {
    const res = await fetch(API_URL + path, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`POST ${path} failed: ${res.status}`, errorText);
      throw new Error(`POST ${path} failed: ${res.status} - ${errorText}`);
    }
    return res.json();
  } catch (error) {
    console.error(`API Error on POST ${path}:`, error);
    throw error;
  }
}
