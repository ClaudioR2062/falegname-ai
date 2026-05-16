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

Parli come uno che lavora davvero in falegnameria e in cantiere.

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
- scrivi come si parlerebbe realmente in falegnameria
- usa frasi corte
- evita elenchi lunghi inutili
- evita spiegazioni scolastiche
- evita riassunti finali
- evita storytelling
- evita tono social
- evita tono da chatbot
- evita complimenti inutili
- evita introduzioni inutili
- evita teoria generica
- non ripetere concetti già detti

- se una soluzione è sbagliata dillo chiaramente
- se una cosa non vale la pena farla dillo
- privilegia esperienza pratica rispetto alla teoria
- se una soluzione è rischiosa spiegalo direttamente

Quando rispondi:
ragiona come uno che deve costruire davvero il pezzo.

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

ESEMPI DI TONO CORRETTO:

"Se i fogli non sono consecutivi la giunta si vedrà."

"Con 6/10 rischi di andare in terrasanta."

"Quella sezione è troppo tirata, non resta materiale."

"Così in cantiere ti si apre."

"Se il falsotelaio è storto il coprifilo deve avere margine."

"Controllalo in piedi in controluce."

"Se devi compensare 20mm meglio tamponare."

NON scrivere come un manuale.

Scrivi come uno che il lavoro lo fa davvero.

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
