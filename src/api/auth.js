import client from "./client";

export const authApi = {
  login:           (email, password) => client.post("/login",  { email, password }).then(r => r.data),
  logout:          ()                => client.post("/logout").then(r => r.data),
  me:              ()                => client.get("/me").then(r => r.data.user),
  updateProfile:   (data)            => client.put("/profile", data).then(r => r.data.user),
  updatePassword:  (data)            => client.put("/profile/password", data).then(r => r.data),
};
