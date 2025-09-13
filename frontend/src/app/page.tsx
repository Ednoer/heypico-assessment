"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import GoogleMap from "@/components/google-map";

interface Place {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  city: string;
  province: string;
  country: string;
  category: string;
  description: string;
}

export default function PlacesPage() {
  const [prompt, setPrompt] = useState("");
  const [longitude, setLongitude] = useState<string>("");
  const [latitude, setLatitude] = useState<string>("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [radius, setRadius] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showMap, setShowMap] = useState(false);

  // Auto-fill longitude & latitude using browser geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLongitude(pos.coords.longitude.toString());
          setLatitude(pos.coords.latitude.toString());
        },
        () => {
          setError("Failed to get your location. Please fill it manually.");
        }
      );
    }
  }, []);

  const BASE_URL_API = process.env.NEXT_PUBLIC_BASE_URL_API;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setPlaces([]);
    setShowMap(false);
    try {
      const res = await axios.post(
        `${BASE_URL_API}/api/places`,
        {
          prompt,
          longitude: parseFloat(longitude),
          latitude: parseFloat(latitude),
        }
      );
      setPlaces(res.data.queries);
      setRadius(res.data.radius || 0);
      setShowMap(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to fetch places data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Card className="bg-white border border-gray-100 shadow-sm">
        <CardContent className="py-8 px-4 sm:px-8">
          <h1 className="text-2xl font-bold mb-2 text-neutral-900">Find Places</h1>
          <p className="mb-8 text-neutral-500 text-sm">
            Search for places around your location and see the results on the map.
          </p>
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5 mb-8"
            autoComplete="off"
          >
            <Input
              placeholder="Prompt (e.g. nearest mosque)"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              required
              className="bg-white border border-gray-200 placeholder:text-neutral-400 text-neutral-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <div className="flex gap-3">
              <Input
                placeholder="Longitude"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                required
                type="number"
                step="any"
                className="bg-white border border-gray-200 placeholder:text-neutral-400 text-neutral-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
              <Input
                placeholder="Latitude"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                required
                type="number"
                step="any"
                className="bg-white border border-gray-200 placeholder:text-neutral-400 text-neutral-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition"
            >
              {loading ? "Searching..." : "Search"}
            </Button>
          </form>
          {error && (
            <div className="text-red-500 mb-6 text-sm">{error}</div>
          )}
          {places.length > 0 && (
            <div className="mb-4">
              <h2 className="font-semibold mb-3 text-neutral-800 text-base">
                Places Result:
              </h2>
              <div className="grid gap-3">
                {places.map((place, idx) => (
                  <Card
                    key={place.id}
                    className="border border-gray-100 shadow-none bg-neutral-50 hover:shadow transition"
                  >
                    <CardContent className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-500 text-white font-bold text-sm">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-semibold text-neutral-900">
                            {place.name}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {place.city}, {place.province}
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-neutral-400 mt-1">
                        {place.latitude}, {place.longitude}
                      </div>
                      <div className="text-xs mt-1 text-neutral-700">
                        {place.description}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Map only appears after a successful search */}
      {showMap && places.length > 0 && (
        <div className="mt-10">
          <GoogleMap
            places={places}
            center={{
              lat: (places[0]?.latitude ?? parseFloat(latitude)) || -6.2,
              lng: (places[0]?.longitude ?? parseFloat(longitude)) || 106.8,
            }}
            radius={radius}
            isLoading={loading}
          />
        </div>
      )}
    </div>
  );
}
