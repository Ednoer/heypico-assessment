import React, { useState, useEffect } from 'react';
import PlacesSearch from './PlacesSearch';
import PlacesResults from './PlacesResults';
import GoogleMap from './GoogleMap';
import { searchPlaces, Place, PlacesResponse } from '../services/placesApi';

const PlacesApp: React.FC = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [radius, setRadius] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: -6.1908832, lng: 106.7981261 });

  const handleSearch = async (prompt: string, longitude: number, latitude: number) => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setMapCenter({ lat: latitude, lng: longitude });

    try {
      const response: PlacesResponse = await searchPlaces({
        prompt,
        longitude,
        latitude,
      });

      setPlaces(response.queries);
      setRadius(response.radius);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat mencari tempat';
      setError(errorMessage);
      setPlaces([]);
      setRadius(0);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <div style={{ 
        borderBottom: '1px solid #e5e7eb', 
        backgroundColor: 'white',
        padding: '2rem 0'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 'bold', 
              marginBottom: '1rem',
              color: '#1e293b'
            }}>
              🔍 Pencarian Tempat Terdekat
            </h1>
            <p style={{ 
              color: '#6b7280', 
              maxWidth: '600px', 
              margin: '0 auto',
              fontSize: '1.125rem',
              lineHeight: '1.75'
            }}>
              Temukan tempat-tempat menarik di sekitar Anda dengan mudah. 
              Cari masjid, restoran, ATM, rumah sakit, atau tempat lainnya berdasarkan lokasi Anda.
            </p>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Search Component */}
        <div style={{ marginBottom: '2rem' }}>
          <PlacesSearch 
            onSearch={handleSearch} 
            isLoading={isLoading} 
            onPromptChange={setCurrentPrompt}
            initialPrompt={currentPrompt}
          />
        </div>

        {/* Results Section */}
        {hasSearched && (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {/* Results List */}
            <div>
              <PlacesResults 
                places={places} 
                radius={radius} 
                isLoading={isLoading} 
                error={error} 
              />
            </div>

            {/* Google Map */}
            <div>
              <GoogleMap 
                places={places}
                center={mapCenter}
                radius={radius}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}

        {/* Features Section */}
        {!hasSearched && (
          <div style={{ marginTop: '2rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1e293b' }}>
                Fitur Unggulan
              </h2>
              <p style={{ color: '#6b7280', fontSize: '1.125rem' }}>
                Nikmati pengalaman pencarian tempat yang canggih dan mudah
              </p>
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📍</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>
                  Lokasi Otomatis
                </h3>
                <p style={{ color: '#6b7280' }}>
                  Dapatkan koordinat Anda secara otomatis dengan teknologi GPS
                </p>
              </div>
              
              <div style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎯</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>
                  Pencarian Cerdas
                </h3>
                <p style={{ color: '#6b7280' }}>
                  AI-powered search untuk menemukan tempat yang paling relevan
                </p>
              </div>
              
              <div style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🗺️</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>
                  Integrasi Maps
                </h3>
                <p style={{ color: '#6b7280' }}>
                  Buka lokasi langsung di Google Maps dengan satu klik
                </p>
              </div>
            </div>

            {/* Popular Searches */}
            <div style={{
              backgroundColor: 'white',
              padding: '1.5rem',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                textAlign: 'center', 
                marginBottom: '0.5rem',
                color: '#1e293b'
              }}>
                Pencarian Populer
              </h3>
              <p style={{ 
                textAlign: 'center', 
                color: '#6b7280', 
                marginBottom: '1rem' 
              }}>
                Klik salah satu tombol di bawah untuk memulai pencarian
              </p>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                justifyContent: 'center', 
                gap: '0.5rem' 
              }}>
                {[
                  'masjid terdekat',
                  'restoran halal',
                  'ATM terdekat',
                  'rumah sakit',
                  'apotek',
                  'SPBU',
                  'bank',
                  'toko kelontong',
                  'warung makan',
                  'toko obat'
                ].map((searchTerm) => (
                  <button
                    key={searchTerm}
                    onClick={() => setCurrentPrompt(searchTerm)}
                    style={{
                      backgroundColor: 'transparent',
                      color: '#374151',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #d1d5db',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {searchTerm}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlacesApp;
