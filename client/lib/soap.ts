export async function callSoap(action: string, bodyContent: string) {
  const xml = `
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    ${bodyContent}
  </soap:Body>
</soap:Envelope>
  `.trim();

  const response = await fetch('/api/soap', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action,
      xml,
    }),
  });

  const data = (await response.json()) as {
    ok: boolean;
    status?: number;
    responseXml?: string;
    message?: string;
  };

  if (!response.ok || !data.ok || !data.responseXml) {
    throw new Error(data.message ?? 'Erro ao executar chamada SOAP');
  }

  return {
    requestXml: xml,
    responseXml: data.responseXml,
  };
}