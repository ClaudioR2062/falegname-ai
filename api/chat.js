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

    // LEGGE TUTTI I FILE TXT

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

    // PROMPT

    const prompt = `
Sei Falegname AI.

NON sei un assistente generico.

Usa prima le informazioni presenti nel database tecnico.

Il database contiene esperienza reale:
- impiallacciatura
- cnc
- curve
- fissaggi
- tranciati
- errori reali
- cantieristica
- lavorazioni professionali

Parla come un falegname vero.

Se manca chiarezza:
fai UNA domanda.

Se il problema è chiaro:
rispondi così:

PROBLEMA:
PERCHÉ:
SOLUZIONE:
ATTENZIONE:
SE SBAGLI:

DATABASE TECNICO:

${knowledge}

DOMANDA:

${message}
`;

    // OPENAI

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
      data.output?.[0]
      ?.content?.[0]
      ?.text
      || "Nessuna risposta";

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
