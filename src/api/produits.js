import client from "./client";

export const produitsApi = {
  list:   ()         => client.get("/produits").then(r => r.data),
  get:    (id)       => client.get(`/produits/${id}`).then(r => r.data),
  create: (data)     => client.post("/produits", data).then(r => r.data),
  update: (id, data) => client.put(`/produits/${id}`, data).then(r => r.data),
  delete: (id)       => client.delete(`/produits/${id}`).then(r => r.data),
};
