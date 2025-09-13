import axios from 'axios';

export interface PlaceItem {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

export class GoogleMapsService {
  private readonly apiKey: string;
  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.GOOGLE_MAPS_API_KEY || '';
  }

  async geocodeText(query: string, limit = 5): Promise<PlaceItem[]> {
    if (!this.apiKey) throw new Error('GOOGLE_MAPS_API_KEY belum dikonfigurasi');

    // Gunakan Geocoding API (alternatif: Places API Text Search)
    const url = 'https://maps.googleapis.com/maps/api/geocode/json';
    const res = await axios.get(url, {
      params: { address: query, key: this.apiKey },
      timeout: 15000,
    });
    const results = (res.data?.results ?? []).slice(0, limit);
    return results.map((r: any) => ({
      name: r.formatted_address,
      address: r.formatted_address,
      latitude: r.geometry.location.lat,
      longitude: r.geometry.location.lng,
    }));
  }
}


