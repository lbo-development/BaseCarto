import React, { useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
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

function MenuContent() {
  const items = [
    { icon: "⌂", label: "Accueil" },
    { icon: "🗺", label: "Couches" },
    { icon: "⌕", label: "Recherche" },
    { icon: "➜", label: "Itinéraires" },
    { icon: "★", label: "Favoris" },
    { icon: "⚙", label: "Paramètres" },
  ];

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-lg text-white shadow-sm">
          M
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Marseille Maps</p>
          <p className="text-xs text-slate-500">
            Tableau de bord cartographique
          </p>
        </div>
      </div>

      <nav className="space-y-2">
        {items.map((item) => (
          <button
            key={item.label}
            className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-base">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-700 p-4 text-white shadow-sm">
        <p className="text-sm font-semibold">Vue active</p>
        <p className="mt-1 text-xs text-slate-200">
          Port de Marseille - zone opérationnelle
        </p>
      </div>
    </>
  );
}

function ToolsContent() {
  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Outils de carte
        </h2>
        <p className="text-sm text-slate-500">
          Recherche, filtres et affichage
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Recherche rapide
        </label>
        <input
          type="text"
          placeholder="Rechercher un lieu, un poste, une zone..."
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-slate-400"
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Fond de carte
        </label>
        <select className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none">
          <option>OpenStreetMap</option>
          <option>Satellite</option>
          <option>Plan clair</option>
        </select>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-sm font-medium text-slate-700">
          Couches visibles
        </p>
        <div className="space-y-3 text-sm text-slate-600">
          <label className="flex items-center justify-between">
            <span>Postes à quai</span>
            <input type="checkbox" defaultChecked className="h-4 w-4" />
          </label>
          <label className="flex items-center justify-between">
            <span>Zones techniques</span>
            <input type="checkbox" defaultChecked className="h-4 w-4" />
          </label>
          <label className="flex items-center justify-between">
            <span>Accès routiers</span>
            <input type="checkbox" className="h-4 w-4" />
          </label>
        </div>
      </div>

      <div className="mt-auto rounded-3xl border border-emerald-100 bg-emerald-50 p-4">
        <p className="text-sm font-semibold text-emerald-800">Conseil</p>
        <p className="mt-1 text-xs text-emerald-700">
          Ajoute ici tes filtres métiers, coordonnées GPS et actions rapides.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const position = [43.2965, 5.3698];
  const [menuOpen, setMenuOpen] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(false);

  return (
    <div className="h-screen w-screen bg-slate-100 p-2 sm:p-4">
      <div className="flex h-full flex-col gap-3">
        <header className="flex items-center justify-between rounded-[28px] border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur sm:px-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
              aria-label="Ouvrir ou fermer le menu"
            >
              <div className="flex flex-col gap-1">
                <span className="block h-0.5 w-5 rounded bg-slate-700" />
                <span className="block h-0.5 w-5 rounded bg-slate-700" />
                <span className="block h-0.5 w-5 rounded bg-slate-700" />
              </div>
            </button>

            <div>
              <h1 className="text-base font-semibold text-slate-900 sm:text-2xl">
                PortMap Studio
              </h1>
              <p className="hidden text-sm text-slate-500 sm:block">
                Supervision cartographique et outils métiers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden items-center rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 md:flex">
              Rechercher...
            </div>

            <button
              type="button"
              onClick={() => setToolsOpen(!toolsOpen)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 lg:hidden"
            >
              Outils
            </button>

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white shadow-sm">
              NC
            </div>
          </div>
        </header>

        <div className="relative flex min-h-0 flex-1 gap-3">
          {menuOpen && (
            <>
              <div
                className="absolute inset-0 z-40 bg-slate-900/30 lg:hidden"
                onClick={() => setMenuOpen(false)}
              />

              <aside className="absolute left-0 top-0 z-50 flex h-full w-[280px] max-w-[88vw] flex-col rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl lg:hidden">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">Menu</p>
                  <button
                    type="button"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    Fermer
                  </button>
                </div>
                <MenuContent />
              </aside>
            </>
          )}

          <aside
            className={`hidden shrink-0 overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 lg:flex lg:flex-col ${
              menuOpen
                ? "lg:w-[280px] lg:opacity-100"
                : "lg:w-0 lg:border-0 lg:p-0 lg:opacity-0"
            }`}
          >
            <MenuContent />
          </aside>

          <main className="relative z-0 min-h-0 flex-1 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
            <div className="absolute left-4 top-4 z-[500] flex flex-col gap-3">
              <div className="rounded-2xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Zone active
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  Marseille - Vue générale
                </p>
              </div>

              <div className="flex gap-2">
                <button className="rounded-2xl bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-lg transition hover:bg-slate-50">
                  Centrer
                </button>
                <button className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-lg transition hover:opacity-95">
                  Mesurer
                </button>
              </div>
            </div>

            <MapContainer
              style={{ zIndex: 0 }}
              center={position}
              zoom={13}
              scrollWheelZoom={true}
              zoomControl={false}
              className="h-full w-full"
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ZoomControl position="bottomright" />
              <Marker position={position}>
                <Popup>Marseille</Popup>
              </Marker>
            </MapContainer>
          </main>

          <aside className="hidden w-[320px] shrink-0 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm lg:block">
            <ToolsContent />
          </aside>

          {toolsOpen && (
            <>
              <div
                className="absolute inset-0 z-40 bg-slate-900/30 lg:hidden"
                onClick={() => setToolsOpen(false)}
              />
              <aside className="absolute right-0 top-0 z-50 h-full w-[300px] max-w-[90vw] rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl lg:hidden">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">Outils</p>
                  <button
                    type="button"
                    onClick={() => setToolsOpen(false)}
                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                  >
                    Fermer
                  </button>
                </div>
                <ToolsContent />
              </aside>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
