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

    const lowerMessage =
      message.toLowerCase();

    let knowledge = "";

    // CARTELLA KNOWLEDGE

    const knowledgeDir = path.join(
      process.cwd(),
      "knowledge"
    );

    const files =
      fs.readdirSync(knowledgeDir);

    // FILTRAGGIO FILE

    for (const file of files) {

      if (!file.endsWith(".txt")) {
        continue;
      }

      const lowerFile =
        file.toLowerCase();

      let useFile = false;

      // IMPiallacciatura / tranciati

      if (
        lowerMessage.includes("tranciato") ||
        lowerMessage.includes("impiallacci") ||
        lowerMessage.includes("vena") ||
        lowerMessage.includes("rovere") ||
        lowerMessage.includes("noce") ||
        lowerMessage.includes("pressa") ||
        lowerMessage.includes("giunta") ||
        lowerMessage.includes("mdf")
      ) {

        if (
          lowerFile.includes("impiallacci") ||
          lowerFile.includes("tranciati")
        ) {
          useFile = true;
        }
      }

      // CNC

      if (
        lowerMessage.includes("cnc") ||
        lowerMessage.includes("pantografo") ||
        lowerMessage.includes("fresa") ||
        lowerMessage.includes("offset")
      ) {

        if (
          lowerFile.includes("cnc")
        ) {
          useFile = true;
        }
      }

      // CURVE

      if (
        lowerMessage.includes("curva") ||
        lowerMessage.includes("curvo") ||
        lowerMessage.includes("canett") ||
        lowerMessage.includes("raggio")
      ) {

        if (
          lowerFile.includes("curve")
        ) {
          useFile = true;
        }
      }

      // FISSAGGI

      if (
        lowerMessage.includes("fissaggio") ||
        lowerMessage.includes("barra") ||
        lowerMessage.includes("chimico") ||
        lowerMessage.includes("muro")
      ) {

        if (
          lowerFile.includes("fissaggi")
        ) {
          useFile = true;
        }
      }

      // ERRORI

      if (
        lowerMessage.includes("errore") ||
        lowerMessage.includes("problema")
      ) {

        if (
          lowerFile.includes("errori")
        ) {
          useFile = true;
        }
      }

      // LETTURA FILE

      if (useFile) {

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

    // FALLBACK

    if (!knowledge.trim()) {

      for (const file of files) {

        if (!file.endsWith(".txt")) {
          continue;
        }

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

    // PROMPT

    const prompt = `
Sei un falegname professionista reale.

Parli come uno che lavora davvero in falegnameria e in cantiere.

NON parlare come:
- assistente AI
- insegnante
- consulente
- chatbot
- social media

REGOLE:

- usa tono tecnico e concreto
- usa frasi corte
- rispondi con il minimo necessario
- evita spiegazioni scolastiche
- evita storytelling
- evita tono motivazionale
- evita introduzioni inutili
- evita teoria generica
- non ripetere concetti
- non aggiungere dettagli non richiesti
- non trasformare la risposta in una guida completa
- se bastano 3 frasi fermati
- evita di scaricare tutto il database nella risposta

PRIMA DI RISPONDERE:

valuta se hai davvero abbastanza dati.

Se la domanda è troppo generica:
fai massimo 2 domande tecniche brevi.

NON fare interrogatori.

Se hai già abbastanza dati:
rispondi subito.

Ragiona come uno che deve realmente costruire il pezzo.

Considera:
- lavorazione
- montaggio
- stabilità
- deformazioni
- umidità
- utensili
- tolleranze
- errori reali

Usa il database tecnico come priorità assoluta.

Usa SOLO le informazioni pertinenti alla domanda.

NON mischiare:
- CNC
- impiallacciatura
- fissaggi
- curve
- cantieristica

se non realmente necessari.

Se una informazione non serve:
non citarla.

ESEMPI CORRETTI:

"Che tranciato hai?"

"Bilancialo dietro o si imbarca."

"Con 6/10 rischi di macchiare."

"Se supera la pressa cambia tutto."

"Che MDF stai usando?"

"Così ti si apre."

"Quella sezione è troppo tirata."

ESEMPI SBAGLIATI:

spiegazioni lunghe non richieste.

guide complete.

risposte da manuale.

DATABASE TECNICO:

${knowledge}

DOMANDA UTENTE:

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
          input: prompt,
          max_output_tokens: 300
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
