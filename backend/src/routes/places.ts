import { Router } from 'express';
import { z } from 'zod';
import { DeepSeekService } from '../services/deepseek';
import { GoogleMapsService } from '../services/google';

const router = Router();

const requestSchema = z.object({
  prompt: z.string().min(3, 'Prompt terlalu pendek'),
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
    // Instruksikan LLM agar mengembalikan JSON persis sesuai skema yang diminta
    let systemPrompt = `Balas HANYA JSON valid tanpa teks lain dengan format:
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
    Maksimal 5 item`;
    
    if(longitude && latitude) {
        systemPrompt = `Balas HANYA JSON valid tanpa teks lain dengan format:
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
        Maksimal 5 item, lokasi saya adalah ${longitude}, ${latitude}.`;
    }
    
    const completion = await deepseek.complete(`${systemPrompt}\nPerintah: ${prompt}`);

    // Parse JSON dari LLM
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

    // Lengkapi koordinat bila kosong dengan geocoding berdasarkan nama+wilayah
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

    // Hitung radius dari koordinat pertama (jika ada)
    let radius = 0;
    if (enriched.length > 0) {
      const firstLat = enriched[0].latitude;
      const firstLng = enriched[0].longitude;
      
      // Hitung jarak maksimal dari koordinat pertama ke semua titik
      const distances = enriched.map(q => {
        const R = 6371; // Radius bumi dalam km
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
      radius: Math.round(radius * 100) / 100 // Bulatkan ke 2 desimal
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Gagal memproses permintaan' });
  }
});

export default router;


