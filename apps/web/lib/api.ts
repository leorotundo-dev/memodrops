// Use o proxy do Next.js em produção, backend direto em desenvolvimento
const API_URL = 
  process.env.NEXT_PUBLIC_API_URL || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? "http://localhost:3333"
    : "/api/proxy");

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
  try {
    const res = await fetch(API_URL + path, {
      method: "GET",
      headers: buildHeaders()
    });
    if (!res.ok) {
      throw new Error(`GET ${path} failed: ${res.status}`);
    }
    return res.json();
  } catch (error) {
    console.error(`API Error on GET ${path}:`, error);
    throw error;
  }
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

export async function apiPut(path: string, body: any) {
  try {
    const res = await fetch(API_URL + path, {
      method: "PUT",
      headers: buildHeaders(),
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`PUT ${path} failed: ${res.status}`, errorText);
      throw new Error(`PUT ${path} failed: ${res.status} - ${errorText}`);
    }
    return res.json();
  } catch (error) {
    console.error(`API Error on PUT ${path}:`, error);
    throw error;
  }
}

export async function apiDelete(path: string) {
  try {
    const res = await fetch(API_URL + path, {
      method: "DELETE",
      headers: buildHeaders()
    });
    if (!res.ok && res.status !== 204) {
      throw new Error(`DELETE ${path} failed: ${res.status}`);
    }
    if (res.status === 204) {
      return {};
    }
    return res.json();
  } catch (error) {
    console.error(`API Error on DELETE ${path}:`, error);
    throw error;
  }
}
