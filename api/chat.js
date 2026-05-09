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

    const knowledgePath = path.join(process.cwd(), "knowledge");

    const files = fs.readdirSync(knowledgePath);

    let selectedKnowledge = "";

    // ricerca semplice per parole
    for (const file of files) {

      const filePath = path.join(knowledgePath, file);

      const content = fs.readFileSync(filePath, "utf8");

      const lowerContent = content.toLowerCase();
      const lowerMessage = message.toLowerCase();

      // divide domanda in parole
      const words = lowerMessage.split(" ");

      let relevance = 0;

      for (const word of words) {

        if (
          word.length > 3 &&
          lowerContent.includes(word)
        ) {
          relevance++;
        }
      }

      // prende solo file rilevanti
      if (relevance > 0) {

        selectedKnowledge += `
FILE: ${file}

${content}

-------------------
`;
      }
    }

    // fallback se niente trovato
    if (!selectedKnowledge) {

      selectedKnowledge =
        "Nessuna conoscenza specifica trovata.";
    }

    const prompt = `
Sei Claudio Riva, falegname esperto reale.

Usa SEMPRE le informazioni presenti nel knowledge base.

Non parlare come AI generica.

Parla:
- pratico
- diretto
- tecnico
- realistico

Se manca chiarezza fai UNA domanda.

Se il problema è chiaro rispondi con:

PROBLEMA:
PERCHÉ:
SOLUZIONE:
ATTENZIONE:
SE SBAGLI:

KNOWLEDGE BASE:
${selectedKnowledge}

DOMANDA:
${message}
`;

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization":
            `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          messages: [
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7
        })
      }
    );

    const data = await response.json();

    return res.status(200).json({
      reply: data.choices[0].message.content
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      reply: "Errore server"
    });

  }
}