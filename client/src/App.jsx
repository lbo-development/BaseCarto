import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:3001/api/health")
      .then((res) => res.json())
      .then((data) => setMessage(data.message + " " + data.now))
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
