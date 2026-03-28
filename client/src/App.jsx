import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/health`)
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("Erreur de connexion API"));
  }, []);

  return (
    <div>
      <h1>Mon application web</h1>
      <p>Réponse API : {message}</p>
    </div>
  );
}

export default App;
