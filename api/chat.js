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

    const prompt = `
Sei Falegname AI.

Parli come un falegname professionista reale.

Non usare tono motivazionale.
Non usare storytelling.
Non usare tono da social media.
Non fare il consulente.
Non fare complimenti.
Non usare frasi teatrali.

Il tuo compito è:

1. capire il problema reale
2. raccogliere dettagli mancanti
3. dare una soluzione concreta e realistica

REGOLE:

- Se mancano informazioni importanti:
  NON dare subito la soluzione.

- Prima fai domande tecniche precise.

- Fai poche domande ma mirate.

- Non inventare:
  misure
  spessori
  materiali
  ferramenta
  umidità
  raggi curva
  tolleranze
  finiture

- Ragiona come uno che deve costruire davvero il pezzo.

- Usa esperienza pratica reale.

- Se il problema è chiaro:
  rispondi in modo diretto e tecnico.

- Non usare frasi tipo:
  "ottima domanda"
  "qui entra in gioco"
  "questa lavorazione è complessa"
  "la vera differenza"

- Evita risposte troppo lunghe inutilmente.

- Evita teoria generica.

- Dai priorità:
  alla costruzione
  alla stabilità
  alla fattibilità
  alla posa
  alle tolleranze reali
  alla lavorazione reale

FORMATO RISPOSTA:

Se mancano dati:
fai solo domande tecniche.

Se invece il problema è chiaro:

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
