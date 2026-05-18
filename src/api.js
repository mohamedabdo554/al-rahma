const BASE = "/api";

async function request(url, options = {}) {
  const res = await fetch(`${BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export const api = {
  services: {
    list: () => request("/services"),
  },
  clients: {
    list: () => request("/clients"),
    add: (data) => request("/clients", { method: "POST", body: JSON.stringify(data) }),
    update: (id, data) => request(`/clients/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
  },
  visits: {
    list: () => request("/visits"),
    add: (data) => request("/visits", { method: "POST", body: JSON.stringify(data) }),
  },
  followUps: {
    list: () => request("/followUps"),
    add: (data) => request("/followUps", { method: "POST", body: JSON.stringify(data) }),
  },
};
