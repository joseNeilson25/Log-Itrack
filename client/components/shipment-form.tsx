'use client';

import { useState } from 'react';
import { callSoap } from '@/lib/soap';
import { parseXml } from '@/lib/xml';
import { XmlDebug } from './xml-debug';

type XmlData = {
  requestXml: string;
  responseXml: string;
};

function extractFault(parsed: any): string | null {
  const body = parsed?.['soap:Envelope']?.['soap:Body'];
  const fault = body?.['soap:Fault'];

  if (!fault) return null;

  return (
    fault?.['soap:Reason']?.['soap:Text'] ??
    fault?.faultstring ??
    'Erro SOAP'
  );
}

export function ShipmentForm() {
  const [clienteId, setClienteId] = useState('');
  const [origem, setOrigem] = useState('');
  const [destino, setDestino] = useState('');
  const [pesoKg, setPesoKg] = useState('');
  const [descricao, setDescricao] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [result, setResult] = useState<any>(null);
  const [xmlData, setXmlData] = useState<XmlData | null>(null);

  async function handleSubmit() {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const body = `
<criarRemessa>
  <clienteId>${clienteId}</clienteId>
  <origem>${origem}</origem>
  <destino>${destino}</destino>
  <pesoKg>${pesoKg}</pesoKg>
  <descricao>${descricao}</descricao>
</criarRemessa>
      `;

      const { requestXml, responseXml } = await callSoap('criarRemessa', body);
      const parsed = await parseXml(responseXml);

      const faultMessage = extractFault(parsed);
      if (faultMessage) {
        setResult(null);
        setXmlData({ requestXml, responseXml });
        setError(faultMessage);
        return;
      }

      const data =
        parsed?.['soap:Envelope']?.['soap:Body']?.['tns:criarRemessaResponse'];

      if (!data) {
        throw new Error('Resposta SOAP inválida ao criar remessa.');
      }

      setResult(data);
      setXmlData({ requestXml, responseXml });
      setSuccess('Remessa criada com sucesso.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar remessa.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={sectionStyle}>
      <h2 style={sectionTitleStyle}>Criar Remessa</h2>

      <div style={formGridStyle}>
        <input
          style={inputStyle}
          placeholder="Cliente ID"
          value={clienteId}
          onChange={(e) => setClienteId(e.target.value)}
        />
        <input
          style={inputStyle}
          placeholder="Origem"
          value={origem}
          onChange={(e) => setOrigem(e.target.value)}
        />
        <input
          style={inputStyle}
          placeholder="Destino"
          value={destino}
          onChange={(e) => setDestino(e.target.value)}
        />
        <input
          style={inputStyle}
          placeholder="Peso"
          value={pesoKg}
          onChange={(e) => setPesoKg(e.target.value)}
        />
        <input
          style={inputStyle}
          placeholder="Descrição"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />

        <button style={buttonStyle} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Criando...' : 'Criar'}
        </button>
      </div>

      {error && <p style={errorStyle}>{error}</p>}
      {success && <p style={successStyle}>{success}</p>}

      {result && (
        <div style={cardStyle}>
          <p><strong>ID:</strong> {result['tns:remessaId']}</p>
          <p><strong>Status:</strong> {result['tns:status']}</p>
          <p><strong>Criado em:</strong> {result['tns:criadoEm']}</p>
        </div>
      )}

      {xmlData && <XmlDebug {...xmlData} />}
    </section>
  );
}

const sectionStyle: React.CSSProperties = {
  marginTop: 24,
  border: '1px solid #2b2b2b',
  borderRadius: 12,
  padding: 20,
  background: '#111',
};

const sectionTitleStyle: React.CSSProperties = {
  marginBottom: 16,
};

const formGridStyle: React.CSSProperties = {
  display: 'grid',
  gap: 12,
  maxWidth: 500,
};

const inputStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 8,
  border: '1px solid #333',
  background: '#1a1a1a',
  color: '#fff',
};

const buttonStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 8,
  border: 'none',
  cursor: 'pointer',
  background: '#2563eb',
  color: '#fff',
};

const cardStyle: React.CSSProperties = {
  marginTop: 16,
  padding: 16,
  borderRadius: 10,
  border: '1px solid #2f2f2f',
  background: '#181818',
};

const errorStyle: React.CSSProperties = {
  color: '#f87171',
  marginTop: 12,
};

const successStyle: React.CSSProperties = {
  color: '#4ade80',
  marginTop: 12,
};