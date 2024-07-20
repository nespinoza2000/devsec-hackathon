import OpenAIApi from "openai";
import lugares from "../assets/lugares.json";
const GPT_MODEL = "gpt-4o";
const SYSTEM_PROMPT =
  "Eres un asistente virtual especializado en ofrecer información precisa y detallada sobre lugares en la ciudad especificada por el usuario. Tu objetivo es proporcionar respuestas claras y útiles sobre los sitios de interés, atracciones, actividades, restaurantes, eventos y cualquier otro aspecto relevante en la ciudad.";

const LIMITED_PROMPT =
  "De la siguiente informacion de lugares extrae lugares de acuerdo a la solicitud del usuario. La informacion esta limitada al siguiente contexto";

const SUMMARIZER_PROMPT =
  "Teniendo en cuenta tu respuesta anterior proporciona un mensaje para el usuario que acompañe el contenido brindado Solo usa los datos que has respondido anteriormente. En caso de que no hayan ubicaciones brinda un mensaje de error como. Lo siento algo ha salido mal :c Intenta de vuelta";
const configuration = {
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
};

const openai = new OpenAIApi(configuration);

const placesSchema = {
  type: "function",
  function: {
    function: extractPlacesJson,
    parse: JSON.parse, // or use a validation library like zod for typesafe parsing.
    parameters: {
      type: "object",
      properties: {
        places: {
          type: "array",
          description: "An array of places",
          items: {
            type: "object",
            description: "A place with details",
            properties: {
              key: { type: "string", description: "Nombre del lugar" },
              type: {
                type: "string",
                descrition:
                  "El tipo del lugar. Catgorias: Turístico, Comida, Desayunos y meriendas, Alojamiento, Tecnología, Compras, Otros",
              },
              description: {
                type: "string",
                descrition:
                  "Una descripción con un texto devuelto por el chat-bot explicando por qué el lugar fué incluido en la lista",
              },
              address: { type: "string", description: "Dirección del lugar" },
              location: {
                type: "object",
                description: "Lat and Lng for map positioning",
                properties: {
                  lat: {
                    type: "number",
                    description: "lat positioning xx.xxxxx",
                  },
                  lng: {
                    type: "number",
                    description: "lng positioning xx.xxxxx",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

// async function buscarLugares(query) {
//   const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${
//     import.meta.env.VITE_GOOGLE_MAPS_API_KEY
//   }`;
//   const response = await axios.get(url);
//   console.log(response.data.results);
//   return response.data.results;
// }

const getPlacesLimited = async (prompt) => {
  const runner = openai.beta.chat.completions
    .runTools({
      model: GPT_MODEL,
      messages: [
        { role: "system", content: LIMITED_PROMPT },
        { role: "system", content: JSON.stringify(lugares) },
        { role: "user", content: prompt },
      ],
      tools: [placesSchema],
      tool_choice: {
        type: "function",
        function: { name: "extractPlacesJson" },
      },
    })
    .on("message", (message) => console.log(message));

  const finalContent = await runner.finalFunctionCall();
  console.log(finalContent);

  const args = finalContent.arguments;
  const parsedPlaces = JSON.parse(args)?.places;
  const chatResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
      {
        role: "system",
        content: `You responded ${parsedPlaces
          .map((el) => `${el?.key} ${el?.description} `)
          .join(" ")}`,
      },
      { role: "system", content: SUMMARIZER_PROMPT },
    ],
    temperature: 1,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  return { parsedPlaces, chatResponse };
};

const getPlacesAI = async (prompt) => {
  const runner = openai.beta.chat.completions
    .runTools({
      model: GPT_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },

        { role: "user", content: prompt },
      ],
      tools: [placesSchema],
      tool_choice: {
        type: "function",
        function: { name: "extractPlacesJson" },
      },
    })
    .on("message", (message) => console.log(message));

  const finalContent = await runner.finalFunctionCall();
  console.log(finalContent, "Final content");
  const args = finalContent.arguments;
  const parsedPlaces = JSON.parse(args)?.places;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
      {
        role: "system",
        content: `You responded ${parsedPlaces
          .map((el) => `${el?.key} ${el?.description} `)
          .join(" ")}`,
      },
      { role: "system", content: SUMMARIZER_PROMPT },
    ],
    temperature: 1,
    max_tokens: 256,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  const chatResponse = response
    ? response.choices[0].message.content
    : parsedPlaces.lenght > 1
    ? "Claro! Te recomiendo estos lugares"
    : "Algo ha salido mal :C";
  return { parsedPlaces, chatResponse };
};

async function extractPlacesJson(param) {
  const response = param;
  return response;
}
export const getPlaces = async (prompt, limited) => {
  if (limited) {
    const { parsedPlaces, chatResponse } = await getPlacesLimited(prompt);
    return { parsedPlaces, chatResponse };
  } else {
    const { parsedPlaces, chatResponse } = await getPlacesAI(prompt);
    return { parsedPlaces, chatResponse };
  }
};
const openaiService = { getPlacesAI, getPlacesLimited, getPlaces };
export default openaiService;
