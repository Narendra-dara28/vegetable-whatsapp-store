import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, XCircle, Clock, CheckCircle, Search, Package } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Map Tile Provider Configuration (Single constant for easily swapping provider)
export const MAP_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const MAP_TILE_ATTRIBUTION = '© OpenStreetMap contributors';

// Default center: APHB Colony, Nellore (matching user location in screenshots)
const DEFAULT_CENTER = { lat: 14.3862, lng: 79.9543 };
const DEFAULT_LOCALITY = 'APHB Colony, Kalluripalli, Nellore, Andhra Pradesh';


// Popular Nellore locations for 1-tap quick navigation
const NELLORE_QUICK_AREAS = [
  { name: 'APHB Colony', lat: 14.3862, lng: 79.9543 },
  { name: 'Kallurpalle', lat: 14.3940, lng: 79.9610 },
  { name: 'Magunta Layout', lat: 14.4320, lng: 79.9730 },
  { name: 'Vedayapalem', lat: 14.4150, lng: 79.9670 },
  { name: 'Dargamitta', lat: 14.4390, lng: 79.9810 },
  { name: 'Gandhi Nagar', lat: 14.4480, lng: 79.9890 },
  { name: 'Podalakur Road', lat: 14.4260, lng: 79.9590 },
];

export const LocationPickerModal = ({ isOpen, onClose, onSaveAddress, initialAddress = null }) => {
  // Step 1: 'map' (interactive map with pin) | Step 2: 'details' (flat/house no + receiver)
  const [step, setStep] = useState('map');

  // Map state
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const debounceTimerRef = useRef(null);

  const [coords, setCoords] = useState(() => ({
    lat: initialAddress?.lat || DEFAULT_CENTER.lat,
    lng: initialAddress?.lng || DEFAULT_CENTER.lng,
  }));

  const [locality, setLocality] = useState(initialAddress?.locality || DEFAULT_LOCALITY);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsNotice, setGpsNotice] = useState('');

  // Address Form Details (Swiggy Image 4/5 style)
  const [tag, setTag] = useState(initialAddress?.tag || 'House');
  const [houseNo, setHouseNo] = useState(initialAddress?.houseNo || '');
  const [floorNo, setFloorNo] = useState(initialAddress?.floorNo || '');
  const [building, setBuilding] = useState(initialAddress?.building || '');
  const [deliveryInstruction, setDeliveryInstruction] = useState(initialAddress?.deliveryInstruction || '');
  const [receiverName, setReceiverName] = useState(initialAddress?.name || '');
  const [receiverPhone, setReceiverPhone] = useState(initialAddress?.phone || '');
  const [formError, setFormError] = useState('');

  // Reset or initialize state when opening
  useEffect(() => {
    if (isOpen) {
      if (initialAddress) {
        setCoords({
          lat: initialAddress.lat || DEFAULT_CENTER.lat,
          lng: initialAddress.lng || DEFAULT_CENTER.lng,
        });
        setLocality(initialAddress.locality || DEFAULT_LOCALITY);
        setTag(initialAddress.tag || 'House');
        setHouseNo(initialAddress.houseNo || '');
        setFloorNo(initialAddress.floorNo || '');
        setBuilding(initialAddress.building || '');
        setDeliveryInstruction(initialAddress.deliveryInstruction || '');
        setReceiverName(initialAddress.name || '');
        setReceiverPhone(initialAddress.phone || '');
      } else {
        // Check for remembered customer name and phone
        try {
          const profile = localStorage.getItem('greenbasket_customer');
          if (profile) {
            const p = JSON.parse(profile);
            if (p.name && !receiverName) setReceiverName(p.name);
            if (p.phone && !receiverPhone) setReceiverPhone(p.phone);
          }
        } catch {
          // ignore
        }
      }
      setStep('map');
      setFormError('');
      setGpsNotice('');
    }
  }, [isOpen, initialAddress]);

  // Reverse geocode lat/lng to human locality
  const reverseGeocode = useCallback(async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      if (res.ok) {
        const data = await res.json();
        const a = data.address || {};
        const parts = [
          a.road,
          a.quarter || a.suburb || a.neighbourhood || a.residential,
          a.village || a.city || a.town || a.county,
          a.state,
        ].filter(Boolean);

        const text = parts.join(', ') || data.display_name?.split(',').slice(0, 4).join(',') || `Nellore (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
        setLocality(text);
      }
    } catch {
      setLocality(`Nellore Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    }
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (!isOpen || step !== 'map') return;

    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false,
        }).setView([coords.lat, coords.lng], 16);

        // OpenStreetMap clean tile layer (watermark free)
        L.tileLayer(MAP_TILE_URL, {
          maxZoom: 19,
          attribution: MAP_TILE_ATTRIBUTION,
        }).addTo(map);

        // Attribution at bottom left
        L.control.attribution({ position: 'bottomleft', prefix: false }).addTo(map);

        // Zoom control at top-right (positioned below search bar)
        L.control.zoom({ position: 'topright' }).addTo(map);

        // Center pin drag/move event
        map.on('moveend', () => {
          const center = map.getCenter();
          const newCoords = { lat: center.lat, lng: center.lng };
          setCoords(newCoords);

          if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = setTimeout(() => {
            reverseGeocode(center.lat, center.lng);
          }, 350);
        });

        mapInstanceRef.current = map;
        reverseGeocode(coords.lat, coords.lng);
      } else {
        mapInstanceRef.current.invalidateSize();
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [isOpen, step, coords.lat, coords.lng, reverseGeocode]);

  // Clean up map instance on modal unmount
  useEffect(() => {
    if (!isOpen && mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
  }, [isOpen]);

  // Handle Search input
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    try {
      setSearching(true);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query + ' Nellore'
        )}&countrycodes=in&limit=5`
      );
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
        setShowResults(true);
      }
    } catch {
      // ignore
    } finally {
      setSearching(false);
    }
  };

  // Select search result
  const handleSelectSearchResult = (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setCoords({ lat, lng });
    setLocality(result.display_name.split(',').slice(0, 4).join(', '));
    setShowResults(false);
    setSearchQuery('');

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([lat, lng], 17, { duration: 1.2 });
    }
  };

  // Fly to Quick Nellore Area
  const handleQuickAreaSelect = (area) => {
    setCoords({ lat: area.lat, lng: area.lng });
    setLocality(`${area.name}, Nellore, Andhra Pradesh`);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([area.lat, area.lng], 17, { duration: 1.0 });
    }
  };

  // Use Current Location with clear HTTP/HTTPS awareness
  const handleUseCurrentLocation = () => {
    setGpsNotice('');

    // Check if insecure context on mobile IP (http://192.168.x.x)
    const isHttpLocal = window.location.protocol === 'http:' && window.location.hostname !== 'localhost';

    if (!navigator.geolocation) {
      setGpsNotice('Geolocation not supported by this browser. Please search or drag the pin.');
      return;
    }

    setGpsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([lat, lng], 17, { duration: 1.2 });
        }
        reverseGeocode(lat, lng);
      },
      (err) => {
        setGpsLoading(false);
        if (isHttpLocal) {
          setGpsNotice(
            'Mobile browsers disable GPS on local Wi-Fi test (http://192.168.x.x). When deployed on HTTPS (Vercel), GPS detects automatically! For now, tap a quick area chip below or drag the pin.'
          );
        } else if (err.code === 1) {
          setGpsNotice('Location permission denied in browser. Please search your area or drag the pin.');
        } else {
          setGpsNotice('Could not get GPS fix. Please search your area or drag the pin.');
        }
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  // Proceed from Map to Details
  const handleConfirmLocation = () => {
    setFormError('');
    setStep('details');
  };

  // Save complete address and pass to CartDrawer
  const handleSaveFullAddress = (e) => {
    e.preventDefault();
    setFormError('');

    if (!houseNo.trim()) {
      setFormError('Please enter House / Flat Number.');
      return;
    }
    if (!receiverName.trim()) {
      setFormError('Please enter Receiver Name.');
      return;
    }
    const cleanedPhone = receiverPhone.replace(/\D/g, '');
    if (!cleanedPhone || cleanedPhone.length < 10) {
      setFormError('Please enter a valid 10-digit WhatsApp number.');
      return;
    }

    // Build formatted structured address
    const fullAddressParts = [
      houseNo.trim(),
      floorNo.trim() ? `Floor: ${floorNo.trim()}` : null,
      building.trim(),
      locality.trim(),
    ].filter(Boolean);

    const fullAddress = fullAddressParts.join(', ');
    const locationUrl = `https://maps.google.com/?q=${coords.lat.toFixed(6)},${coords.lng.toFixed(6)}`;

    const savedData = {
      tag,
      houseNo: houseNo.trim(),
      floorNo: floorNo.trim(),
      building: building.trim(),
      locality: locality.trim(),
      fullAddress,
      deliveryInstruction: deliveryInstruction.trim(),
      name: receiverName.trim(),
      phone: cleanedPhone.slice(-10),
      lat: coords.lat,
      lng: coords.lng,
      locationUrl,
    };

    // Save to localStorage so future orders never need the map again
    try {
      localStorage.setItem('greenbasket_saved_address', JSON.stringify(savedData));
      localStorage.setItem('greenbasket_customer', JSON.stringify({
        name: savedData.name,
        phone: savedData.phone,
        address: savedData.fullAddress,
        locationUrl: savedData.locationUrl,
      }));
    } catch {
      // ignore
    }

    onSaveAddress(savedData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1050,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          height: '100vh',
          maxHeight: '100vh',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* ================= STEP 1: INTERACTIVE MAP PIN (Swiggy Image 3/5) ================= */}
        {step === 'map' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
            <style>{`
              .leaflet-top.leaflet-right {
                top: 118px !important;
                right: 12px !important;
                z-index: 500 !important;
              }
              .leaflet-control-zoom {
                border: 1px solid #cbd5e1 !important;
                border-radius: 10px !important;
                overflow: hidden !important;
                box-shadow: 0 4px 12px rgba(0,0,0,0.12) !important;
              }
              .leaflet-control-zoom a {
                width: 36px !important;
                height: 36px !important;
                line-height: 36px !important;
                color: #1f2937 !important;
                font-size: 16px !important;
              }
            `}</style>
            {/* Top Search & Nav Header */}
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                right: '12px',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  padding: '8px 12px',
                  boxShadow: '0 4px 15px rgba(0, 0, 0, 0.12)',
                  border: '1px solid #e2e8f0',
                }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    background: 'none',
                    border: 'none',
                    minWidth: '44px',
                    minHeight: '44px',
                    cursor: 'pointer',
                    color: 'var(--color-text-main, #1F2937)',
                    padding: '0 4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Close"
                >
                  <XCircle size={20} strokeWidth={1.75} />
                </button>

                <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                  <Search size={20} strokeWidth={1.75} style={{ marginRight: '8px', color: 'var(--color-text-muted, #6B7280)', flexShrink: 0 }} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search area, street name in Nellore..."
                    style={{
                      width: '100%',
                      border: 'none',
                      outline: 'none',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                      color: 'var(--color-text-main, #1F2937)',
                      backgroundColor: 'transparent',
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setShowResults(false);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-muted, #6B7280)',
                        cursor: 'pointer',
                        minWidth: '44px',
                        minHeight: '44px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <XCircle size={16} strokeWidth={1.75} />
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Area Chips for 1-Tap Navigation */}
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  overflowX: 'auto',
                  paddingBottom: '2px',
                  scrollbarWidth: 'none',
                }}
              >
                {NELLORE_QUICK_AREAS.map((area) => (
                  <button
                    key={area.name}
                    type="button"
                    onClick={() => handleQuickAreaSelect(area)}
                    style={{
                      whiteSpace: 'nowrap',
                      padding: '8px 14px',
                      minHeight: '44px',
                      borderRadius: 'var(--radius-full, 9999px)',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      color: 'var(--color-primary-dark, #166534)',
                      border: '1px solid var(--color-primary, #16A34A)',
                      boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <MapPin size={16} strokeWidth={1.75} style={{ color: 'var(--color-primary, #16A34A)' }} />
                    <span>{area.name}</span>
                  </button>
                ))}
              </div>

              {/* Search Suggestions Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '14px',
                    boxShadow: 'var(--shadow-lg, 0 10px 15px -3px rgba(0, 0, 0, 0.1))',
                    border: '1px solid var(--color-border, #E5E7EB)',
                    overflow: 'hidden',
                    maxHeight: '220px',
                    overflowY: 'auto',
                  }}
                >
                  {searchResults.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectSearchResult(item)}
                      style={{
                        padding: '12px 14px',
                        minHeight: '44px',
                        borderBottom: idx !== searchResults.length - 1 ? '1px solid var(--color-border, #E5E7EB)' : 'none',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                        backgroundColor: '#ffffff',
                        transition: 'background-color 0.15s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg, #F8FAF5)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
                    >
                      <MapPin size={16} strokeWidth={1.75} style={{ marginTop: '2px', color: 'var(--color-primary, #16A34A)', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '700', color: 'var(--color-text-main, #1F2937)' }}>
                          {item.display_name.split(',')[0]}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted, #6B7280)', marginTop: '2px' }}>
                          {item.display_name.split(',').slice(1, 4).join(', ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Map Canvas */}
            <div
              ref={mapContainerRef}
              style={{
                flex: 1,
                width: '100%',
                height: '100%',
                backgroundColor: '#f1f5f9',
                zIndex: 1,
              }}
            />

            {/* Anchored Center Pin Marker with Floating Tooltip (Swiggy Style Image 3 & 5) */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -100%)',
                zIndex: 500,
                pointerEvents: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              {/* Tooltip bubble */}
              <div
                style={{
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                  whiteSpace: 'nowrap',
                  marginBottom: '6px',
                  letterSpacing: '0.01em',
                }}
              >
                Move pin to your exact delivery location
              </div>

              {/* Pin SVG with Red/Orange Accent */}
              <svg width="44" height="48" viewBox="0 0 36 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M18 0C8.05887 0 0 8.05887 0 18C0 27.5 14.5 38.5 17.1 40.4C17.6 40.8 18.4 40.8 18.9 40.4C21.5 38.5 36 27.5 36 18C36 8.05887 27.9411 0 18 0Z"
                  fill="#ea580c"
                />
                <circle cx="18" cy="17" r="7" fill="#ffffff" />
                <circle cx="18" cy="17" r="4" fill="#ea580c" />
              </svg>

              {/* Pin Shadow */}
              <div
                style={{
                  width: '14px',
                  height: '4px',
                  backgroundColor: 'rgba(0, 0, 0, 0.35)',
                  borderRadius: '50%',
                  filter: 'blur(1px)',
                  marginTop: '-2px',
                }}
              />
            </div>

            {/* Floating "Use Current Location" Button */}
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={gpsLoading}
              style={{
                position: 'absolute',
                bottom: '185px',
                right: '16px',
                zIndex: 600,
                backgroundColor: '#ffffff',
                border: '1.5px solid var(--color-primary, #16A34A)',
                borderRadius: 'var(--radius-full, 9999px)',
                padding: '10px 16px',
                minHeight: '44px',
                boxShadow: 'var(--shadow-md, 0 4px 6px -1px rgba(0, 0, 0, 0.1))',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontSize: '0.84rem',
                fontWeight: '700',
                color: 'var(--color-primary-dark, #166534)',
              }}
            >
              {gpsLoading ? <Clock size={20} strokeWidth={1.75} /> : <MapPin size={20} strokeWidth={1.75} />}
              <span>{gpsLoading ? 'Locating...' : 'Use current location'}</span>
            </button>

            {/* GPS Notice / Helper Banner */}
            {gpsNotice && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '180px',
                  left: '16px',
                  right: '16px',
                  zIndex: 700,
                  backgroundColor: 'var(--color-accent-light, #FFEDD5)',
                  border: '1px solid var(--color-accent, #F97316)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  fontSize: '0.78rem',
                  color: '#9a3412',
                  boxShadow: 'var(--shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1))',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                }}
              >
                <Clock size={16} strokeWidth={1.75} style={{ flexShrink: 0, marginTop: '2px', color: '#9a3412' }} />
                <span style={{ flex: 1, lineHeight: 1.35 }}>{gpsNotice}</span>
                <button
                  type="button"
                  onClick={() => setGpsNotice('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9a3412',
                    cursor: 'pointer',
                    minWidth: '44px',
                    minHeight: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '-10px -10px -10px 0',
                  }}
                >
                  <XCircle size={16} strokeWidth={1.75} />
                </button>
              </div>
            )}

            {/* Bottom Sheet - Locality & Confirm Button */}
            <div
              style={{
                zIndex: 500,
                backgroundColor: '#ffffff',
                borderTopLeftRadius: 'var(--radius-xl, 24px)',
                borderTopRightRadius: 'var(--radius-xl, 24px)',
                padding: '20px 18px',
                paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))',
                boxShadow: '0 -10px 25px rgba(0, 0, 0, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--color-primary-light, #DCFCE7)',
                    color: 'var(--color-primary-dark, #166534)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <MapPin size={20} strokeWidth={1.75} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--color-primary, #16A34A)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Delivery Details
                  </div>
                  <div
                    style={{
                      fontSize: '0.98rem',
                      fontWeight: '800',
                      color: 'var(--color-text-main, #1F2937)',
                      marginTop: '2px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {locality.split(',')[0] || 'Selected Locality'}
                  </div>
                  <div
                    style={{
                      fontSize: '0.76rem',
                      color: 'var(--color-text-muted, #6B7280)',
                      marginTop: '2px',
                      lineHeight: 1.35,
                    }}
                  >
                    {locality.split(',').slice(1).join(', ') || 'Nellore, Andhra Pradesh, India'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmLocation}
                style={{
                  width: '100%',
                  minHeight: '48px',
                  padding: '14px',
                  borderRadius: 'var(--radius-md, 12px)',
                  fontSize: '0.98rem',
                  fontWeight: '800',
                  letterSpacing: '0.02em',
                  color: '#ffffff',
                  backgroundColor: 'var(--color-primary, #16A34A)',
                  backgroundImage: 'linear-gradient(135deg, var(--color-primary, #16A34A), var(--color-primary-dark, #166534))',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
                  transition: 'transform 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <span>Confirm & Proceed</span>
                <CheckCircle size={16} strokeWidth={1.75} />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: ADDRESS DETAILS FORM (Swiggy Image 4) ================= */}
        {step === 'details' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Header */}
            <div
              style={{
                padding: '16px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                backgroundColor: '#ffffff',
              }}
            >
              <button
                type="button"
                onClick={() => setStep('map')}
                style={{
                  background: 'none',
                  border: 'none',
                  minWidth: '44px',
                  minHeight: '44px',
                  cursor: 'pointer',
                  color: 'var(--color-text-main, #1F2937)',
                  padding: '0 4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title="Back to map"
              >
                <XCircle size={20} strokeWidth={1.75} />
              </button>
              <h2 style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--color-text-main, #1F2937)' }}>
                Location Details
              </h2>
            </div>

            {/* Scrollable Form Body */}
            <form
              onSubmit={handleSaveFullAddress}
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '18px 16px',
                paddingBottom: 'calc(18px + env(safe-area-inset-bottom, 0px))',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              {formError && (
                <div
                  style={{
                    padding: '10px 12px',
                    backgroundColor: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: 'var(--radius-sm, 8px)',
                    color: 'var(--color-danger, #DC2626)',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <XCircle size={16} strokeWidth={1.75} />
                  <span>{formError}</span>
                </div>
              )}

              {/* Tag Selector: House | Office | Other (Swiggy Image 4) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: 'var(--color-text-muted, #6B7280)', marginBottom: '6px' }}>
                  Save address as *
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {['House', 'Office', 'Other'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTag(t)}
                      style={{
                        flex: 1,
                        padding: '10px 12px',
                        minHeight: '44px',
                        borderRadius: 'var(--radius-md, 12px)',
                        border: tag === t ? '2px solid var(--color-primary, #16A34A)' : '1px solid var(--color-border, #E5E7EB)',
                        backgroundColor: tag === t ? 'var(--color-primary-light, #DCFCE7)' : '#ffffff',
                        color: tag === t ? 'var(--color-primary-dark, #166534)' : 'var(--color-text-main, #1F2937)',
                        fontWeight: '700',
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {t === 'House' ? <Package size={16} strokeWidth={1.75} /> : t === 'Office' ? <Package size={16} strokeWidth={1.75} /> : <MapPin size={16} strokeWidth={1.75} />}
                      <span>{t}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* House / Flat Number (Image 4) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  House / Flat Number *
                </label>
                <input
                  type="text"
                  value={houseNo}
                  onChange={(e) => setHouseNo(e.target.value)}
                  placeholder="e.g. Flat 204 / Door 14-2-120"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                  }}
                />
              </div>

              {/* Floor Number (Image 4) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Floor Number
                </label>
                <input
                  type="text"
                  value={floorNo}
                  onChange={(e) => setFloorNo(e.target.value)}
                  placeholder="e.g. 2nd Floor / Ground Floor"
                  style={{
                    width: '100%',
                    padding: '11px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                  }}
                />
              </div>

              {/* Building / Street (Recommended) (Image 4) */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Building / Street (Recommended)
                </label>
                <input
                  type="text"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  placeholder="e.g. Sri Balaji Towers, Near Ram Mandir"
                  style={{
                    width: '100%',
                    padding: '11px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                  }}
                />
              </div>

              {/* Area / Locality preview with Edit Button (Image 4) */}
              <div
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase' }}>
                    Area / Locality (From Map Pin)
                  </div>
                  <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#0f172a', marginTop: '2px', lineHeight: 1.3 }}>
                    {locality}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('map')}
                  style={{
                    backgroundColor: 'var(--color-primary-light, #DCFCE7)',
                    border: '1.5px solid var(--color-primary, #16A34A)',
                    color: 'var(--color-primary-dark, #166534)',
                    padding: '8px 14px',
                    minHeight: '44px',
                    borderRadius: 'var(--radius-md, 12px)',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <MapPin size={16} strokeWidth={1.75} />
                  <span>Edit</span>
                </button>
              </div>

              <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '4px 0' }} />

              {/* Receiver Details */}
              <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0f172a' }}>
                Receiver Details
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Receiver Name *
                </label>
                <input
                  type="text"
                  value={receiverName}
                  onChange={(e) => setReceiverName(e.target.value)}
                  placeholder="e.g. Siva"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  WhatsApp Mobile Number *
                </label>
                <input
                  type="tel"
                  value={receiverPhone}
                  onChange={(e) => setReceiverPhone(e.target.value)}
                  placeholder="10-digit mobile number"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.9rem',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                  }}
                />
              </div>

              {/* Instructions to reach location */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: '700', color: '#334155', marginBottom: '4px' }}>
                  Instructions to reach location (Optional)
                </label>
                <input
                  type="text"
                  value={deliveryInstruction}
                  onChange={(e) => setDeliveryInstruction(e.target.value)}
                  placeholder="e.g. Leave at door, Call on arrival"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.86rem',
                    outline: 'none',
                    backgroundColor: '#ffffff',
                  }}
                />
              </div>

              {/* Save Address Button */}
              <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    minHeight: '48px',
                    padding: '14px',
                    borderRadius: 'var(--radius-md, 12px)',
                    fontSize: '0.98rem',
                    fontWeight: '800',
                    color: '#ffffff',
                    backgroundColor: 'var(--color-primary, #16A34A)',
                    backgroundImage: 'linear-gradient(135deg, var(--color-primary, #16A34A), var(--color-primary-dark, #166534))',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  <span>Save Address & Proceed</span>
                  <CheckCircle size={18} strokeWidth={1.75} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationPickerModal;
