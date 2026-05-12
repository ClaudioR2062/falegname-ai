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

    if (!message) {
      return res.status(400).json({
        reply: "Messaggio mancante"
      });
    }

    // LEGGE IL DATABASE KNOWLEDGE

    const knowledgePath = path.join(process.cwd(), "knowledge", "knowledge.txt");

    const knowledge = fs.readFileSync(
      knowledgePath,
      "utf8"
    );

    // PROMPT PRINCIPALE

    const prompt = `
Sei Falegname AI.

NON sei un assistente generico.

Rispondi usando PRIMA le conoscenze presenti nel database tecnico qui sotto.

Il database contiene esperienza reale di falegnameria:
- impiallacciatura
- tranciati
- canettature
- lavorazioni cnc
- mobili curvi
- fissaggi reali
- problemi di cantiere
- errori comuni
- tecniche homemade
- pressatura
- lavorazioni su misura
- metodi professionali reali

IMPORTANTE:
Non inventare procedure da manuale teorico.
Ragiona come un falegname vero.

Se manca chiarezza:
fai UNA sola domanda.

Se il problema è chiaro:
rispondi SEMPRE in questo formato.

PROBLEMA:
PERCHÉ:
SOLUZIONE:
ATTENZIONE:
SE SBAGLI:

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
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          input: prompt
        })
      }
    );

    const data = await response.json();

    console.log(data);

    if (!response.ok) {

      return res.status(500).json({
        reply: "Errore OpenAI"
      });

    }

    const reply =
      data.output?.[0]?.content?.[0]?.text ||
      "Nessuna risposta";

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
