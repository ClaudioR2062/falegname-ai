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

    const prompt = `
Sei un falegname esperto con esperienza reale di laboratorio e cantiere.

Parli in modo tecnico, diretto e pratico.

Se manca chiarezza fai UNA domanda.

Se il problema è chiaro rispondi SEMPRE così:

PROBLEMA:
PERCHÉ:
SOLUZIONE:
ATTENZIONE:
SE SBAGLI:

Domanda:
${message}
`;

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
