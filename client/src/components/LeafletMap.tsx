import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue in Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface Location {
  name: string;
  lat: number;
  lng: number;
  count: number;
}

interface LeafletMapProps {
  locations: Location[];
  routes: Array<{ route: string; count: number }>;
}

// UNT campus coordinates mapping
const UNT_LOCATIONS: Record<string, [number, number]> = {
  'Maple Hall': [33.2098, -97.1534],
  'Victory Hall': [33.2089, -97.1542],
  'Traditions Hall': [33.2095, -97.1528],
  'Kerr & Joe Green Hall': [33.2102, -97.1520],
  'Eagle Landing': [33.2115, -97.1510],
  'Lot 20 Resident': [33.2078, -97.1548],
  'West Hall': [33.2085, -97.1538],
  'Santa Fe Square': [33.2092, -97.1525],
  'Lot 24 temporary': [33.2070, -97.1555],
  'Union': [33.2075, -97.1530],
  'Discovery Park': [33.2120, -97.1500],
  'Highland Street': [33.2065, -97.1560],
  'Apogee Stadium': [33.2055, -97.1545],
  'Chilton Hall': [33.2080, -97.1525],
  'Willis Library': [33.2082, -97.1532],
};

export default function LeafletMap({ locations, routes }: LeafletMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map centered on UNT campus
    const map = L.map(mapContainerRef.current, {
      center: [33.2098, -97.1534], // UNT campus center
      zoom: 14,
      zoomControl: true,
      scrollWheelZoom: true,
      dragging: true,
      doubleClickZoom: true,
    });

    mapRef.current = map;

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Create custom green marker icon
    const greenIcon = L.icon({
      iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUiIGhlaWdodD0iNDEiIHZpZXdCb3g9IjAgMCAyNSA0MSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIuNSAwQzUuNiAwIDAgNS42IDAgMTIuNWMwIDkuNCAxMi41IDI4LjUgMTIuNSAyOC41UzI1IDIxLjkgMjUgMTIuNUMyNSA1LjYgMTkuNCAwIDEyLjUgMHptMCAxN2MtMi41IDAtNC41LTItNC41LTQuNXMyLTQuNSA0LjUtNC41IDQuNSAyIDQuNSA0LjUtMiA0LjUtNC41IDQuNXoiIGZpbGw9IiMyMmM1NWUiLz48L3N2Zz4=',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowUrl: markerShadow,
      shadowSize: [41, 41],
    });

    // Add markers for each location
    locations.forEach((location) => {
      // Try to get coordinates from our mapping
      let coords: [number, number] | undefined;
      
      // Check if location name matches any key in our mapping
      for (const [key, value] of Object.entries(UNT_LOCATIONS)) {
        if (location.name.toLowerCase().includes(key.toLowerCase()) || 
            key.toLowerCase().includes(location.name.toLowerCase())) {
          coords = value;
          break;
        }
      }

      // If no match found, use a default nearby coordinate with slight offset
      if (!coords) {
        const index = locations.indexOf(location);
        coords = [
          33.2098 + (Math.random() - 0.5) * 0.01,
          -97.1534 + (Math.random() - 0.5) * 0.01
        ];
      }

      const marker = L.marker(coords, { icon: greenIcon }).addTo(map);
      
      marker.bindPopup(`
        <div style="font-family: sans-serif;">
          <strong style="color: #22c55e; font-size: 14px;">${location.name}</strong><br/>
          <span style="color: #666; font-size: 12px;">Rides: ${location.count}</span>
        </div>
      `);
    });

    // Draw route lines for top routes
    if (routes && routes.length > 0) {
      routes.slice(0, 5).forEach((route, index) => {
        const [origin, destination] = route.route.split(' → ');
        
        let originCoords: [number, number] | undefined;
        let destCoords: [number, number] | undefined;

        // Find coordinates for origin
        for (const [key, value] of Object.entries(UNT_LOCATIONS)) {
          if (origin.toLowerCase().includes(key.toLowerCase()) || 
              key.toLowerCase().includes(origin.toLowerCase())) {
            originCoords = value;
            break;
          }
        }

        // Find coordinates for destination
        for (const [key, value] of Object.entries(UNT_LOCATIONS)) {
          if (destination.toLowerCase().includes(key.toLowerCase()) || 
              key.toLowerCase().includes(destination.toLowerCase())) {
            destCoords = value;
            break;
          }
        }

        if (originCoords && destCoords) {
          const polyline = L.polyline([originCoords, destCoords], {
            color: '#22c55e',
            weight: 2,
            opacity: 0.6,
            dashArray: '5, 10',
          }).addTo(map);

          polyline.bindPopup(`
            <div style="font-family: sans-serif;">
              <strong style="color: #22c55e;">${route.route}</strong><br/>
              <span style="color: #666; font-size: 12px;">Rides: ${route.count}</span>
            </div>
          `);
        }
      });
    }

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [locations, routes]);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ 
        width: '100%', 
        height: '600px',
        borderRadius: '8px',
        overflow: 'hidden'
      }}
    />
  );
}
