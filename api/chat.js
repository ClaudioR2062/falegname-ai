export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { message } = req.body;

  const prompt = `
Sei un falegname esperto con esperienza reale di cantiere.

Se manca chiarezza fai UNA domanda.

Se è chiaro rispondi così:

PROBLEMA:
PERCHÉ:
SOLUZIONE:
ATTENZIONE:
SE SBAGLI:

Domanda:
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

Rispondi in modo tecnico, pratico e diretto.

Se manca chiarezza fai UNA sola domanda.

Se invece il problema è chiaro rispondi SEMPRE con questa struttura:

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
          "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-5.3",
          input: prompt
        })
      }
    );

    const data = await response.json();

    console.log(data);

    let output = "Nessuna risposta";

    if (
      data.output &&
      data.output[0] &&
      data.output[0].content &&
      data.output[0].content[0] &&
      data.output[0].content[0].text
    ) {
      output = data.output[0].content[0].text;
    }

    return res.status(200).json({
      reply: output
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      reply: "Errore server"
    });

  }
}