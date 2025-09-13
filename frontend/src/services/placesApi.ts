export interface Place {
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

export interface PlacesResponse {
  queries: Place[];
  radius: number;
}

export interface PlacesRequest {
  prompt: string;
  longitude: number;
  latitude: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const searchPlaces = async (request: PlacesRequest): Promise<PlacesResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/places`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        // If response is not JSON, use default error message
      }
      
      throw new Error(errorMessage);
    }

    const data: PlacesResponse = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching places:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Tidak dapat terhubung ke server. Pastikan backend API berjalan di ' + API_BASE_URL);
    }
    
    throw error;
  }
};

export const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation tidak didukung oleh browser ini'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let errorMessage = 'Tidak dapat mendapatkan lokasi Anda';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Akses lokasi ditolak. Silakan izinkan akses lokasi dan coba lagi.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Informasi lokasi tidak tersedia.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Permintaan lokasi timeout. Silakan coba lagi.';
            break;
        }
        
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
};
