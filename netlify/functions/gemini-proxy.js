// Ficheiro: netlify/functions/gemini-proxy.js

exports.handler = async function(event, context) {
  // Apenas permite pedidos do tipo POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Obtém o 'prompt' enviado pelo site
    const { prompt } = JSON.parse(event.body);

    // Obtém a chave da API guardada em segurança no Netlify
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('A chave da API não está configurada.');
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;
    
    const payload = { contents: [{ parts: [{ text: prompt }] }] };

    // A função no servidor faz a chamada à API Gemini
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Erro da API Gemini:', errorBody);
      return { statusCode: response.status, body: `Erro na API: ${response.statusText}` };
    }

    const data = await response.json();

    // Devolve a resposta da API para o site
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };

  } catch (error) {
    console.error('Erro na função:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};