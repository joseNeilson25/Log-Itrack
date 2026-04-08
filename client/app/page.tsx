import { ShipmentForm } from '@/components/shipment-form';
import { ShipmentSearch } from '@/components/shipment-search';
import { ShipmentList } from '@/components/shipment-list';

export default function Home() {
  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <h1 style={{ marginBottom: 8 }}>🚚 LogiTrack SOAP Client</h1>
        <p style={{ color: '#a1a1aa', marginBottom: 24 }}>
          Cliente web para operações SOAP de remessas
        </p>

        <ShipmentForm />
        <ShipmentSearch />
        <ShipmentList />
      </div>
    </main>
  );
}

const pageStyle: React.CSSProperties = {
  minHeight: '100vh',
  background: '#09090b',
  color: '#fff',
  padding: 24,
};

const containerStyle: React.CSSProperties = {
  maxWidth: 1000,
  margin: '0 auto',
};