import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Remplace ce composant par ta vraie carte Leaflet si besoin
function ChangeView({ center, zoom }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

function MapView({ selectedSiteData }) {
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState("");
  const [loadingSites, setLoadingSites] = useState(true);
  const [errorSites, setErrorSites] = useState("");

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
          const firstId = String(
            normalizedSites[0]?.id ?? normalizedSites[0]?.ID ?? ""
          );
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

    if (window.innerWidth < 768) {
      setIsMenuOpen(false);
    }
  };

  const handleCenterOnSite = () => {
    if (!selectedSiteData) return;
    console.log("Centrer sur le site :", selectedSiteData);
    // Ici tu pourras appeler ta logique Leaflet pour centrer la carte
  };

  const handleShowDocuments = () => {
    if (!selectedSiteData) return;
    console.log("Afficher documents du site :", selectedSiteData);
    // Ici tu pourras ouvrir les documents liés au site
  };

  const handleShowLayers = () => {
    console.log("Afficher / masquer les couches");
    // Ici tu pourras gérer les couches cartographiques
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

        <button
          type="button"
          className="iconButton"
          onClick={() => setIsMenuOpen(false)}
          aria-label="Fermer le menu"
        >
          ✕
        </button>
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
                  {selectedSiteData.nom ?? selectedSiteData.name ?? "Site"}
                </div>

                <div className="summaryGrid">
                  <div className="summaryItem">
                    <span className="summaryLabel">ID</span>
                    <span className="summaryValue">
                      {selectedSiteData.id ?? selectedSiteData.ID ?? "-"}
                    </span>
                  </div>

                  <div className="summaryItem">
                    <span className="summaryLabel">Code</span>
                    <span className="summaryValue">
                      {selectedSiteData.code ?? "-"}
                    </span>
                  </div>
                </div>

                {selectedSiteData.description && (
                  <p className="summaryDescription">
                    {selectedSiteData.description}
                  </p>
                )}
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

      <main className="appMain">
        <MapView
          selectedSite={selectedSite}
          selectedSiteData={selectedSiteData}
        />
      </main>

      {isMenuOpen && (
        <>
          <div className="menuOverlay" onClick={() => setIsMenuOpen(false)} />
          <aside className="sideMenu">{menuContent()}</aside>
        </>
      )}
    </div>
  );
}
