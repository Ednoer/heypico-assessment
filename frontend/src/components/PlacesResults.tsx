import React from 'react';

interface Place {
  id: number;
  name: string;
  city: string;
  province: string;
  country: string;
  latitude: number;
  longitude: number;
  category: string;
  description: string;
}

interface PlacesResultsProps {
  places: Place[];
  radius: number;
  isLoading: boolean;
  error: string | null;
}

const PlacesResults: React.FC<PlacesResultsProps> = ({ places, radius, isLoading, error }) => {
  if (isLoading) {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '3rem',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-block',
          width: '3rem',
          height: '3rem',
          border: '3px solid #e5e7eb',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1rem'
        }}></div>
        <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>Mencari tempat terdekat...</p>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '0.375rem',
          padding: '1rem',
          color: '#dc2626'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span>⚠️</span>
            <h3 style={{ fontWeight: '600', fontSize: '0.875rem' }}>Terjadi Kesalahan</h3>
          </div>
          <p style={{ fontSize: '0.875rem' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (places.length === 0) {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '3rem',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📍</div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '500', marginBottom: '0.5rem', color: '#1e293b' }}>
          Tidak Ada Hasil
        </h3>
        <p style={{ color: '#6b7280' }}>Coba gunakan kata kunci yang berbeda atau periksa koordinat Anda.</p>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{
        padding: '1.5rem',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e293b' }}>Hasil Pencarian</h2>
        <span style={{
          backgroundColor: '#f3f4f6',
          color: '#374151',
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: '600'
        }}>
          Radius: {radius.toFixed(2)} km
        </span>
      </div>
      
      <div style={{ 
        padding: '1.5rem',
        maxHeight: '24rem',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {places.map((place, index) => (
            <div key={place.id} style={{
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
              padding: '1rem',
              transition: 'box-shadow 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = 'none';
            }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '0.25rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      marginRight: '0.75rem'
                    }}>
                      #{index + 1}
                    </span>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1e293b' }}>
                      {place.name}
                    </h3>
                  </div>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    fontSize: '0.875rem', 
                    color: '#6b7280', 
                    marginBottom: '0.5rem' 
                  }}>
                    <span style={{ marginRight: '0.25rem' }}>📍</span>
                    <span>{place.city}, {place.province}, {place.country}</span>
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    fontSize: '0.875rem', 
                    color: '#6b7280', 
                    marginBottom: '0.5rem' 
                  }}>
                    <span style={{ marginRight: '0.25rem' }}>🏷️</span>
                    <span>{place.category}</span>
                  </div>

                  <p style={{ 
                    fontSize: '0.875rem', 
                    lineHeight: '1.5', 
                    color: '#374151' 
                  }}>
                    {place.description}
                  </p>
                </div>

                <div style={{ marginLeft: '1rem', textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                    Koordinat
                  </div>
                  <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', marginBottom: '0.5rem' }}>
                    <div>Lat: {place.latitude.toFixed(6)}</div>
                    <div>Lng: {place.longitude.toFixed(6)}</div>
                  </div>
                  <button
                    onClick={() => {
                      const url = `https://www.google.com/maps?q=${place.latitude},${place.longitude}`;
                      window.open(url, '_blank');
                    }}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#374151',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #d1d5db',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    🔗 Buka di Maps
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div style={{
        padding: '1rem 1.5rem',
        borderTop: '1px solid #e5e7eb',
        textAlign: 'center'
      }}>
        <p style={{ 
          fontSize: '0.875rem', 
          color: '#6b7280' 
        }}>
          Menampilkan {places.length} tempat dalam radius {radius.toFixed(2)} km
        </p>
      </div>
    </div>
  );
};

export default PlacesResults;
