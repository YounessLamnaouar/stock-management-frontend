import client from "./client";

export const tracabilitesApi = {
  list: () => client.get("/tracabilites").then(r => r.data),
  get:  (id) => client.get(`/tracabilites/${id}`).then(r => r.data),
};
