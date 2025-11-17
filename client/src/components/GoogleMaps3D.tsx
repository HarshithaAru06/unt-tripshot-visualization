import { useRef, useEffect } from 'react';
import { MapView } from '@/components/Map';
import { Card } from '@/components/ui/card';

interface Location {
  lat: number;
  lng: number;
  name: string;
  pickups: number;
  dropoffs: number;
}

interface GoogleMaps3DProps {
  locations: Location[];
  routes: Array<{
    from: string;
    to: string;
    count: number;
    fromCoords: { lat: number; lng: number };
    toCoords: { lat: number; lng: number };
  }>;
}

export default function GoogleMaps3D({ locations, routes }: GoogleMaps3DProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;
    
    // Set to satellite view with 3D tilt
    map.setMapTypeId('satellite');
    map.setTilt(45);
    
    // Add map type controls
    map.setOptions({
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_RIGHT,
        mapTypeIds: ['satellite', 'hybrid', 'roadmap'],
      },
      rotateControl: true,
      fullscreenControl: true,
      streetViewControl: false,
    });
  };

  useEffect(() => {
    if (!mapRef.current || !locations.length) {
      console.log('Map or locations not ready:', { map: !!mapRef.current, locationsCount: locations.length });
      return;
    }

    const map = mapRef.current;
    console.log('Adding markers for', locations.length, 'locations');

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add location markers
    locations.forEach(location => {
      const totalActivity = location.pickups + location.dropoffs;
      if (totalActivity === 0) return;

      const size = Math.max(8, Math.min(30, totalActivity / 5));

      const marker = new google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map,
        title: `${location.name}\nPickups: ${location.pickups}\nDropoffs: ${location.dropoffs}`,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: '#00FF00',
          fillOpacity: 0.8,
          strokeColor: '#00FF00',
          strokeWeight: 2,
          scale: size / 2,
        },
        optimized: false,
      });

      // Add info window on click
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="color: #000; padding: 8px; font-family: system-ui;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 14px;">${location.name}</h3>
            <p style="margin: 4px 0; font-size: 12px;"><strong>Pickups:</strong> ${location.pickups}</p>
            <p style="margin: 4px 0; font-size: 12px;"><strong>Dropoffs:</strong> ${location.dropoffs}</p>
            <p style="margin: 4px 0; font-size: 12px;"><strong>Total:</strong> ${totalActivity}</p>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      markersRef.current.push(marker);
    });
  }, [locations]);

  useEffect(() => {
    if (!mapRef.current || !routes.length) return;

    const map = mapRef.current;

    // Clear existing polylines
    polylinesRef.current.forEach(line => line.setMap(null));
    polylinesRef.current = [];

    // Add top routes as polylines
    const topRoutes = routes.slice(0, 10);
    
    topRoutes.forEach((route, index) => {
      const opacity = 1 - (index * 0.07);
      const weight = Math.max(2, 6 - index * 0.3);

      const polyline = new google.maps.Polyline({
        path: [route.fromCoords, route.toCoords],
        geodesic: true,
        strokeColor: '#00FF00',
        strokeOpacity: opacity,
        strokeWeight: weight,
        map,
      });

      polylinesRef.current.push(polyline);
    });
  }, [routes]);

  // UNT Campus center coordinates
  const untCenter = { lat: 33.2098, lng: -97.1484 };

  return (
    <Card className="relative w-full h-full overflow-hidden border-primary/20 bg-black">
      <MapView
        className="w-full h-full"
        initialCenter={untCenter}
        initialZoom={15}
        onMapReady={handleMapReady}
      />
    </Card>
  );
}
