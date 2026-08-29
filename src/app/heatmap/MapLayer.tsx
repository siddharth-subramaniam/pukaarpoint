"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// We need to attach L to window for leaflet.heat to work in Next.js
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.L = L;
  require('leaflet.heat');
}

interface MapLayerProps {
  points: any[];
  cities: any[];
  onCityClick?: (city: any) => void;
}

export default function MapLayer({ points, cities, onCityClick }: MapLayerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const heatLayer = useRef<any>(null);
  const markersLayer = useRef<L.LayerGroup | null>(null);

  // 1. Initialize Map (runs once)
  useEffect(() => {
    if (!mapRef.current) return;

    // Define bounding box for India roughly (expanded to allow panning under the sidebar)
    const indiaBounds = L.latLngBounds(
      L.latLng(2.0, 55.0), // Southwest (expanded west and south)
      L.latLng(40.0, 115.0)  // Northeast (expanded heavily east)
    );

    // Initialize map
    const map = L.map(mapRef.current, {
      attributionControl: false,
      maxBounds: indiaBounds,
      maxBoundsViscosity: 1.0,
      minZoom: 4.5,
      maxZoom: 12,
      zoomControl: false
    }).setView([22.5937, 78.9629], 4.5);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      className: 'dark-map-tiles'
    }).addTo(map);

    mapInstance.current = map;

    const timer = setTimeout(() => {
      if (mapInstance.current) {
        mapInstance.current.invalidateSize();
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // 2. Update Data (runs when points/cities change)
  useEffect(() => {
    const map = mapInstance.current;
    if (!map) return;

    // Clear existing layers
    if (heatLayer.current) {
      map.removeLayer(heatLayer.current);
      heatLayer.current = null;
    }
    if (markersLayer.current) {
      map.removeLayer(markersLayer.current);
      markersLayer.current = null;
    }

    if (!points || !cities) return;

    // Prepare heatmap data
    const heatData = points.map(p => [p.lat, p.lng, 1]); 
    
    if (heatData.length > 0) {
      heatLayer.current = (L as any).heatLayer(heatData, {
        radius: 20,
        blur: 15,
        maxZoom: 10,
        gradient: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red' }
      }).addTo(map);
    }

    // Prepare city markers
    markersLayer.current = L.layerGroup().addTo(map);
    cities.forEach(city => {
      const radius = Math.max(6, Math.min(25, city.total / 4));
      
      const marker = L.circleMarker([city.lat, city.lng], {
        radius,
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.15,
        weight: 1
      });

      marker.on('click', () => {
        if (onCityClick) onCityClick(city);
      });

      // Add a simple tooltip for hover
      marker.bindTooltip(`${city.city} (${city.total} cases) — Click to view`, { className: 'city-tooltip' });

      markersLayer.current?.addLayer(marker);
    });

  }, [points, cities, onCityClick]);

  return <div ref={mapRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }} />;
}
