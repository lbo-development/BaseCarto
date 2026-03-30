import { useEffect, useMemo, useState } from "react";
import "./App.css";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  ImageOverlay,
} from "react-leaflet";
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

function ResizeMap({ isMenuOpen, isDesktop, openedPlan }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();

      if (openedPlan && map.fitBounds) {
        try {
          map.fitBounds(
            [
              [0, 0],
              [
                Number(openedPlan.height_plan || 0),
                Number(openedPlan.width_plan || 0),
              ],
            ],
            { padding: [20, 20] }
          );
        } catch (error) {
          console.error("Erreur fitBounds :", error);
        }
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [map, isMenuOpen, isDesktop, openedPlan]);

  return null;
}

function MapView({
  selectedSiteData,
  isMenuOpen,
  isDesktop,
  baseLayer,
  setBaseLayer,
}) {
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

  const tileConfig =
    baseLayer === "satellite"
      ? {
          attribution: "Tiles &copy; Esri",
          url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        }
      : {
          attribution: "&copy; OpenStreetMap contributors",
          url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        };

  return (
    <div className="mapContainer geoMapContainer">
      <div className="mapFloatingControls">
        <div
          className="mapPreviewSwitch"
          role="group"
          aria-label="Fond de carte"
        >
          <button
            type="button"
            className={`previewLayerButton ${
              baseLayer === "map" ? "active" : ""
            }`}
            onClick={() => setBaseLayer("map")}
            aria-pressed={baseLayer === "map"}
          >
            <span className="previewThumb previewThumbMap" />
            <span className="previewLabel">Carte</span>
          </button>

          <button
            type="button"
            className={`previewLayerButton ${
              baseLayer === "satellite" ? "active" : ""
            }`}
            onClick={() => setBaseLayer("satellite")}
            aria-pressed={baseLayer === "satellite"}
          >
            <span className="previewThumb previewThumbSatellite" />
            <span className="previewLabel">Satellite</span>
          </button>
        </div>
      </div>

      <MapContainer center={center} zoom={zoom} className="leafletMap">
        <TileLayer attribution={tileConfig.attribution} url={tileConfig.url} />

        <ChangeView center={center} zoom={zoom} />
        <ResizeMap
          isMenuOpen={isMenuOpen}
          isDesktop={isDesktop}
          openedPlan={null}
        />

        {hasValidCoords && (
          <Marker position={[latitude, longitude]}>
            <Popup>{selectedSiteData?.lib_site ?? "Site sélectionné"}</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

function PlanView({ selectedPlanData, isMenuOpen, isDesktop, onClosePlan }) {
  const apiUrl = import.meta.env.VITE_API_URL || "";

  const width = Number(selectedPlanData?.width_plan);
  const height = Number(selectedPlanData?.height_plan);
  const minZoom = Number(selectedPlanData?.min_zoom ?? -2);
  const maxZoom = Number(selectedPlanData?.max_zoom ?? 4);

  const hasValidPlan =
    selectedPlanData?.fichier_plan &&
    !Number.isNaN(width) &&
    !Number.isNaN(height) &&
    width > 0 &&
    height > 0;

  if (!hasValidPlan) {
    return (
      <div className="planFallback">
        <div className="infoBox error">Plan invalide ou incomplet.</div>
      </div>
    );
  }

  const imageUrl = `${apiUrl}/uploads/plans/${selectedPlanData.fichier_plan}`;
  const bounds = [
    [0, 0],
    [height, width],
  ];

  return (
    <div className="planWrapper">
      <div className="planToolbar">
        <div className="planTitleBlock">
          <div className="planTitle">{selectedPlanData.lib_plan ?? "Plan"}</div>
          <div className="planSubtitle">
            {selectedPlanData.fichier_plan} • {Math.round(width)} ×{" "}
            {Math.round(height)}
          </div>
        </div>

        <button
          type="button"
          className="secondaryButton planCloseButton"
          onClick={onClosePlan}
        >
          Fermer le plan
        </button>
      </div>

      <div className="mapContainer">
        <MapContainer
          crs={L.CRS.Simple}
          bounds={bounds}
          minZoom={minZoom}
          maxZoom={maxZoom}
          zoom={minZoom}
          className="leafletMap"
          style={{ background: "#f1f5f9" }}
        >
          <ImageOverlay url={imageUrl} bounds={bounds} />
          <ResizeMap
            isMenuOpen={isMenuOpen}
            isDesktop={isDesktop}
            openedPlan={selectedPlanData}
          />
        </MapContainer>
      </div>
    </div>
  );
}

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState("");
  const [loadingSites, setLoadingSites] = useState(true);
  const [errorSites, setErrorSites] = useState("");

  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [errorPlans, setErrorPlans] = useState("");
  const [openedPlan, setOpenedPlan] = useState(null);

  const [baseLayer, setBaseLayer] = useState("map");

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");

    const updateLayoutMode = (event) => {
      setIsDesktop(event.matches);
    };

    setIsDesktop(media.matches);

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
        } else {
          setSelectedSite("");
        }
      } catch (error) {
        console.error("Erreur chargement des sites :", error);
        setErrorSites("Impossible de charger les sites.");
        setSites([]);
        setSelectedSite("");
      } finally {
        setLoadingSites(false);
      }
    };

    loadSites();
  }, []);

  useEffect(() => {
    const loadPlans = async () => {
      if (!selectedSite) {
        setPlans([]);
        setSelectedPlan("");
        setOpenedPlan(null);
        setErrorPlans("");
        setLoadingPlans(false);
        return;
      }

      try {
        setLoadingPlans(true);
        setErrorPlans("");
        setPlans([]);
        setSelectedPlan("");
        setOpenedPlan(null);

        const apiUrl = import.meta.env.VITE_API_URL || "";
        const response = await fetch(
          `${apiUrl}/api/plans?siteId=${encodeURIComponent(selectedSite)}`
        );

        if (!response.ok) {
          throw new Error("Erreur API : " + response.status);
        }

        const data = await response.json();
        const normalizedPlans = Array.isArray(data) ? data : [];

        setPlans(normalizedPlans);

        if (normalizedPlans.length > 0) {
          setSelectedPlan(String(normalizedPlans[0]?.id_plan ?? ""));
        }
      } catch (error) {
        console.error("Erreur chargement des plans :", error);
        setErrorPlans("Impossible de charger les plans.");
        setPlans([]);
        setSelectedPlan("");
      } finally {
        setLoadingPlans(false);
      }
    };

    loadPlans();
  }, [selectedSite]);

  const selectedSiteData = useMemo(() => {
    return (
      sites.find(
        (site) => String(site.id_site ?? "") === String(selectedSite ?? "")
      ) || null
    );
  }, [sites, selectedSite]);

  const selectedPlanData = useMemo(() => {
    return (
      plans.find(
        (plan) => String(plan.id_plan ?? "") === String(selectedPlan ?? "")
      ) || null
    );
  }, [plans, selectedPlan]);

  const handleSelectSite = (event) => {
    setSelectedSite(event.target.value);
  };

  const handleSelectPlan = (event) => {
    setSelectedPlan(event.target.value);
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

  const handleOpenPlan = () => {
    if (!selectedPlanData) return;
    setOpenedPlan(selectedPlanData);

    if (!isDesktop) {
      setIsMenuOpen(false);
    }
  };

  const handleClosePlan = () => {
    setOpenedPlan(null);
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
            <span className="sectionBadge">Plans</span>
          </div>

          <label htmlFor="plan-select" className="sectionLabel">
            Choisir un plan
          </label>

          {!selectedSite ? (
            <div className="infoBox">Sélectionne d'abord un site.</div>
          ) : loadingPlans ? (
            <div className="infoBox">Chargement des plans...</div>
          ) : errorPlans ? (
            <div className="infoBox error">{errorPlans}</div>
          ) : (
            <select
              id="plan-select"
              value={selectedPlan}
              onChange={handleSelectPlan}
              className="menuSelect"
              disabled={plans.length === 0}
            >
              {plans.length === 0 ? (
                <option value="">Aucun plan disponible</option>
              ) : (
                plans.map((plan) => (
                  <option key={plan.id_plan} value={plan.id_plan}>
                    {plan.lib_plan}
                  </option>
                ))
              )}
            </select>
          )}

          {selectedPlanData && (
            <div className="linkedInfoCard">
              <div className="linkedInfoTitle">{selectedPlanData.lib_plan}</div>
              <div className="linkedInfoMeta">
                {selectedPlanData.fichier_plan}
              </div>
              <button
                type="button"
                className="secondaryButton"
                onClick={handleOpenPlan}
              >
                Ouvrir le plan
              </button>
            </div>
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
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          ☰
        </button>

        <div className="topBarTitle">BaseCarto</div>

        <div className="topBarRight">
          {openedPlan ? (
            <span className="selectedChip">{openedPlan.lib_plan}</span>
          ) : selectedSiteData ? (
            <span className="selectedChip">{selectedSiteData.lib_site}</span>
          ) : (
            <span className="selectedChip muted">Aucun site</span>
          )}
        </div>
      </header>

      <div
        className={[
          "contentShell",
          isDesktop && isMenuOpen ? "desktopMenuVisible" : "",
        ].join(" ")}
      >
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
          {openedPlan ? (
            <PlanView
              selectedPlanData={openedPlan}
              isMenuOpen={isMenuOpen}
              isDesktop={isDesktop}
              onClosePlan={handleClosePlan}
            />
          ) : (
            <MapView
              selectedSiteData={selectedSiteData}
              isMenuOpen={isMenuOpen}
              isDesktop={isDesktop}
              baseLayer={baseLayer}
              setBaseLayer={setBaseLayer}
            />
          )}
        </main>
      </div>

      {!isDesktop && isMenuOpen && (
        <div className="menuOverlay" onClick={() => setIsMenuOpen(false)} />
      )}
    </div>
  );
}
