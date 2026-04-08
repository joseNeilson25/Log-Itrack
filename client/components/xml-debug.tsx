type Props = {
  requestXml: string;
  responseXml: string;
};

export function XmlDebug({ requestXml, responseXml }: Props) {
  return (
    <div style={{ marginTop: 20 }}>
      <h3 style={{ marginBottom: 8 }}>📤 Request XML</h3>
      <pre style={preStyle}>{requestXml}</pre>

      <h3 style={{ marginTop: 16, marginBottom: 8 }}>📥 Response XML</h3>
      <pre style={preStyle}>{responseXml}</pre>
    </div>
  );
}

const preStyle: React.CSSProperties = {
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  background: '#0d0d0d',
  border: '1px solid #2a2a2a',
  borderRadius: 8,
  padding: 12,
  overflowX: 'auto',
};