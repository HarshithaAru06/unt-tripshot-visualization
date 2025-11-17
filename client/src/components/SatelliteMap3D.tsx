import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// UNT Campus coordinates
const UNT_CENTER: [number, number] = [-97.1526, 33.2098];

interface Location {
  x: number;
  y: number;
  z: number;
}

interface SatelliteMap3DProps {
  locations: Record<string, Location>;
  highlightedLocations?: string[];
  routes?: Array<{ from: string; to: string }>;
}

// Convert grid coordinates to lat/lng around UNT campus
function gridToLatLng(x: number, y: number): [number, number] {
  // Map grid coordinates (0-1100) to a small area around UNT campus
  const scale = 0.01; // Adjust this to control the spread
  const lng = UNT_CENTER[0] + (x - 550) * scale / 1000;
  const lat = UNT_CENTER[1] + (y - 550) * scale / 1000;
  return [lng, lat];
}

export default function SatelliteMap3D({ locations, highlightedLocations = [], routes = [] }: SatelliteMap3DProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Use public Mapbox token
    mapboxgl.accessToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      projection: { name: 'globe' } as any,
      center: UNT_CENTER,
      zoom: 14.5,
      pitch: 60,
      bearing: -20,
      antialias: true
    });

    map.current.on('load', () => {
      setMapLoaded(true);
      
      if (!map.current) return;

      // Add 3D buildings layer
      const layers = map.current.getStyle().layers;
      const labelLayerId = layers?.find(
        (layer) => layer.type === 'symbol' && layer.layout && 'text-field' in layer.layout
      )?.id;

      map.current.addLayer(
        {
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 13,
          paint: {
            'fill-extrusion-color': '#00853E',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              13,
              0,
              13.05,
              ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              13,
              0,
              13.05,
              ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.7
          }
        },
        labelLayerId
      );

      // Add location markers
      Object.entries(locations).forEach(([name, loc]) => {
        const [lng, lat] = gridToLatLng(loc.x, loc.y);
        const isHighlighted = highlightedLocations.includes(name);
        
        const el = document.createElement('div');
        el.className = 'location-marker';
        el.style.width = isHighlighted ? '20px' : '12px';
        el.style.height = isHighlighted ? '20px' : '12px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = isHighlighted ? '#00ff00' : '#00853E';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 0 10px rgba(0, 255, 0, 0.8)';
        el.style.cursor = 'pointer';
        el.style.animation = isHighlighted ? 'pulse 2s infinite' : 'none';

        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
          `<div style="color: #000; font-weight: bold; padding: 5px;">${name}</div>`
        );

        new mapboxgl.Marker(el)
          .setLngLat([lng, lat])
          .setPopup(popup)
          .addTo(map.current!);
      });

      // Add route lines
      if (routes.length > 0) {
        const routeFeatures = routes.map((route, idx) => {
          const fromLoc = locations[route.from];
          const toLoc = locations[route.to];
          if (!fromLoc || !toLoc) return null;

          const [fromLng, fromLat] = gridToLatLng(fromLoc.x, fromLoc.y);
          const [toLng, toLat] = gridToLatLng(toLoc.x, toLoc.y);

          return {
            type: 'Feature' as const,
            properties: { id: idx },
            geometry: {
              type: 'LineString' as const,
              coordinates: [[fromLng, fromLat], [toLng, toLat]]
            }
          };
        }).filter(Boolean);

        map.current.addSource('routes', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: routeFeatures as any[]
          }
        });

        map.current.addLayer({
          id: 'routes',
          type: 'line',
          source: 'routes',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#00ff88',
            'line-width': 3,
            'line-opacity': 0.8
          }
        });
      }
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add animation
    const rotateCamera = (timestamp: number) => {
      if (map.current) {
        map.current.rotateTo((timestamp / 200) % 360, { duration: 0 });
      }
      requestAnimationFrame(rotateCamera);
    };
    // Uncomment to enable auto-rotation: requestAnimationFrame(rotateCamera);

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [locations, highlightedLocations, routes]);

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0.7; }
        }
      `}</style>
      <div ref={mapContainer} className="w-full h-full" />
    </>
  );
}
