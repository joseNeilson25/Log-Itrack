'use client';

import { useState } from 'react';
import { callSoap } from '@/lib/soap';
import { parseXml } from '@/lib/xml';
import { XmlDebug } from './xml-debug';

type XmlData = {
  requestXml: string;
  responseXml: string;
};

type HistoricoItem = {
  status: string;
  data: string;
};

type RemessaData = {
  remessaId: string;
  clienteId: string;
  origem: string;
  destino: string;
  pesoKg: string;
  descricao: string;
  status: string;
  criadoEm: string;
  historico: HistoricoItem[];
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

function normalizeHistorico(historicoNode: any): HistoricoItem[] {
  if (!historicoNode?.item) return [];

  const items = Array.isArray(historicoNode.item)
    ? historicoNode.item
    : [historicoNode.item];

  return items.map((item: any) => ({
    status: item.status ?? '',
    data: item.data ?? '',
  }));
}

export function ShipmentSearch() {
  const [remessaId, setRemessaId] = useState('');
  const [novoStatus, setNovoStatus] = useState('EM_TRANSITO');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [xmlData, setXmlData] = useState<XmlData | null>(null);
  const [remessa, setRemessa] = useState<RemessaData | null>(null);

  async function handleConsultar() {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const body = `
<consultarRemessa>
  <remessaId>${remessaId}</remessaId>
</consultarRemessa>
      `;

      const { requestXml, responseXml } = await callSoap('consultarRemessa', body);
      const parsed = await parseXml(responseXml);

      const faultMessage = extractFault(parsed);
      if (faultMessage) {
        setRemessa(null);
        setXmlData({ requestXml, responseXml });
        setError(faultMessage);
        return;
      }

      const data =
        parsed?.['soap:Envelope']?.['soap:Body']?.['tns:consultarRemessaResponse'];

      if (!data) {
        throw new Error('Resposta SOAP inválida ao consultar remessa.');
      }

      const remessaFormatada: RemessaData = {
        remessaId: data['tns:remessaId'] ?? '',
        clienteId: data['tns:clienteId'] ?? '',
        origem: data['tns:origem'] ?? '',
        destino: data['tns:destino'] ?? '',
        pesoKg: data['tns:pesoKg'] ?? '',
        descricao: data['tns:descricao'] ?? '',
        status: data['tns:status'] ?? '',
        criadoEm: data['tns:criadoEm'] ?? '',
        historico: normalizeHistorico(data['tns:historico']),
      };

      setRemessa(remessaFormatada);
      setXmlData({ requestXml, responseXml });
      setSuccess('Remessa consultada com sucesso.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao consultar remessa.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAtualizarStatus() {
    if (!remessaId.trim()) {
      setError('Informe o ID da remessa.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const body = `
<atualizarStatus>
  <remessaId>${remessaId}</remessaId>
  <status>${novoStatus}</status>
</atualizarStatus>
      `;

      const { requestXml, responseXml } = await callSoap('atualizarStatus', body);
      const parsed = await parseXml(responseXml);

      const faultMessage = extractFault(parsed);
      if (faultMessage) {
        setXmlData({ requestXml, responseXml });
        setError(faultMessage);
        return;
      }

      setXmlData({ requestXml, responseXml });
      setSuccess('Status atualizado com sucesso.');

      await handleConsultar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar status.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={sectionStyle}>
      <h2 style={sectionTitleStyle}>Consultar Remessa</h2>

      <div style={formGridStyle}>
        <input
          style={inputStyle}
          placeholder="ID da remessa"
          value={remessaId}
          onChange={(e) => setRemessaId(e.target.value)}
        />

        <div style={buttonRowStyle}>
          <button style={buttonStyle} onClick={handleConsultar} disabled={loading}>
            {loading ? 'Consultando...' : 'Consultar'}
          </button>

          <select
            style={inputStyle}
            value={novoStatus}
            onChange={(e) => setNovoStatus(e.target.value)}
          >
            <option value="AGUARDANDO">AGUARDANDO</option>
            <option value="EM_TRANSITO">EM_TRANSITO</option>
            <option value="ENTREGUE">ENTREGUE</option>
            <option value="CANCELADO">CANCELADO</option>
          </select>

          <button
            style={secondaryButtonStyle}
            onClick={handleAtualizarStatus}
            disabled={loading}
          >
            Atualizar Status
          </button>
        </div>
      </div>

      {error && <p style={errorStyle}>{error}</p>}
      {success && <p style={successStyle}>{success}</p>}

      {remessa && (
        <div style={cardStyle}>
          <p><strong>ID:</strong> {remessa.remessaId}</p>
          <p><strong>Cliente:</strong> {remessa.clienteId}</p>
          <p><strong>Origem:</strong> {remessa.origem}</p>
          <p><strong>Destino:</strong> {remessa.destino}</p>
          <p><strong>Peso:</strong> {remessa.pesoKg}</p>
          <p><strong>Descrição:</strong> {remessa.descricao}</p>
          <p><strong>Status:</strong> {remessa.status}</p>
          <p><strong>Criado em:</strong> {remessa.criadoEm}</p>

          <div style={{ marginTop: 16 }}>
            <strong>Histórico</strong>
            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
              {remessa.historico.map((item, index) => (
                <li key={`${item.status}-${item.data}-${index}`}>
                  {item.status} — {item.data}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {xmlData && <XmlDebug {...xmlData} />}
    </section>
  );
}

const sectionStyle: React.CSSProperties = {
  marginTop: 32,
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
};

const buttonRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
  alignItems: 'center',
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

const secondaryButtonStyle: React.CSSProperties = {
  ...buttonStyle,
  background: '#16a34a',
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