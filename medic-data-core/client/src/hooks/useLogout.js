// client/src/hooks/useLogout.js
import api from "../api";
import { clearAuth, getRefreshToken } from "../auth";
import { useNavigate } from "react-router-dom";

export default function useLogout() {
  const navigate = useNavigate();
  return async () => {
    try {
      const rt = getRefreshToken();
      if (rt) {
        await api.post("/auth/logout", { refreshToken: rt });
      }
    } catch {
      // edhe nëse logout në server dështon, sërish pastro lokalisht
    } finally {
      clearAuth();
      navigate("/login", { replace: true });
    }
  };
}
