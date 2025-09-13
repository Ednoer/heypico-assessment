import { Router } from 'express';
import { z } from 'zod';
import { DeepSeekService } from '../services/deepseek';
import { GoogleMapsService } from '../services/google';

const router = Router();

const requestSchema = z.object({
  prompt: z.string().min(3, 'Prompt is too short'),
  longitude: z.number().optional(),
  latitude: z.number().optional(),
});

const deepseek = new DeepSeekService();
const google = new GoogleMapsService();

router.post('/', async (req, res) => {
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { prompt, longitude, latitude } = parsed.data;

  try {
    // Instruct the LLM to return JSON exactly according to the requested schema
    let systemPrompt = `Reply ONLY with valid JSON in the following format:
    {
      "queries": [
        {
          "id": number,
          "name": string,
          "city": string,
          "province": string,
          "country": string,
          "latitude": number,
          "longitude": number,
          "category": string,
          "description": string
        }
      ]
    }
    Maximum 5 items, use Google Maps coordinates for longitude and latitude.`;
    
    if(longitude && latitude) {
        systemPrompt = `Reply ONLY with valid JSON in the following format:
        {
          "queries": [
            {
              "id": number,
              "name": string,
              "city": string,
              "province": string,
              "country": string,
              "latitude": number,
              "longitude": number,
              "category": string,
              "description": string
            }
          ]
        }
        Maximum 5 items, my location is ${longitude}, ${latitude}. Use Google Maps coordinates for longitude and latitude.`;
    }
    
    const completion = await deepseek.complete(`${systemPrompt}\nInstruction: ${prompt}`);

    // Parse JSON from LLM
    let payload: any = { queries: [] };
    try {
      const jsonStart = completion.indexOf('{');
      const jsonEnd = completion.lastIndexOf('}');
      const jsonText = jsonStart >= 0 && jsonEnd > jsonStart ? completion.slice(jsonStart, jsonEnd + 1) : '{}';
      payload = JSON.parse(jsonText);
    } catch {
      payload = { queries: [] };
    }

    const rawQueries: any[] = Array.isArray(payload?.queries) ? payload.queries.slice(0, 5) : [];

    // Complete coordinates if missing using geocoding based on name+region
    const enriched: any[] = await Promise.all(
      rawQueries.map(async (q, idx) => {
        const id = typeof q?.id === 'number' ? q.id : idx + 1;
        let { latitude, longitude } = q || {};
        if ((latitude === undefined || longitude === undefined) && (q?.name || q?.city)) {
          try {
            const queryText = [q?.name, q?.city, q?.province, q?.country].filter(Boolean).join(', ');
            const places = await google.geocodeText(queryText, 1);
            if (places[0]) {
              latitude = places[0].latitude;
              longitude = places[0].longitude;
            }
          } catch {}
        }
        return {
          id,
          name: q?.name ?? '',
          city: q?.city ?? '',
          province: q?.province ?? '',
          country: q?.country ?? '',
          latitude: Number(latitude),
          longitude: Number(longitude),
          category: q?.category ?? '',
          description: q?.description ?? '',
        };
      })
    );

    // Calculate radius from the first coordinate (if any)
    let radius = 0;
    if (enriched.length > 0) {
      const firstLat = enriched[0].latitude;
      const firstLng = enriched[0].longitude;
      
      // Calculate the maximum distance from the first coordinate to all points
      const distances = enriched.map(q => {
        const R = 6371; // Earth's radius in km
        const dLat = (q.latitude - firstLat) * Math.PI / 180;
        const dLng = (q.longitude - firstLng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(firstLat * Math.PI / 180) * Math.cos(q.latitude * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
      });
      radius = Math.max(...distances);
    }

    return res.json({ 
      queries: enriched,
      radius: Math.round(radius * 100) / 100 // Round to 2 decimals
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to process request' });
  }
});

export default router;


