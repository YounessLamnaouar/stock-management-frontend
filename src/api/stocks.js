import client from "./client";

export const stocksApi = {
  list:   ()         => client.get("/stocks").then(r => r.data),
  get:    (id)       => client.get(`/stocks/${id}`).then(r => r.data),
  create: (data)     => client.post("/stocks", data).then(r => r.data),
  update: (id, data) => client.put(`/stocks/${id}`, data).then(r => r.data),
  delete: (id)       => client.delete(`/stocks/${id}`).then(r => r.data),
};
