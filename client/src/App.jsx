import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function ChangeView({ center, zoom }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);

  return null;
}

function ResizeMap({ isMenuOpen, isDesktop }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => clearTimeout(timer);
  }, [map, isMenuOpen, isDesktop]);

  return null;
}

function MapView({ selectedSiteData, isMenuOpen, isDesktop }) {
  const latitude = Number(selectedSiteData?.latitude);
  const longitude = Number(selectedSiteData?.longitude);
  const zoomValue = Number(selectedSiteData?.zoom);

  const hasValidCoords =
    !Number.isNaN(latitude) &&
    !Number.isNaN(longitude) &&
    latitude !== 0 &&
    longitude !== 0;

  const center = hasValidCoords ? [latitude, longitude] : [43.2965, 5.3698];
  const zoom = !Number.isNaN(zoomValue) && zoomValue > 0 ? zoomValue : 12;

  return (
    <div className="mapContainer">
      <MapContainer center={center} zoom={zoom} className="leafletMap">
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ChangeView center={center} zoom={zoom} />
        <ResizeMap isMenuOpen={isMenuOpen} isDesktop={isDesktop} />

        {hasValidCoords && (
          <Marker position={[latitude, longitude]}>
            <Popup>{selectedSiteData?.lib_site ?? "Site sélectionné"}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState("");
  const [loadingSites, setLoadingSites] = useState(true);
  const [errorSites, setErrorSites] = useState("");

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");

    const updateLayoutMode = (event) => {
      const desktop = event.matches;
      setIsDesktop(desktop);
      setIsMenuOpen(desktop);
    };

    setIsDesktop(media.matches);
    setIsMenuOpen(media.matches);

    media.addEventListener("change", updateLayoutMode);
    return () => media.removeEventListener("change", updateLayoutMode);
  }, []);

  useEffect(() => {
    const loadSites = async () => {
      try {
        setLoadingSites(true);
        setErrorSites("");

        const apiUrl = import.meta.env.VITE_API_URL || "";
        const response = await fetch(`${apiUrl}/api/sites`);

        if (!response.ok) {
          throw new Error("Erreur API : " + response.status);
        }

        const data = await response.json();
        const normalizedSites = Array.isArray(data) ? data : [];

        setSites(normalizedSites);

        if (normalizedSites.length > 0) {
          const firstId = String(normalizedSites[0]?.id_site ?? "");
          setSelectedSite(firstId);
        }
      } catch (error) {
        console.error("Erreur chargement des sites :", error);
        setErrorSites("Impossible de charger les sites.");
        setSites([]);
      } finally {
        setLoadingSites(false);
      }
    };

    loadSites();
  }, []);

  const selectedSiteData = useMemo(() => {
    return (
      sites.find(
        (site) => String(site.id_site ?? "") === String(selectedSite ?? "")
      ) || null
    );
  }, [sites, selectedSite]);

  const handleSelectSite = (event) => {
    const value = event.target.value;
    setSelectedSite(value);

    if (!isDesktop) {
      setIsMenuOpen(false);
    }
  };

  const handleCenterOnSite = () => {
    if (!selectedSiteData) return;
    console.log("Centrer sur le site :", selectedSiteData);
  };

  const handleShowDocuments = () => {
    if (!selectedSiteData) return;
    console.log("Afficher documents du site :", selectedSiteData);
  };

  const handleShowLayers = () => {
    console.log("Afficher / masquer les couches");
  };

  const menuContent = () => (
    <>
      <div className="menuHeader">
        <div className="brandBlock">
          <div className="brandIcon">BC</div>
          <div>
            <div className="menuTitle">BaseCarto</div>
            <div className="menuSubtitle">Cartographie des sites</div>
          </div>
        </div>

        {!isDesktop && (
          <button
            type="button"
            className="iconButton"
            onClick={() => setIsMenuOpen(false)}
            aria-label="Fermer le menu"
          >
            ✕
          </button>
        )}
      </div>

      <div className="menuScroll">
        <section className="menuSection">
          <div className="sectionTop">
            <span className="sectionBadge">Sites</span>
          </div>

          <label htmlFor="site-select" className="sectionLabel">
            Choisir un site
          </label>

          {loadingSites ? (
            <div className="infoBox">Chargement des sites...</div>
          ) : errorSites ? (
            <div className="infoBox error">{errorSites}</div>
          ) : (
            <select
              id="site-select"
              value={selectedSite}
              onChange={handleSelectSite}
              className="menuSelect"
            >
              {sites.length === 0 ? (
                <option value="">Aucun site disponible</option>
              ) : (
                sites.map((site) => {
                  const id = String(site.id_site ?? "");
                  const nom = site.lib_site ?? "";
                  return (
                    <option key={id} value={id}>
                      {nom}
                    </option>
                  );
                })
              )}
            </select>
          )}
        </section>

        <section className="menuSection">
          <div className="sectionTop">
            <span className="sectionBadge">Actions</span>
          </div>

          <div className="actionList">
            <button
              type="button"
              className="actionButton"
              onClick={handleCenterOnSite}
              disabled={!selectedSiteData}
            >
              <span className="actionIcon">📍</span>
              <span>
                <strong>Centrer sur le site</strong>
                <small>Positionner la carte sur le site sélectionné</small>
              </span>
            </button>

            <button
              type="button"
              className="actionButton"
              onClick={handleShowLayers}
            >
              <span className="actionIcon">🗂️</span>
              <span>
                <strong>Afficher les couches</strong>
                <small>Gérer les couches cartographiques</small>
              </span>
            </button>

            <button
              type="button"
              className="actionButton"
              onClick={handleShowDocuments}
              disabled={!selectedSiteData}
            >
              <span className="actionIcon">📄</span>
              <span>
                <strong>Documents</strong>
                <small>Ouvrir les documents liés au site</small>
              </span>
            </button>
          </div>
        </section>

        <section className="menuSection">
          <div className="sectionTop">
            <span className="sectionBadge">Résumé</span>
          </div>

          <div className="siteSummaryCard">
            {selectedSiteData ? (
              <>
                <div className="summaryTitle">
                  {selectedSiteData.lib_site ?? "Site"}
                </div>

                <div className="summaryGrid">
                  <div className="summaryItem">
                    <span className="summaryLabel">ID</span>
                    <span className="summaryValue">
                      {selectedSiteData.id_site ?? "-"}
                    </span>
                  </div>

                  <div className="summaryItem">
                    <span className="summaryLabel">Latitude</span>
                    <span className="summaryValue">
                      {selectedSiteData.latitude ?? "-"}
                    </span>
                  </div>

                  <div className="summaryItem">
                    <span className="summaryLabel">Longitude</span>
                    <span className="summaryValue">
                      {selectedSiteData.longitude ?? "-"}
                    </span>
                  </div>

                  <div className="summaryItem">
                    <span className="summaryLabel">Zoom</span>
                    <span className="summaryValue">
                      {selectedSiteData.zoom ?? "-"}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="emptyState">Aucun site sélectionné.</div>
            )}
          </div>
        </section>
      </div>
    </>
  );

  return (
    <div className="appShell">
      <header className="topBar">
        <button
          type="button"
          className="hamburgerButton"
          onClick={() => setIsMenuOpen(true)}
          aria-label="Ouvrir le menu"
        >
          ☰
        </button>

        <div className="topBarTitle">BaseCarto</div>

        <div className="topBarRight">
          {selectedSiteData ? (
            <span className="selectedChip">{selectedSiteData.lib_site}</span>
          ) : (
            <span className="selectedChip muted">Aucun site</span>
          )}
        </div>
      </header>

      <div className="contentShell">
        <aside
          className={[
            "sideMenu",
            isDesktop ? "desktopMenu" : "mobileMenu",
            isMenuOpen ? "open" : "closed",
          ].join(" ")}
        >
          {menuContent()}
        </aside>

        <main className="appMain">
          <MapView
            selectedSiteData={selectedSiteData}
            isMenuOpen={isMenuOpen}
            isDesktop={isDesktop}
          />
        </main>
      </div>

      {!isDesktop && isMenuOpen && (
        <div className="menuOverlay" onClick={() => setIsMenuOpen(false)} />
      )}
    </div>
  );
}
