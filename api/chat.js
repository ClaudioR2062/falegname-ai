import fs from "fs";
import path from "path";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).end();
  }

  try {

    const { message } = req.body;

    // DATABASE TECNICO

    const dbPath = path.join(
      process.cwd(),
      "database"
    );

    const files =
      fs.readdirSync(dbPath);

    let knowledge = "";

    for (const file of files) {

      const content = fs.readFileSync(
        path.join(dbPath, file),
        "utf8"
      );

      knowledge += "\n\n" + content;
    }

    // LOG DOMANDE

    const logPath = path.join(
      process.cwd(),
      "logs",
      "questions.txt"
    );

    const logEntry = `

========================
DATA:
${new Date().toISOString()}

DOMANDA:
${message}
`;

    fs.appendFileSync(
      logPath,
      logEntry
    );

    // PROMPT

    const prompt = `
Sei Claudio, falegname esperto reale.

Rispondi usando esperienza pratica reale.

Se manca chiarezza fai UNA domanda.

Se è chiaro rispondi così:

PROBLEMA:
PERCHÉ:
SOLUZIONE:
ATTENZIONE:
SE SBAGLI:

CONOSCENZA TECNICA:
${knowledge}

DOMANDA:
${message}
`;

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",

        headers: {
          "Authorization":
            "Bearer " +
            process.env.OPENAI_API_KEY,

          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({
          model: "gpt-5.3",
          input: prompt
        })
      }
    );

    const data =
      await response.json();

    res.status(200).json({
      reply:
        data.output[0]
        .content[0]
        .text
    });

  } catch (err) {

    res.status(500).json({
      reply: "Errore server"
    });

  }
}
