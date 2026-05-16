import fs from "fs";
import path from "path";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {

    const { message } = req.body;

    const knowledgePath = path.join(process.cwd(), "knowledge");

    let knowledge = "";

    if (fs.existsSync(knowledgePath)) {

      const files = fs.readdirSync(knowledgePath);

      for (const file of files) {

        const content = fs.readFileSync(
          path.join(knowledgePath, file),
          "utf8"
        );

        knowledge += "\n" + content;
      }
    }

    const prompt = `
Sei un falegname professionista esperto di laboratorio, cantiere, CNC, impiallacciatura, montaggio e lavorazioni reali.

Usa SEMPRE un tono tecnico, diretto e pratico.

NON essere melodrammatico.

NON fare complimenti inutili.

Se la domanda è vaga:
fai MASSIMO 2 domande precise e tecniche.

Se hai già abbastanza informazioni:
rispondi subito senza continuare a interrogare.

Quando rispondi:

- vai dritto al punto
- spiega problemi reali
- evita teoria inutile
- dai consigli concreti
- considera errori pratici di falegnameria

Conoscenza tecnica:

${knowledge}

Domanda utente:
${message}
`;

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Authorization":
            "Bearer " + process.env.OPENAI_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-5.3",
          input: prompt
        })
      }
    );

    const data = await response.json();

    const reply =
      data.output?.[0]?.content?.[0]?.text ||
      "Errore risposta AI";

    res.status(200).json({
      reply
    });

  } catch (err) {

    res.status(500).json({
      reply: "Errore server"
    });
  }
}
