import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const authService = {
  async login(email: string, senha: string) {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      senha,
      tipo: "empresa",
    });

    const { access_token, usuario } = response.data.dados;

    if (access_token && usuario) {
      localStorage.setItem("token", access_token);

      localStorage.setItem("usuario", JSON.stringify(usuario));

      console.log("Login salvo com sucesso:", { token: access_token, usuario });
    } else {
      console.error("Resposta do login incompleta:", response.data);
      throw new Error("Token ou dados do usuário não recebidos.");
    }

    return response.data;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "/login";
  },

  getToken() {
    return localStorage.getItem("token");
  },

  getUsuario() {
    const usuarioJson = localStorage.getItem("usuario");
    return usuarioJson ? JSON.parse(usuarioJson) : null;
  },

  getEmpresaId(): number | null {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      const payload = JSON.parse(jsonPayload);
      return payload.sub ? Number(payload.sub) : null;
    } catch (error) {
      console.error("Erro ao decodificar token:", error);
      return null;
    }
  },
};
