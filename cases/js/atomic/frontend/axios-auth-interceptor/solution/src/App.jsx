import { useEffect, useRef, useState } from "react";
import axios from "axios";

function useAxiosAuthInterceptor() {
  const clientRef = useRef(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    const client = axios.create({
      baseURL: "/api",
    });

    clientRef.current = client;

    const interceptorId = client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          setSessionExpired(true);
        }

        return Promise.reject(error);
      },
    );

    return () => {
      client.interceptors.response.eject(interceptorId);
      clientRef.current = null;
    };
  }, []);

  const fetchData = async () => {
    setSessionExpired(false);

    try {
      await clientRef.current.get("/protected");
    } catch (error) {
      // The response interceptor handles global 401 errors.
    }
  };

  return { fetchData, sessionExpired };
}

export function App() {
  const { fetchData, sessionExpired } = useAxiosAuthInterceptor();

  return (
    <main>
      <h1>Axios Authentication</h1>

      <button type="button" data-testid="axios-fetch-btn" onClick={fetchData}>
        Fetch Data
      </button>

      {sessionExpired && (
        <div role="alert" data-testid="global-auth-error">
          Session Expired
        </div>
      )}
    </main>
  );
}

export default App;
