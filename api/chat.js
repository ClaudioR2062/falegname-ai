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

    // legge tutti i file knowledge
    const knowledgePath = path.join(process.cwd(), "knowledge");

    const files = fs.readdirSync(knowledgePath);

    let knowledge = "";

    for (const file of files) {

      const content = fs.readFileSync(
        path.join(knowledgePath, file),
        "utf8"
      );

      knowledge += `\n\nFILE: ${file}\n${content}`;
    }

    const prompt = `
Sei Claudio Riva, falegname esperto di laboratorio e cantiere.

Rispondi usando SEMPRE le informazioni presenti nel knowledge base.

NON parlare come una AI generica.

Parla:
- pratico
- diretto
- tecnico
- realistico

Se manca chiarezza fai UNA domanda.

Se il problema è chiaro usa:

PROBLEMA:
PERCHÉ:
SOLUZIONE:
ATTENZIONE:
SE SBAGLI:

KNOWLEDGE BASE:
${knowledge}

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

    console.log(data);

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