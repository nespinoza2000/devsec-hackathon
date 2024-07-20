import MapComponent from "./components/Map.jsx";
import { Loading } from "./components/Loading.jsx";
import openaiService from "./services/openai.js";
import Chatbot from "./components/Chatbot.jsx";

import { useState } from "react";
const App = () => {
  // const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState([{}]);
  const [response, setResponse] = useState("");
  const [limited, setLimited] = useState(false);
  const [loading, setLoading] = useState(false);
  const fetchPlaces = async (prompt) => {
    try {
      setLoading(true);
      const { parsedPlaces, chatResponse } = await openaiService.getPlaces(
        prompt,
        limited
      );

      console.log(parsedPlaces, chatResponse);
      setResponse(chatResponse);
      setPlaces(parsedPlaces);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching places:", error);
      setResponse("Algo salió mal, por favor intenta de nuevo.");
    }
  };
  return (
    <>
      <div className="App h-screen flex flex-col bg-gradient-to-r from-blue-400 to-green-600">
        <header className="bg-gradient-to-r from-darkblue-500 to-green-700 text-white p-4">
          <h1 className="text-center text-2xl">
            Bienvenidos a la Guía Turística
          </h1>
        </header>
        <div className="flex flex-1">
          <div className="w-2/3 p-4">
            <MapComponent locations={places} />
          </div>
          <div className="w-1/3 p-4">
            <Chatbot
              fetchPlaces={fetchPlaces}
              setLimited={setLimited}
              limited={limited}
              loading={loading}
              response={response}
              chatMessage={response}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
