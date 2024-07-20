import { useCallback, useEffect, useRef, useState } from "react";
import {
  AdvancedMarker,
  APIProvider,
  Map,
  Pin,
  useMap,
} from "@vis.gl/react-google-maps";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { Circle } from "./Circle.jsx";
import POIModal from "./POIModal.jsx";

const center = {
  lat: -27.33056,
  lng: -55.86667,
};

const MapComponent = ({ locations = [] }) => {
  return (
    <div className="map">
      <APIProvider
        apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
        onLoad={() => console.log("Maps API has loaded.")}
      >
        <Map
          defaultZoom={13}
          defaultCenter={center}
          onCameraChanged={(ev) =>
            console.debug(
              "camera changed:",
              ev.detail.center,
              "zoom:",
              ev.detail.zoom
            )
          }
          mapId="da37f3254c6a6d1c"
        >
          <PoiMarkers locations={locations} />
        </Map>
      </APIProvider>
    </div>
  );
};

const PoiMarkers = ({ locations = [] }) => {
  const map = useMap();
  const [open, setOpen] = useState(false);
  const [poiData, setPoiData] = useState("");

  const [markers, setMarkers] = useState({});
  const clusterer = useRef(null);
  const [circleCenter, setCircleCenter] = useState(null);
  const handleOpen = (data) => {
    setPoiData(data);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleClick = useCallback((ev, poi) => {
    handleOpen(poi);
    console.log(ev, poi);
    if (!map) return;
    if (!ev.latLng) return;
    map.panTo(ev.latLng);
    setCircleCenter(ev.latLng);
  });
  // Initialize MarkerClusterer, if the map has changed
  useEffect(() => {
    if (!map) return;
    if (!clusterer.current) {
      clusterer.current = new MarkerClusterer({ map });
    }
  }, [map]);

  // Update markers, if the markers array has changed
  useEffect(() => {
    clusterer.current?.clearMarkers();
    clusterer.current?.addMarkers(Object.values(markers));
  }, [markers]);

  const setMarkerRef = (marker, key) => {
    if (marker && markers[key]) return;
    if (!marker && !markers[key]) return;

    setMarkers((prev) => {
      if (marker) {
        return { ...prev, [key]: marker };
      } else {
        const newMarkers = { ...prev };
        delete newMarkers[key];
        return newMarkers;
      }
    });
  };
  return (
    <>
      <POIModal open={open} handleClose={handleClose} poiData={poiData} />
      <Circle
        radius={800}
        center={circleCenter}
        strokeColor={"#0c4cb3"}
        strokeOpacity={1}
        strokeWeight={3}
        fillColor={"#3b82f6"}
        fillOpacity={0.3}
      />
      {locations.map((poi) => (
        <AdvancedMarker
          title={poi.key}
          key={poi.key}
          position={poi.location}
          clickable={true}
          onClick={(event) => handleClick(event, poi)}
        >
          <Pin
            background={"#FBBC04"}
            glyphColor={"#1a70fd"}
            borderColor={"#1a70fd"}
          />
        </AdvancedMarker>
      ))}
    </>
  );
};

export default MapComponent;
