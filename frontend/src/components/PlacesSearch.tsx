import React, { useState, useEffect } from 'react';

interface PlacesSearchProps {
  onSearch: (prompt: string, longitude: number, latitude: number) => void;
  isLoading: boolean;
  onPromptChange?: (prompt: string) => void;
  initialPrompt?: string;
}

const PlacesSearch: React.FC<PlacesSearchProps> = ({ onSearch, isLoading, onPromptChange, initialPrompt = '' }) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Update prompt when initialPrompt changes
  useEffect(() => {
    setPrompt(initialPrompt);
  }, [initialPrompt]);

  // Mendapatkan lokasi pengguna secara otomatis
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setLocationError(null);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError('Tidak dapat mendapatkan lokasi Anda. Silakan masukkan koordinat manual.');
        }
      );
    } else {
      setLocationError('Browser tidak mendukung geolocation. Silakan masukkan koordinat manual.');
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && longitude !== null && latitude !== null) {
      onSearch(prompt.trim(), longitude, latitude);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          setLocationError(null);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError('Gagal mendapatkan lokasi saat ini.');
        }
      );
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '1.5rem',
      borderRadius: '0.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ marginBottom: '1rem' }}>
        <h2 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '600', 
          marginBottom: '0.5rem',
          color: '#1e293b'
        }}>
          🔍 Cari Tempat Terdekat
        </h2>
        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
          Masukkan kata kunci pencarian dan koordinat lokasi Anda
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            marginBottom: '0.5rem',
            color: '#374151'
          }}>
            Apa yang ingin Anda cari?
          </label>
          <input
            id="prompt"
            type="text"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              onPromptChange?.(e.target.value);
            }}
            placeholder="Contoh: masjid terdekat, restoran halal, ATM terdekat, rumah sakit"
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db';
            }}
          />
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '1rem' 
        }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              marginBottom: '0.5rem',
              color: '#374151'
            }}>
              Latitude
            </label>
            <input
              id="latitude"
              type="number"
              value={latitude || ''}
              onChange={(e) => setLatitude(parseFloat(e.target.value) || null)}
              placeholder="Contoh: -6.1908832"
              step="any"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              marginBottom: '0.5rem',
              color: '#374151'
            }}>
              Longitude
            </label>
            <input
              id="longitude"
              type="number"
              value={longitude || ''}
              onChange={(e) => setLongitude(parseFloat(e.target.value) || null)}
              placeholder="Contoh: 106.7981261"
              step="any"
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
              }}
            />
          </div>
        </div>

        {locationError && (
          <div style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '0.375rem',
            padding: '0.75rem',
            color: '#92400e',
            fontSize: '0.875rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>📍</span>
              <span>{locationError}</span>
            </div>
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.75rem' 
        }}>
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            style={{
              backgroundColor: 'transparent',
              color: '#374151',
              padding: '0.75rem 1rem',
              borderRadius: '0.375rem',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            📍 Gunakan Lokasi Saat Ini
          </button>
          
          <button
            type="submit"
            disabled={isLoading || !prompt.trim() || longitude === null || latitude === null}
            style={{
              backgroundColor: isLoading || !prompt.trim() || longitude === null || latitude === null ? '#9ca3af' : '#3b82f6',
              color: 'white',
              padding: '0.75rem 1rem',
              borderRadius: '0.375rem',
              border: 'none',
              cursor: isLoading || !prompt.trim() || longitude === null || latitude === null ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              if (!isLoading && prompt.trim() && longitude !== null && latitude !== null) {
                e.currentTarget.style.backgroundColor = '#2563eb';
              }
            }}
            onMouseOut={(e) => {
              if (!isLoading && prompt.trim() && longitude !== null && latitude !== null) {
                e.currentTarget.style.backgroundColor = '#3b82f6';
              }
            }}
          >
            {isLoading ? (
              <>
                <span style={{ 
                  display: 'inline-block',
                  width: '1rem',
                  height: '1rem',
                  border: '2px solid transparent',
                  borderTop: '2px solid currentColor',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></span>
                Mencari...
              </>
            ) : (
              <>
                🔍 Cari Tempat
              </>
            )}
          </button>
        </div>
      </form>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PlacesSearch;
