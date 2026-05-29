import client from "./client";

export const authApi = {
  login:  (email, password) => client.post("/login",  { email, password }).then(r => r.data),
  logout: ()                => client.post("/logout").then(r => r.data),
  me:     ()                => client.get("/me").then(r => r.data),
};
