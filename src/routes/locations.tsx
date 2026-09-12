import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { styled } from "styled-components";
import { PlusIcon, MinusIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon, Squares2X2Icon, Bars3Icon, MapPinIcon } from "@heroicons/react/24/outline";
import { supabase } from "../supabase";
import starBg from "../assets/star_bg.png";
import { ServiceCard } from "../components/service_card";
import { useI18n } from "../i18n/i18n";

type Place = {
  id: string;
  region: string;
  city: string;
  district?: string;
  postalCode?: string;
  addressLine?: string;
  placeLabel?: string;
  latitude: number;
  longitude: number;
};

type LocationItem = {
  id: string;
  title: string;
  tagline?: string;
  imageUrl: string;
  priceKRW: number;
  activityLevel: "LIGHT" | "MODERATE" | "INTENSE";
  skillLevel: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  maxGuestsTotal: number;
  minAge?: number;
  placeId: string;
  // Localized fields
  titleKo?: string;
  titleEn?: string;
  titleZh?: string;
  titleJa?: string;
  titleEs?: string;
  taglineKo?: string;
  taglineEn?: string;
  taglineZh?: string;
  taglineJa?: string;
  taglineEs?: string;
};

type LocationDisplayItem = LocationItem & { distanceKm?: number };

const Background = styled.div`
  position: relative;
  width: 100%;
  flex: 1 1 auto;
  background: #181818;
  background-image: url(${starBg});
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to bottom,
      rgba(24, 24, 24, 0.7) 0%,
      rgba(24, 24, 24, 0.85) 100%
    );
    z-index: 0;
    pointer-events: none;
  }
`;

const Container = styled.div<{ $expanded?: boolean }>`
  position: relative;
  display: block;
  width: 100%;
  padding: 12px 16px;
  background: transparent;
  z-index: 1;
  @media (max-width: 768px) {
    padding: 0;
    background: transparent;
  }
`;

const ListPane = styled.div<{ $expanded?: boolean; $mapRatio?: number; $sheetExpanded?: boolean }>`
  background: transparent;
  display: ${p => (p.$expanded ? "none" : "flex")};
  flex-direction: column;
  margin-right: ${p => (
    p.$expanded ? 0 : `calc(${(((p.$mapRatio ?? 0.4) * 100).toFixed(3))}vw + 16px)`
  )};
  height: calc(100vh - 86px);
  overflow: hidden;
  @media (max-width: 768px) {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    margin-right: 0;
    background: #181818;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    box-shadow: 0 -8px 24px rgba(0,0,0,0.15);
    height: ${p => (p.$sheetExpanded ? '85vh' : '40vh')};
    z-index: 6; /* above map mobile */
    overflow: hidden;
    flex-direction: column;
    transition: height 0.3s ease;
  }
`;

const MapPane = styled.div<{ $expanded?: boolean; $mapRatio?: number }>`
  position: ${p => (p.$expanded ? "fixed" : "sticky")};
  top: ${p => (p.$expanded ? 0 : "86px")};
  right: ${p => (p.$expanded ? 0 : "auto")};
  left: ${p => (p.$expanded ? 0 : "auto")};
  bottom: ${p => (p.$expanded ? 0 : "auto")};
  float: ${p => (p.$expanded ? "none" : "right")};
  margin-left: ${p => (p.$expanded ? 0 : "16px")};
  width: ${p => (
    p.$expanded ? "100%" : `calc(${(((p.$mapRatio ?? 0.4) * 100).toFixed(3))}vw)`
  )};
  height: ${p => (p.$expanded ? "100vh" : "calc(100vh - 96px - 16px)")};
  border-radius: ${p => (p.$expanded ? "0px" : "14px")};
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  z-index: ${p => (p.$expanded ? 50 : 1)};
  @media (max-width: 768px) {
    position: ${p => (p.$expanded ? "fixed" : "sticky")};
    top: ${p => (p.$expanded ? 0 : "86px")};
    right: 0;
    left: 0;
    bottom: auto;
    float: none;
    margin-left: 0;
    width: 100%;
    height: ${p => (p.$expanded ? "100vh" : "60vh")};
    border-radius: 0px;
    box-shadow: none;
    z-index: ${p => (p.$expanded ? 50 : 2)};
  }
`;

const ListHeader = styled.div`
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  background: transparent;
  position: sticky;
  top: 0;
  z-index: 10;
  
  @media (max-width: 768px) {
    padding: 8px 12px;
  }
`;


