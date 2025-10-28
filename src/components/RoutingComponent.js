import { useEffect } from "react";
import L from "leaflet";
import markerImage from "../assets/marker.webp";
import carImage from "../assets/carImage.png";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

const customMarkerIcon = new L.Icon({
  iconUrl: markerImage,
  iconSize: [45, 45],
  popupAnchor: [0, -20],
});

const customCarImage = new L.Icon({
  iconUrl: carImage,
  iconSize: [45, 45],
  popupAnchor: [0, -20],
});

const RoutingComponent = ({ map, start, end }) => {
  useEffect(() => {
    if (!map || !start.length || !end.length) return;

    let marker = L.marker([start[0], start[1]], { icon: customCarImage }).addTo(map);
    let routingControl = null;

    try {
      routingControl = L.Routing.control({
        waypoints: [L.latLng(start[0], start[1]), L.latLng(end[0], end[1])],
        routeWhileDragging: true,
        addWaypoints: false,
        lineOptions: {
          styles: [{ color: "blue", weight: 4 }],
        },
        createMarker: (i, waypoint) =>
          L.marker(waypoint.latLng, { icon: customMarkerIcon }),
      })
        .on("routesfound", (e) => {
          const route = e.routes[0];
          if (!route || !route.coordinates) return;

          // Animate the car marker along the route
          route.coordinates.forEach((coord, index) => {
            setTimeout(() => {
              if (marker && map) marker.setLatLng([coord.lat, coord.lng]);
            }, 200 * index);
          });
        })
        .addTo(map);
    } catch (err) {
      console.error("Routing setup error:", err);
    }

    // ✅ Safe cleanup to prevent 'removeLayer' null error
    return () => {
      if (map) {
        try {
          if (marker) {
            map.removeLayer(marker);
            marker = null;
          }
          if (routingControl && map.hasLayer(routingControl)) {
            map.removeControl(routingControl);
          }
        } catch (error) {
          console.warn("Cleanup warning:", error);
        }
      }
    };
  }, [map, start, end]);

  return null;
};

export default RoutingComponent;
