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
  const shuttleMarkerRef = useRef<google.maps.Marker | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const handleMapReady = (map: google.maps.Map) => {
    console.log('Map ready callback triggered');
    mapRef.current = map;
    
    // Set to regular roadmap view
    map.setMapTypeId('roadmap');
    
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
    
    // Force re-render markers after map is ready
    setTimeout(() => {
      console.log('Triggering marker render with', locations.length, 'locations');
      if (locations.length > 0) {
        // Clear and re-add markers
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];
        
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
        
        console.log('Added', markersRef.current.length, 'markers to map');
      }
      
      // Also add routes after map is ready
      if (routes.length > 0) {
        console.log('Adding', routes.length, 'routes to map');
        
        // Clear existing polylines
        polylinesRef.current.forEach(line => line.setMap(null));
        polylinesRef.current = [];
        
        const topRoutes = routes.slice(0, 20);
        const maxCount = Math.max(...topRoutes.map(r => r.count));
        const minCount = Math.min(...topRoutes.map(r => r.count));
        
        topRoutes.forEach((route, index) => {
          const normalizedDemand = (route.count - minCount) / (maxCount - minCount);
          const weight = 2 + (normalizedDemand * 8);
          const opacity = Math.max(0.4, 1 - (index * 0.03));

          const polyline = new google.maps.Polyline({
            path: [route.fromCoords, route.toCoords],
            geodesic: true,
            strokeColor: '#00FF00',
            strokeOpacity: opacity,
            strokeWeight: weight,
            map,
          });
          
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="color: #000; padding: 8px; font-family: system-ui;">
                <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 14px;">${route.from} → ${route.to}</h3>
                <p style="margin: 4px 0; font-size: 12px;"><strong>Rides:</strong> ${route.count}</p>
              </div>
            `,
          });
          
          polyline.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
              infoWindow.setPosition(e.latLng);
              infoWindow.open(map);
            }
          });

          polylinesRef.current.push(polyline);
        });
        
        console.log('Added', polylinesRef.current.length, 'route polylines to map');
      }
    }, 500);
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

    // Add top routes as polylines with demand-based thickness
    const topRoutes = routes.slice(0, 20);
    
    // Find max count for normalization
    const maxCount = Math.max(...topRoutes.map(r => r.count));
    const minCount = Math.min(...topRoutes.map(r => r.count));
    
    topRoutes.forEach((route, index) => {
      // Calculate stroke weight based on demand (2-10 range)
      const normalizedDemand = (route.count - minCount) / (maxCount - minCount);
      const weight = 2 + (normalizedDemand * 8); // 2 to 10 pixels
      
      // Opacity based on ranking (top routes more visible)
      const opacity = Math.max(0.4, 1 - (index * 0.03));

      const polyline = new google.maps.Polyline({
        path: [route.fromCoords, route.toCoords],
        geodesic: true,
        strokeColor: '#00FF00',
        strokeOpacity: opacity,
        strokeWeight: weight,
        map,
      });
      
      // Add info window to show demand
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="color: #000; padding: 8px; font-family: system-ui;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 14px;">${route.from} → ${route.to}</h3>
            <p style="margin: 4px 0; font-size: 12px;"><strong>Rides:</strong> ${route.count}</p>
          </div>
        `,
      });
      
      polyline.addListener('click', (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          infoWindow.setPosition(e.latLng);
          infoWindow.open(map);
        }
      });

      polylinesRef.current.push(polyline);
    });

    // Animate shuttle along top route
    if (topRoutes.length > 0 && !shuttleMarkerRef.current) {
      // Create shuttle marker with bus icon
      const shuttleMarker = new google.maps.Marker({
        map,
        icon: {
          path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
          fillColor: '#FFD700',
          fillOpacity: 1,
          strokeColor: '#FF6B00',
          strokeWeight: 2,
          scale: 1.5,
          anchor: new google.maps.Point(12, 22),
        },
        title: 'Night Flight Shuttle',
        zIndex: 1000,
      });
      shuttleMarkerRef.current = shuttleMarker;

      // Animate shuttle along routes
      let routeIndex = 0;
      let progress = 0;
      const animateShuttle = () => {
        if (!shuttleMarkerRef.current || topRoutes.length === 0) return;

        const currentRoute = topRoutes[routeIndex];
        const { fromCoords, toCoords } = currentRoute;

        // Linear interpolation
        const lat = fromCoords.lat + (toCoords.lat - fromCoords.lat) * progress;
        const lng = fromCoords.lng + (toCoords.lng - fromCoords.lng) * progress;

        shuttleMarkerRef.current.setPosition({ lat, lng });

        progress += 0.005; // Speed of animation

        if (progress >= 1) {
          progress = 0;
          routeIndex = (routeIndex + 1) % topRoutes.length;
        }

        animationFrameRef.current = requestAnimationFrame(animateShuttle);
      };

      animateShuttle();
    }

    // Cleanup animation on unmount
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (shuttleMarkerRef.current) {
        shuttleMarkerRef.current.setMap(null);
        shuttleMarkerRef.current = null;
      }
    };
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
