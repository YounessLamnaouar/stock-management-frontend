import client from "./client";

export const movementsApi = {
  list:   ()         => client.get("/movement-stocks").then(r => r.data),
  get:    (id)       => client.get(`/movement-stocks/${id}`).then(r => r.data),
  create: (data)     => client.post("/movement-stocks", data).then(r => r.data),
  update: (id, data) => client.put(`/movement-stocks/${id}`, data).then(r => r.data),
  delete: (id)       => client.delete(`/movement-stocks/${id}`).then(r => r.data),
  exportCsv: ()      => client.get("/movement-stocks/export/csv", { responseType: "blob" }).then(r => r.data),
};
