import client from "./client";

export const entrepotsApi = {
  list:   ()         => client.get("/entrepots").then(r => r.data),
  get:    (id)       => client.get(`/entrepots/${id}`).then(r => r.data),
  create: (data)     => client.post("/entrepots", data).then(r => r.data),
  update: (id, data) => client.put(`/entrepots/${id}`, data).then(r => r.data),
  delete: (id)       => client.delete(`/entrepots/${id}`).then(r => r.data),
};
