import MapComponent from "./components/Map.jsx";
import { Loading } from "./components/Loading.jsx";
import openaiService from "./services/openai.js";
import Chatbot from "./components/Chatbot.jsx";

import { useState } from "react";
const App = () => {
  // const [loading, setLoading] = useState(true);
  const [places, setPlaces] = useState([{}]);

  const fetchPlaces = async (prompt) => {
    try {
      const parsedPlaces = await openaiService.getPlacesAI(prompt);

      setPlaces(parsedPlaces);
      console.log(parsedPlaces);
    } catch (error) {
      console.error("Error fetching places:", error);
    }
  };

  return (
    <div className="App h-screen flex bg-gradient-to-r from-blue-400 to-green-600">
      <div className="flex flex-1">
        <div className="w-2/3 p-4 h-full">
          <MapComponent locations={places} />
        </div>
        <div className="w-1/3 p-4 h-full">
          <Chatbot fetchPlaces={fetchPlaces} />
        </div>
      </div>
    </div>
  );
};

export default App;
