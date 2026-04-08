'use client';

import { useState } from 'react';
import { callSoap } from '@/lib/soap';
import { parseXml } from '@/lib/xml';
import { XmlDebug } from './xml-debug';

type XmlData = {
  requestXml: string;
  responseXml: string;
};

type RemessaItem = {
  remessaId: string;
  clienteId: string;
  origem: string;
  destino: string;
  pesoKg: string;
  descricao: string;
  status: string;
  criadoEm: string;
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

function normalizeRemessas(remessasNode: any): RemessaItem[] {
  if (!remessasNode?.item) return [];

  const items = Array.isArray(remessasNode.item)
    ? remessasNode.item
    : [remessasNode.item];

  return items.map((item: any) => ({
    remessaId: item.remessaId ?? '',
    clienteId: item.clienteId ?? '',
    origem: item.origem ?? '',
    destino: item.destino ?? '',
    pesoKg: item.pesoKg ?? '',
    descricao: item.descricao ?? '',
    status: item.status ?? '',
    criadoEm: item.criadoEm ?? '',
  }));
}

export function ShipmentList() {
  const [status, setStatus] = useState('');
  const [pagina, setPagina] = useState(1);
  const [tamanhoPagina, setTamanhoPagina] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [total, setTotal] = useState(0);
  const [items, setItems] = useState<RemessaItem[]>([]);
  const [xmlData, setXmlData] = useState<XmlData | null>(null);

  async function handleListar() {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const statusField = status ? `<status>${status}</status>` : '';

      const body = `
<listarRemessas>
  ${statusField}
  <pagina>${pagina}</pagina>
  <tamanhoPagina>${tamanhoPagina}</tamanhoPagina>
</listarRemessas>
      `;

      const { requestXml, responseXml } = await callSoap('listarRemessas', body);
      const parsed = await parseXml(responseXml);

      const faultMessage = extractFault(parsed);
      if (faultMessage) {
        setItems([]);
        setTotal(0);
        setXmlData({ requestXml, responseXml });
        setError(faultMessage);
        return;
      }

      const data =
        parsed?.['soap:Envelope']?.['soap:Body']?.['tns:listarRemessasResponse'];

      if (!data) {
        throw new Error('Resposta SOAP inválida ao listar remessas.');
      }

      setTotal(Number(data['tns:total'] ?? 0));
      setItems(normalizeRemessas(data['tns:remessas']));
      setXmlData({ requestXml, responseXml });
      setSuccess('Remessas carregadas com sucesso.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao listar remessas.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAtualizarStatus(remessaId: string, novoStatus: string) {
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
      setSuccess(`Status da remessa ${remessaId} atualizado com sucesso.`);
      await handleListar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar status.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section style={sectionStyle}>
      <h2 style={sectionTitleStyle}>Listar Remessas</h2>

      <div style={filterRowStyle}>
        <select
          style={inputStyle}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Todos os status</option>
          <option value="AGUARDANDO">AGUARDANDO</option>
          <option value="EM_TRANSITO">EM_TRANSITO</option>
          <option value="ENTREGUE">ENTREGUE</option>
          <option value="CANCELADO">CANCELADO</option>
        </select>

        <input
          style={inputStyle}
          type="number"
          min={1}
          value={pagina}
          onChange={(e) => setPagina(Number(e.target.value))}
          placeholder="Página"
        />

        <input
          style={inputStyle}
          type="number"
          min={1}
          value={tamanhoPagina}
          onChange={(e) => setTamanhoPagina(Number(e.target.value))}
          placeholder="Tamanho da página"
        />

        <button style={buttonStyle} onClick={handleListar} disabled={loading}>
          {loading ? 'Carregando...' : 'Listar'}
        </button>
      </div>

      {error && <p style={errorStyle}>{error}</p>}
      {success && <p style={successStyle}>{success}</p>}

      <p style={{ marginTop: 12 }}><strong>Total:</strong> {total}</p>

      <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
        {items.map((item) => (
          <div key={item.remessaId} style={cardStyle}>
            <p><strong>ID:</strong> {item.remessaId}</p>
            <p><strong>Cliente:</strong> {item.clienteId}</p>
            <p><strong>Origem:</strong> {item.origem}</p>
            <p><strong>Destino:</strong> {item.destino}</p>
            <p><strong>Peso:</strong> {item.pesoKg}</p>
            <p><strong>Descrição:</strong> {item.descricao}</p>
            <p><strong>Status:</strong> {item.status}</p>
            <p><strong>Criado em:</strong> {item.criadoEm}</p>

            <div style={buttonRowStyle}>
              <button
                style={miniButtonStyle}
                onClick={() => handleAtualizarStatus(item.remessaId, 'AGUARDANDO')}
              >
                AGUARDANDO
              </button>
              <button
                style={miniButtonStyle}
                onClick={() => handleAtualizarStatus(item.remessaId, 'EM_TRANSITO')}
              >
                EM_TRANSITO
              </button>
              <button
                style={miniButtonStyle}
                onClick={() => handleAtualizarStatus(item.remessaId, 'ENTREGUE')}
              >
                ENTREGUE
              </button>
              <button
                style={miniButtonStyle}
                onClick={() => handleAtualizarStatus(item.remessaId, 'CANCELADO')}
              >
                CANCELADO
              </button>
            </div>
          </div>
        ))}
      </div>

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

const filterRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
};

const buttonRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
  marginTop: 12,
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

const miniButtonStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: 8,
  border: 'none',
  cursor: 'pointer',
  background: '#27272a',
  color: '#fff',
};

const cardStyle: React.CSSProperties = {
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