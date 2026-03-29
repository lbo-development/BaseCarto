import { useEffect, useMemo, useState } from "react";
import "./App.css";

// Remplace ce composant par ta vraie carte Leaflet si besoin
function MapView({ selectedSite, selectedSiteData }) {
  return (
    <div className="mapContainer">
      <div className="mapPlaceholder">
        <div className="mapCard">
          <h2>Carte</h2>
          {selectedSite ? (
            <>
              <p>
                <strong>Site sélectionné :</strong>{" "}
                {selectedSiteData?.nom || selectedSite}
              </p>
              {selectedSiteData?.description && (
                <p>{selectedSiteData.description}</p>
              )}
            </>
          ) : (
            <p>Aucun site sélectionné</p>
          )}
        </div>
      </div>
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

        const response = await fetch("/api/sites");
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
        (site) =>
          String(site.id ?? site.ID ?? "") === String(selectedSite ?? "")
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
                  const id = String(site.id ?? site.ID ?? "");
                  const nom = site.nom ?? site.name ?? `Site ${id}`;
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
            <span className="selectedChip">
              {selectedSiteData.nom ?? selectedSiteData.name}
            </span>
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
