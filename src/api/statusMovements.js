import client from "./client";

export const statusMovementsApi = {
  list: () => client.get("/status-mouvements").then(r => r.data),
};