const CardsWrap = styled.div`
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  
  /* Make scrollbar transparent */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  
  /* Smooth scrolling on mobile */
  -webkit-overflow-scrolling: touch;
  
  &::-webkit-scrollbar {
    width: 0;
    height: 0;
    background: transparent;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: transparent;
  }
`;

const Cards = styled.div<{ $mode: "list" | "grid" }>`
  display: grid;
  grid-template-columns: ${p => (p.$mode === "grid" ? "repeat(3, 1fr)" : "1fr")};
  gap: 12px;
  padding: 12px;
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
    padding: 8px 12px;
    justify-items: center; /* center items within each grid cell */
  }
`;

// Wrapper to host the ServiceCard with click semantics
const ServiceCardWrap = styled.div<{ $active?: boolean }>`
  display: flex;
  justify-content: flex-start;
  align-items: stretch;
  padding: 6px 0;
  cursor: pointer;
  border-radius: 12px;
  transition: transform 120ms ease, box-shadow 120ms ease;
  position: relative;
  ${p => p.$active ? "transform: translateY(-1px);" : ""}
  @media (max-width: 768px) {
    justify-content: center; /* center the card content on mobile */
  }
`;

const DistanceBadge = styled.div`
  position: absolute;
  top: 6px;
  left: 14px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.92);
  color: #f9fafb;
  font-size: 12px;
  font-weight: 600;
  z-index: 4;
  pointer-events: none;
  backdrop-filter: blur(4px);
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(17, 24, 39, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #f3f4f6;
  font-size: 14px;
  gap: 8px;
  z-index: 5;
`;

const Title = styled.div`
  font-weight: 700;
  color: #111827;
`;

const Sub = styled.div`
  font-size: 12px;
  color: #6b7280;
`;

const Price = styled.div`
  font-weight: 700;
`;

const MapDiv = styled.div`
  width: 100%;
  height: 100%;
`;

const Notice = styled.div`
  padding: 12px 16px;
  background: #fffbeb;
  color: #92400e;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  margin: 12px;
`;

const CardImage = styled.img`
  width: 100%;
  height: 160px;
  object-fit: cover;
  object-position: center;
  border-radius: 12px;
  background: linear-gradient(180deg, #ede9fe 0%, #fef9c3 100%);
`;

const MapControls = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  display: grid;
  gap: 8px;
  z-index: 5;
`;

const ControlButton = styled.button`
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #ffffffee 0%, #f8fafc 100%);
  backdrop-filter: blur(6px);
  border: 1px solid #e5e7eb;
  color: #111827;
  font-weight: 700;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  transition: transform 120ms ease, box-shadow 120ms ease;
  &:hover { transform: translateY(-1px); box-shadow: 0 10px 24px rgba(0, 0, 0, 0.12); }
