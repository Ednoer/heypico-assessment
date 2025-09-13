import React, { useState, useEffect, useCallback } from 'react';
import { MapPin, Search, Navigation, Clock, Phone, Globe, Star } from 'lucide-react';

// Types
interface MosqueData {
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

interface ApiResponse {
  queries: MosqueData[];
  radius: number;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

const MosqueFinder = () => {
  const [mosques, setMosques] = useState<MosqueData[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMosques, setFilteredMosques] = useState<MosqueData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchMosques = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/mosques');
      const data: ApiResponse = await response.json();

      setMosques(data.queries);
    } catch (err) {
      setError('Failed to fetch mosques');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(() => {
    if (!searchTerm) {
      setFilteredMosques(mosques);
      return;
    }

    const lowercasedFilter = searchTerm.toLowerCase();
    const filtered = mosques.filter((mosque) =>
      mosque.name.toLowerCase().includes(lowercasedFilter)
    );

    setFilteredMosques(filtered);
  }, [searchTerm, mosques]);

  useEffect(() => {
    fetchMosques();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, handleSearch]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Mosque Finder</h1>
      <input
        type="text"
        placeholder="Search for a mosque..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div>
        {filteredMosques.map((mosque) => (
          <div key={mosque.id}>
            <h2>{mosque.name}</h2>
            <p>
              {mosque.city}, {mosque.province}, {mosque.country}
            </p>
            <p>{mosque.description}</p>
            <div>
              <MapPin />
              <Navigation />
              <Clock />
              <Phone />
              <Globe />
              <Star />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MosqueFinder;
