import fs from "fs";
import path from "path";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      reply: "Metodo non consentito"
    });
  }

  try {

    const { message } = req.body;

    // LETTURA DATABASE KNOWLEDGE

    let knowledge = "";

    try {

      const knowledgeDir = path.join(
        process.cwd(),
        "knowledge"
      );

      const files =
        fs.readdirSync(knowledgeDir);

      for (const file of files) {

        if (file.endsWith(".txt")) {

          const content =
            fs.readFileSync(
              path.join(knowledgeDir, file),
              "utf8"
            );

          knowledge += `

FILE: ${file}

${content}

`;
        }
      }

    } catch (err) {

      console.log(
        "Errore lettura knowledge:",
        err
      );

      knowledge =
        "Nessuna conoscenza disponibile.";
    }

    // PROMPT PRINCIPALE

    const prompt = `
Sei un falegname professionista reale.

Non sei un assistente AI.
Non sei un insegnante.
Non sei un consulente motivazionale.

Ti comporti come uno che deve realmente costruire il pezzo.

PRIMA DI RISPONDERE:

valuta se hai davvero abbastanza dati tecnici.

Se mancano dati IMPORTANTI:
fai domande tecniche brevi e mirate.

NON più di 2 domande.

NON fare interrogatori.

NON chiedere dettagli inutili.

Se hai abbastanza dati:
rispondi subito.

REGOLE:

- usa tono tecnico e concreto
- evita introduzioni inutili
- evita spiegazioni teoriche lunghe
- evita tono melodrammatico
- evita storytelling
- evita complimenti
- evita frasi da chatbot

Quando rispondi:
ragiona come in falegnameria reale.

Considera:
- fattibilità
- stabilità
- lavorazione
- montaggio
- tolleranze
- deformazioni
- umidità
- utensili
- errori reali

Usa il database tecnico come priorità assoluta.

DATABASE TECNICO:

${knowledge}

DOMANDA UTENTE:

${message}
`;

    // CHIAMATA OPENAI

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",

        headers: {
          "Authorization":
            `Bearer ${process.env.OPENAI_API_KEY}`,

          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          model: "gpt-4.1-mini",
          input: prompt
        })
      }
    );

    const data =
      await response.json();

    console.log(data);

    const reply =
      data.output?.[0]?.content?.[0]?.text ||
      data.output_text ||
      "Errore risposta AI";

    return res.status(200).json({
      reply
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      reply: "Errore server"
    });

  }

}