`;

const ViewSwitch = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

const ViewBtn = styled.button<{ $active?: boolean }>`
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  border: 1px solid ${p => (p.$active ? "#111827" : "#d1d5db")};
  background: #ffffff;
  cursor: pointer;
  transition: background-color 120ms ease, border-color 120ms ease;
  &:hover { background: #f9fafb; }
  &:focus-visible { outline: 2px solid #111827; outline-offset: 2px; }
`;

// Sort/Filter UI - Always aligned to the right end
const ControlsBar = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
  flex-shrink: 0;
`;

const FilterButton = styled.button<{ $active?: boolean }>`
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid ${p => (p.$active ? "#111827" : "#d1d5db")};
  background: ${p => (p.$active ? "#111827" : "#ffffff")};
  color: ${p => (p.$active ? "#ffffff" : "#111827")};
  cursor: pointer;
  transition: background-color 120ms ease, border-color 120ms ease;
  gap: 6px;
  font-size: 14px;
  &:hover { background: ${p => (p.$active ? "#0f172a" : "#f9fafb")}; }
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    background: #e5e7eb;
    color: #6b7280;
    border-color: #d1d5db;
  }
`;

const SortMenu = styled.div`
  position: absolute;
  top: 40px;
  right: 0;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 10px 20px rgba(0,0,0,0.08);
  overflow: hidden;
  min-width: 180px;
  z-index: 10;
`;

const SortItem = styled.button<{ $active?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: ${p => (p.$active ? "#f3f4f6" : "#ffffff")};
  border: 0;
  cursor: pointer;
  font-size: 14px;
  text-align: left;
  &:hover { background: #f9fafb; }
`;

const LocationNotice = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 12px;
  background: rgba(17, 24, 39, 0.85);
  color: #f3f4f6;
  font-size: 13px;
  backdrop-filter: blur(6px);
`;

const LocationError = styled(LocationNotice)`
  background: rgba(185, 28, 28, 0.92);
  color: #fef2f2;
`;

const LocationBadge = styled(LocationNotice)`
  background: rgba(22, 163, 74, 0.85);
  color: #f0fdf4;
`;

const Resizer = styled.div<{ $mapRatio: number; $visible: boolean }>`
  position: absolute;
  top: 86px;
  bottom: 16px;
  right: ${p => `calc(${(p.$mapRatio * 100).toFixed(3)}vw + 16px)`};
  width: 8px;
  margin-left: -4px;
  cursor: col-resize;
  z-index: 10;
  display: ${p => (p.$visible ? "block" : "none")};
  background: transparent;
  @media (max-width: 768px) {
    display: none;
  }
`;

// Bottom sheet handle (mobile)
const SheetHandle = styled.div<{ $expanded?: boolean }>`
  display: none;
  @media (max-width: 768px) {
    display: block;
    width: 100%;
    padding: 12px 0 8px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    background: #181818;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    transition: background-color 0.15s ease;
    position: relative;
    
    &:hover {
      background: #202020;
    }
    
    &:active {
      background: #161616;
    }
  }
  &::before {
    content: "";
    width: 40px;
    height: 5px;
    border-radius: 999px;
    background: ${p => p.$expanded ? '#6b7280' : '#9ca3af'};
    display: block;
    transition: all 0.15s ease;
    transform: ${p => p.$expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
  }
  
  &:hover::before {
    background: #6b7280;
  }
  
  &::after {
    content: "${p => p.$expanded ? '↓' : '↑'}";
    position: absolute;
    right: 16px;
    font-size: 12px;
    color: #9ca3af;
    transition: color 0.15s ease;
  }
  
  &:hover::after {
    color: #6b7280;
  }
`;

// DB-only rendering. If no data exists, the page will show an empty state.

function formatKRW(n: number) {
  return new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(n);
}

// Helper function to get localized content based on user's language preference
function getLocalizedContent(
  language: string,
  ko?: string,
  en?: string,
  zh?: string,
  ja?: string,
  es?: string,
  fallback?: string
): string {
  switch (language) {
    case 'ko':
      return ko || en || fallback || '';
    case 'en':
      return en || ko || fallback || '';
    case 'zh':
      return zh || en || ko || fallback || '';
    case 'ja':
      return ja || en || ko || fallback || '';
    case 'es':
      return es || en || ko || fallback || '';
    default:
      return en || ko || fallback || '';
  }
}

function useGoogleMaps(apiKey?: string) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!apiKey) return;
    if (window.google && (window as any).google.maps) {
      setLoaded(true);
      return;
    }
    const id = "gmaps-sdk";
    if (document.getElementById(id)) return; // will resolve on first load
    const s = document.createElement("script");
    s.id = id;
    s.async = true;
    s.defer = true;
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=geometry,places`;
    s.onload = () => setLoaded(true);
    s.onerror = () => setLoaded(false);
    document.head.appendChild(s);
  }, [apiKey]);
  return loaded;
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function requestUserLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
    });
  });
}

export default function Locations() {
  const { language } = useI18n();
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  const [places, setPlaces] = useState<Place[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [mapRatio, setMapRatio] = useState<number>(0.4); // 0.4 ~ 0.45 max to prevent expansion beyond cards
  const [mapBounds, setMapBounds] = useState<any>(null);
  const [mapFilteredLocations, setMapFilteredLocations] = useState<LocationDisplayItem[]>([]);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [requestingLocation, setRequestingLocation] = useState(false);
  const [geolocationError, setGeolocationError] = useState<string | null>(null);
  const placesById = useMemo(() => new Map(places.map(p => [p.id, p])), [places]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const listRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [showSort, setShowSort] = useState(false);
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "title-asc" | "title-desc">("price-asc");
  const [showOnlyNearby, setShowOnlyNearby] = useState(false);
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const [lastScrollTop, setLastScrollTop] = useState(0);
  const cardsWrapRef = useRef<HTMLDivElement>(null);
  const lastToggleTsRef = useRef<number>(0);

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapObj = useRef<any>(null);
  const markerMap = useRef<Record<string, any>>({});
  const boundsListenerRef = useRef<any>(null);
  const loaded = useGoogleMaps(apiKey);
  const pastelMapStyles = useRef<any>([
    { elementType: "geometry", stylers: [{ color: "#fffbeb" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#92400e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#ffffff" }] },
    { featureType: "poi", elementType: "geometry", stylers: [{ color: "#fef3c7" }] },
    { featureType: "poi.park", elementType: "geometry.fill", stylers: [{ color: "#fef3c7" }] },
    { featureType: "poi.business", stylers: [{ visibility: "off" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#fef3c7" }] },
    { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#fde68a" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#facc15" }] },
    { featureType: "transit", stylers: [{ visibility: "off" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: "#bae6fd" }] }
  ]);

  const sortedLocations = useMemo(() => {
    const base: LocationDisplayItem[] =
      mapFilteredLocations.length > 0
        ? mapFilteredLocations
        : locations.map(loc => ({ ...loc, distanceKm: undefined }));

    const copy = [...base];

    if (showOnlyNearby) {
      copy.sort((a, b) => {
        const da = a.distanceKm ?? Number.POSITIVE_INFINITY;
        const db = b.distanceKm ?? Number.POSITIVE_INFINITY;
        return da - db;
      });
    }

    if (sortBy === "price-asc") {
      copy.sort((a, b) => a.priceKRW - b.priceKRW);
    } else if (sortBy === "price-desc") {
      copy.sort((a, b) => b.priceKRW - a.priceKRW);
    } else if (sortBy === "title-asc") {
      copy.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      copy.sort((a, b) => b.title.localeCompare(a.title));
    }

    return copy;
  }, [mapFilteredLocations, locations, sortBy, showOnlyNearby]);

  // Fetch from Supabase
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: places, error: placesErr } = await supabase
        .from("places")
        .select("id, region, city, district, postal_code, address_line, place_label, latitude, longitude");
      const { data: locs, error: locsErr } = await supabase
        .from("locations")
        .select(`
          id, title, tagline, image_url, price_krw, activity_level, skill_level, max_guests_total, min_age, place_id,
          title_ko, title_en, title_zh, title_ja, title_es,
          tagline_ko, tagline_en, tagline_zh, tagline_ja, tagline_es
        `);
      if (cancelled) return;
      if (placesErr || locsErr) {
        // Minimal logging to help production debugging
        console.error("Supabase error", { placesErr, locsErr });
      }
      if (places && places.length > 0) {
        const mappedPlaces: Place[] = places.map((p: any) => ({
          id: p.id,
          region: p.region,
          city: p.city,
          district: p.district ?? undefined,
          postalCode: p.postal_code ?? undefined,
          addressLine: p.address_line ?? undefined,
          placeLabel: p.place_label ?? undefined,
          latitude: p.latitude,
          longitude: p.longitude,
        }));
        setPlaces(mappedPlaces);
      }
      if (locs && locs.length > 0) {
        const mappedLocs: LocationItem[] = locs.map((l: any) => ({
          id: l.id,
          title: l.title,
          tagline: l.tagline ?? undefined,
          imageUrl: l.image_url,
          priceKRW: l.price_krw,
          activityLevel: l.activity_level,
          skillLevel: l.skill_level,
          maxGuestsTotal: l.max_guests_total,
          minAge: l.min_age ?? undefined,
          placeId: l.place_id,
          // Localized fields
          titleKo: l.title_ko,
          titleEn: l.title_en,
          titleZh: l.title_zh,
          titleJa: l.title_ja,
          titleEs: l.title_es,
          taglineKo: l.tagline_ko,
          taglineEn: l.tagline_en,
          taglineZh: l.tagline_zh,
          taglineJa: l.tagline_ja,
          taglineEs: l.tagline_es,
        }));
        setLocations(mappedLocs);
        setMapFilteredLocations(mappedLocs.map(loc => ({ ...loc, distanceKm: undefined })));
      }
      if ((places?.length ?? 0) === 0 || (locs?.length ?? 0) === 0) {
        console.log("Supabase fetch counts", { places: places?.length ?? 0, locations: locs?.length ?? 0 });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Initialize map and markers when SDK and data are ready
  const applyBoundsFilter = useCallback(
    (bounds: any, locs: LocationItem[], origin?: { lat: number; lng: number }) => {
      const computeDistance = (place: Place) =>
        origin ? haversineDistance(origin.lat, origin.lng, place.latitude, place.longitude) : undefined;

      if (!window.google) {
        const fallback: LocationDisplayItem[] = locs
          .map(loc => {
            const place = placesById.get(loc.placeId);
            if (!place) return null;
            return { ...loc, distanceKm: computeDistance(place) };
          })
          .filter(Boolean) as LocationDisplayItem[];
        setMapFilteredLocations(fallback);
        return;
      }

      const mapInstance = mapObj.current;
      const filtered: LocationDisplayItem[] = [];

      for (const loc of locs) {
        const place = placesById.get(loc.placeId);
        if (!place) continue;

        const position = new (window as any).google.maps.LatLng(place.latitude, place.longitude);
        const withinBounds = bounds ? bounds.contains(position) : true;

        const marker = markerMap.current[loc.id];
        if (marker) {
          if (marker instanceof (window as any).google.maps.Marker) {
            marker.setMap(withinBounds ? mapInstance : null);
          } else if ("map" in marker) {
            marker.map = withinBounds ? mapInstance : null;
          }
        }

        if (withinBounds) {
          filtered.push({ ...loc, distanceKm: computeDistance(place) });
        }
      }

      setMapFilteredLocations(filtered);
    },
    [placesById]
  );

  useEffect(() => {
    if (!loaded || !mapRef.current || !window.google) return;

    const center = { lat: 37.5665, lng: 126.978 }; // Seoul City Hall
    mapObj.current = new (window as any).google.maps.Map(mapRef.current, {
      center,
      zoom: 12,
      mapId: "d3fault",
      clickableIcons: false,
      disableDefaultUI: true,
      styles: pastelMapStyles.current,
    });

    const map = mapObj.current;

    // Install bounds change listener
    const updateBounds = () => {
      const newBounds = map.getBounds();
      if (newBounds) {
        setMapBounds(newBounds);
        applyBoundsFilter(newBounds, locations, showOnlyNearby ? userPosition ?? undefined : undefined);
      }
    };
    boundsListenerRef.current = map.addListener("idle", updateBounds);

    // Apply initial bounds once map is ready
    updateBounds();

    // Clear previous markers
    markerMap.current = {};

    for (const loc of locations) {
      const place = placesById.get(loc.placeId);
      if (!place) continue;

      const priceText = formatKRW(loc.priceKRW);

      // Prefer AdvancedMarkerElement, fallback to default marker with label
      const markerLib = (window as any).google.maps.marker;
      if (markerLib && markerLib.AdvancedMarkerElement) {
        const el = document.createElement("div");
        el.style.padding = "10px 16px";
        el.style.background = "#000000";
        el.style.borderRadius = "999px";
        el.style.color = "#ffffff";
        el.style.fontSize = "14px";
        el.style.fontWeight = "700";
        el.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        el.style.whiteSpace = "nowrap";
        el.style.textAlign = "center";
        (el.style as any).webkitFontSmoothing = "antialiased";
        (el.style as any).mozOsxFontSmoothing = "grayscale";
        el.textContent = priceText;

        const adv = new markerLib.AdvancedMarkerElement({
          map: mapObj.current,
          position: { lat: place.latitude, lng: place.longitude },
          content: el,
        });
        adv.addListener("click", () => {
          setSelectedId(loc.id);
          listRefs.current[loc.id]?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
        markerMap.current[loc.id] = adv;
      } else {
        // Create a custom pill-shaped marker for fallback
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback to simple marker if canvas is not supported
          const marker = new (window as any).google.maps.Marker({
            map: mapObj.current,
            position: { lat: place.latitude, lng: place.longitude },
            label: { text: priceText, color: "#ffffff", fontSize: "11px", fontWeight: "600" } as any,
          });
          marker.addListener("click", () => {
            setSelectedId(loc.id);
            listRefs.current[loc.id]?.scrollIntoView({ behavior: "smooth", block: "center" });
          });
          markerMap.current[loc.id] = marker;
          continue;
        }
        
        const text = priceText;
        const fontSize = 14;
        const paddingX = 16;
        const paddingY = 10;
        
        // Use device pixel ratio for crisp rendering
        const dpr = window.devicePixelRatio || 1;
        
        // Set font to measure text width
        ctx.font = `700 ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
        const textWidth = ctx.measureText(text).width;
        
        // Calculate dimensions
        const boxWidth = textWidth + (paddingX * 2);
        const boxHeight = fontSize + (paddingY * 2);
        
        // Set canvas size with high DPI support
        canvas.width = boxWidth * dpr;
        canvas.height = boxHeight * dpr;
        canvas.style.width = boxWidth + 'px';
        canvas.style.height = boxHeight + 'px';
        
        // Scale context for high DPI
        ctx.scale(dpr, dpr);
        
        // Enable high-quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Draw rounded rectangle (fully rounded corners)
        ctx.fillStyle = '#000000';
        const radius = boxHeight / 2; // Fully rounded = half the height
        
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(boxWidth - radius, 0);
        ctx.arcTo(boxWidth, 0, boxWidth, radius, radius);
        ctx.lineTo(boxWidth, boxHeight - radius);
        ctx.arcTo(boxWidth, boxHeight, boxWidth - radius, boxHeight, radius);
        ctx.lineTo(radius, boxHeight);
        ctx.arcTo(0, boxHeight, 0, boxHeight - radius, radius);
        ctx.lineTo(0, radius);
        ctx.arcTo(0, 0, radius, 0, radius);
        ctx.closePath();
        ctx.fill();
        
        // Draw text with better font rendering
        ctx.fillStyle = '#ffffff';
        ctx.font = `700 ${fontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, boxWidth / 2, boxHeight / 2);
        
        const fallbackMarker = new (window as any).google.maps.Marker({
          map: mapObj.current,
          position: { lat: place.latitude, lng: place.longitude },
          icon: {
            url: canvas.toDataURL(),
            anchor: new (window as any).google.maps.Point(boxWidth / 2, boxHeight / 2),
            scaledSize: new (window as any).google.maps.Size(boxWidth, boxHeight)
          } as any,
        });
        fallbackMarker.addListener("click", () => {
          setSelectedId(loc.id);
          listRefs.current[loc.id]?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
        markerMap.current[loc.id] = fallbackMarker;
      }
    }
    return () => {
      if (boundsListenerRef.current) {
        (window as any).google.maps.event.removeListener(boundsListenerRef.current);
        boundsListenerRef.current = null;
      }
    };
  }, [loaded, placesById, locations, applyBoundsFilter]);

  useEffect(() => {
    if (!mapObj.current || !window.google) {
      setMapFilteredLocations(locations.map(loc => ({ ...loc, distanceKm: undefined })));
      return;
    }
    const map = mapObj.current;
    const bounds = map.getBounds();
    if (bounds) {
      setMapBounds(bounds);
      applyBoundsFilter(bounds, locations, showOnlyNearby ? userPosition ?? undefined : undefined);
    } else {
      setMapFilteredLocations(locations.map(loc => ({ ...loc, distanceKm: undefined })));
    }
  }, [locations, applyBoundsFilter, showOnlyNearby, userPosition]);

  useEffect(() => {
    if (!showOnlyNearby || userPosition || requestingLocation || geolocationError) return;

    setRequestingLocation(true);
    requestUserLocation()
      .then(position => {
        const coords = position.coords;
        const next = { lat: coords.latitude, lng: coords.longitude };
        setUserPosition(next);
        setRequestingLocation(false);
        setGeolocationError(null);

        if (mapBounds) {
          applyBoundsFilter(mapBounds, locations, next);
        }
      })
      .catch(err => {
        setRequestingLocation(false);
        setGeolocationError(err.message || "Unable to retrieve location");
      });
  }, [showOnlyNearby, userPosition, requestingLocation, geolocationError, locations, mapBounds, applyBoundsFilter]);

  const handleToggleNearby = () => {
    setShowOnlyNearby(prev => {
      const next = !prev;
      if (!next) {
        // Reset geolocation filters
        setUserPosition(null);
        setGeolocationError(null);
        setRequestingLocation(false);
        // Reapply filtering without distances
        if (mapBounds) {
          applyBoundsFilter(mapBounds, locations);
        } else {
          setMapFilteredLocations(locations.map(loc => ({ ...loc, distanceKm: undefined })));
        }
      }
      return next;
    });
  };

  // Focus selected marker
  useEffect(() => {
    if (!selectedId || !mapObj.current) return;
    const loc = locations.find(l => l.id === selectedId);
    const place = loc ? placesById.get(loc.placeId) : undefined;
    if (!place) return;
    mapObj.current.panTo({ lat: place.latitude, lng: place.longitude });
    mapObj.current.setZoom(14);
  }, [selectedId, placesById, locations]);

  // Auto-expand/contract bottom sheet based on scroll direction
  useEffect(() => {
    const cardsWrap = cardsWrapRef.current;
    if (!cardsWrap) return;

    const handleScroll = () => {
      const scrollTop = cardsWrap.scrollTop;
      const scrollDirection = scrollTop > lastScrollTop ? 'down' : 'up';
      
      // Only trigger on mobile
      if (window.innerWidth <= 768) {
        if (scrollDirection === 'down' && scrollTop > 30 && !sheetExpanded) {
          // Expand sheet when scrolling down within the list to browse more
          setSheetExpanded(true);
          if ('vibrate' in navigator) navigator.vibrate(50);
        } else if (scrollDirection === 'up' && scrollTop < 80 && sheetExpanded) {
          // Contract sheet when scrolling up near the top (intent to see more map)
          setSheetExpanded(false);
          if ('vibrate' in navigator) navigator.vibrate(30);
        }
      }
      
      setLastScrollTop(scrollTop);
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    cardsWrap.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    return () => {
      cardsWrap.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [lastScrollTop, sheetExpanded]);

  // Reset sheet expansion on desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768 && sheetExpanded) {
        setSheetExpanded(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sheetExpanded]);

  // Global gesture detection (touch/wheel) to expand/collapse anywhere on screen (mobile only)
  useEffect(() => {
    if (window.innerWidth > 768) return;

    const cooldownMs = 500;
    const canToggle = () => Date.now() - lastToggleTsRef.current > cooldownMs;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) < 10) return;
      if (e.deltaY > 0 && !sheetExpanded && canToggle()) {
        // Wheel down → expand to browse more
        setSheetExpanded(true);
        lastToggleTsRef.current = Date.now();
        if ('vibrate' in navigator) navigator.vibrate(50);
      } else if (e.deltaY < 0 && sheetExpanded && canToggle()) {
        // Wheel up near top → collapse to reveal more map
        const top = cardsWrapRef.current?.scrollTop ?? 0;
        if (top <= 10) {
          setSheetExpanded(false);
          lastToggleTsRef.current = Date.now();
          if ('vibrate' in navigator) navigator.vibrate(30);
        }
      }
    };

    const touchStart = { y: 0, active: false } as { y: number; active: boolean };

    const onTouchStart = (e: TouchEvent) => {
      touchStart.y = e.touches[0].clientY;
      touchStart.active = true;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!touchStart.active) return;
      const dy = e.touches[0].clientY - touchStart.y; // down is positive, up is negative
      if (Math.abs(dy) < 20) return;
      if (dy > 0 && !sheetExpanded && canToggle()) {
        // Swipe down → expand
        setSheetExpanded(true);
        lastToggleTsRef.current = Date.now();
        if ('vibrate' in navigator) navigator.vibrate(50);
      } else if (dy < 0 && sheetExpanded && canToggle()) {
        // Swipe up near top → collapse
        const top = cardsWrapRef.current?.scrollTop ?? 0;
        if (top <= 10) {
          setSheetExpanded(false);
          lastToggleTsRef.current = Date.now();
          if ('vibrate' in navigator) navigator.vibrate(30);
        }
      }
    };
    const onTouchEnd = () => {
      touchStart.active = false;
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [sheetExpanded]);

  return (
    <Background>
      <Container $expanded={expanded}>
      <MapPane $expanded={expanded} $mapRatio={mapRatio}>
        <MapControls>
          <ControlButton onClick={() => { if (mapObj.current) mapObj.current.setZoom(Math.min((mapObj.current.getZoom?.() ?? 12) + 1, 20)); }} aria-label="Zoom in">
            <PlusIcon width={18} height={18} color="#111827" />
          </ControlButton>
          <ControlButton onClick={() => { if (mapObj.current) mapObj.current.setZoom(Math.max((mapObj.current.getZoom?.() ?? 12) - 1, 3)); }} aria-label="Zoom out">
            <MinusIcon width={18} height={18} color="#111827" />
          </ControlButton>
          <ControlButton onClick={() => setExpanded(v => !v)} aria-label="Toggle expand">
            {expanded ? (
              <ArrowsPointingInIcon width={18} height={18} color="#111827" />
            ) : (
              <ArrowsPointingOutIcon width={18} height={18} color="#111827" />
            )}
          </ControlButton>
          <ControlButton onClick={handleToggleNearby} aria-label="Toggle nearby filter" disabled={requestingLocation}>
            <MapPinIcon width={18} height={18} color="#111827" />
          </ControlButton>
        </MapControls>

        {requestingLocation && (
          <LoadingOverlay>
            <MapPinIcon width={16} height={16} color="#f3f4f6" />
            Locating you…
          </LoadingOverlay>
        )}
        <MapDiv ref={mapRef} />
      </MapPane>
      <Resizer
        $mapRatio={mapRatio}
        $visible={!expanded}
        onMouseDown={(e) => {
          if (expanded) return;
          const startX = e.clientX;
          const startRatio = mapRatio;
          const onMove = (ev: MouseEvent) => {
            const delta = startX - ev.clientX;
            // viewport 기준으로 근사치 변환: 1920px 화면 기준 1vw ≈ 19.2px
            const pxPerVw = Math.max(window.innerWidth, 320) / 100;
            const deltaRatio = (delta / (pxPerVw * 100));
            const next = Math.min(Math.max(startRatio + deltaRatio, 0.4), 0.45);
            setMapRatio(next);
          };
          const onUp = () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
          };
          window.addEventListener("mousemove", onMove);
          window.addEventListener("mouseup", onUp);
        }}
      />
      <ListPane $expanded={expanded} $mapRatio={mapRatio} $sheetExpanded={sheetExpanded}>
        <SheetHandle $expanded={sheetExpanded} onClick={() => setSheetExpanded(v => !v)} />
        <ListHeader>
          <div>
            <div style={{ fontWeight: 700, color: "#ffffff" }}>Look through 100+ locations</div>
          </div>
          <ControlsBar>
            <FilterButton onClick={handleToggleNearby} $active={showOnlyNearby} disabled={requestingLocation}>
              <MapPinIcon width={18} height={18} color={showOnlyNearby ? "#ffffff" : "#111827"} />
              Nearby
            </FilterButton>
            <div style={{ position: 'relative' }}>
              <FilterButton onClick={() => setShowSort(v => !v)} aria-label="Filter & Sort">
                Sort
                <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ width: 16, height: 16, marginLeft: 6 }}>
                  <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.09 1.03l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.26a.75.75 0 01.02-1.06z" fill="#6b7280" />
                </svg>
              </FilterButton>
              {showSort && (
                <SortMenu>
                  <SortItem $active={sortBy === 'price-asc'} onClick={() => { setSortBy('price-asc'); setShowSort(false); }}>Price: Low to High</SortItem>
                  <SortItem $active={sortBy === 'price-desc'} onClick={() => { setSortBy('price-desc'); setShowSort(false); }}>Price: High to Low</SortItem>
                  <SortItem $active={sortBy === 'title-asc'} onClick={() => { setSortBy('title-asc'); setShowSort(false); }}>Title: A → Z</SortItem>
                  <SortItem $active={sortBy === 'title-desc'} onClick={() => { setSortBy('title-desc'); setShowSort(false); }}>Title: Z → A</SortItem>
                </SortMenu>
              )}
            </div>
            <ViewSwitch>
              <ViewBtn onClick={() => setViewMode("list")} $active={viewMode === "list"} aria-label="List view">
                <Bars3Icon width={18} height={18} color={viewMode === "list" ? "#111827" : "#6b7280"} />
              </ViewBtn>
              <ViewBtn onClick={() => setViewMode("grid")} $active={viewMode === "grid"} aria-label="Grid view">
                <Squares2X2Icon width={18} height={18} color={viewMode === "grid" ? "#111827" : "#6b7280"} />
              </ViewBtn>
            </ViewSwitch>
          </ControlsBar>
        </ListHeader>

        {showOnlyNearby && geolocationError && (
          <LocationError>
            <MapPinIcon width={16} height={16} color="#fef2f2" />
            {geolocationError}
          </LocationError>
        )}
        {showOnlyNearby && userPosition && !geolocationError && (
          <LocationBadge>
            <MapPinIcon width={16} height={16} color="#f0fdf4" />
            Showing places near you
          </LocationBadge>
        )}

        {!apiKey && (
          <Notice>
            Set VITE_GOOGLE_MAPS_API_KEY in your environment to view the map. The list still works.
          </Notice>
        )}

        <CardsWrap ref={cardsWrapRef}>
        {sortedLocations.length === 0 ? (
          <Notice>등록된 체험이 없습니다. Supabase에 시드 데이터를 추가해 주세요.</Notice>
        ) : (
        <Cards $mode={viewMode}>
          {sortedLocations.map((loc) => {
            const place = placesById.get(loc.placeId);
            // Use localized title
            const localizedTitle = getLocalizedContent(
              language,
              loc.titleKo,
              loc.titleEn,
              loc.titleZh,
              loc.titleJa,
              loc.titleEs,
              loc.title
            );
            const service = {
              id: Number(loc.id) || 0,
              title: localizedTitle,
              price: new Intl.NumberFormat("ko-KR", { style: "currency", currency: "KRW", maximumFractionDigits: 0 }).format(loc.priceKRW),
              rating: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
              image: loc.imageUrl,
            };
            return (
              <ServiceCardWrap
                key={loc.id}
                ref={(el) => { listRefs.current[loc.id] = el; }}
                onClick={() => {
                  setSelectedId(loc.id);
                  window.open(`/business/${loc.id}`, '_blank');
                }}
                $active={selectedId === loc.id}
              >
                {showOnlyNearby && loc.distanceKm !== undefined && (
                  <DistanceBadge>
                    {loc.distanceKm.toFixed(1)} km
                  </DistanceBadge>
                )}
                <ServiceCard service={service} variant="popular" />
              </ServiceCardWrap>
            );
          })}
        </Cards>
        )}
        </CardsWrap>
      </ListPane>
    </Container>
    </Background>
  );
}


