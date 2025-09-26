// frontend/src/pages/SearchForm.tsx
import React, { useState } from "react";
import { searchFlights } from "../services/api";


/* --- Helper data --- */
const originCities = ["Bogotá", "Medellín", "Cali", "Cartagena", "Pereira"];
const destinationCities = [
  ...originCities,
  "Madrid",
  "Londres",
  "New York",
  "Buenos Aires",
  "Miami",
];

/* --- Utilities --- */
function tryParseDate(r: any) {
  const candidates = [
    r.fechaHoraSalida,
    r.fechaHoraSalidaIso,
    r.horaSalida,
    r.hora,
    r.fecha && r.hora ? `${r.fecha}T${r.hora}` : null,
    r.fecha,
    r.createdAt,
    r.created_at,
  ];
  for (const c of candidates) {
    if (!c) continue;
    const d = new Date(c);
    if (!isNaN(d.getTime())) return d;
    // try removing seconds or timezone differences
    try {
      const d2 = new Date(String(c).replace(" ", "T"));
      if (!isNaN(d2.getTime())) return d2;
    } catch {}
  }
  return null;
}

function tryParseDateToIsoString(r: any) {
  const d = tryParseDate(r);
  return d ? d.toISOString() : null;
}

/** compute duration between two possible timestamps (various fields) or fallback to tiempoVuelo (min) */
function computeDurationHuman(r: any) {
  // Try to find start and end
  const startCandidates = [
    r.horaSalida,
    r.fechaHoraSalida,
    r.fecha && r.hora ? `${r.fecha}T${r.hora}` : null,
    r.fecha,
    r.createdAt,
    r.hora, // sometimes stored in r.hora
  ];
  const endCandidates = [r.horaLlegada, r.fechaHoraLlegada, r.horaLocalDestino, r.updatedAt];

  let start: Date | null = null;
  for (const s of startCandidates) {
    if (!s) continue;
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      start = d;
      break;
    }
  }
  let end: Date | null = null;
  for (const s of endCandidates) {
    if (!s) continue;
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      end = d;
      break;
    }
  }

  if (start && end) {
    const mins = Math.round(Math.abs(end.getTime() - start.getTime()) / 60000);
    return humanizeMinutes(mins);
  }

  // fallback: tiempoVuelo may be in minutes or in seconds (we assume minutes)
  const fallback = Number(r.tiempoVuelo ?? r.duration ?? r.durationMin ?? r.durationMinutes);
  if (!isNaN(fallback) && fallback > 0) return humanizeMinutes(fallback);

  return "-";
}

function humanizeMinutes(totalMin: number) {
  if (!totalMin || totalMin <= 0) return "0 min";
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

function formatDateForCard(d?: Date | null) {
  if (!d) return "-";
  try {
    return d.toLocaleString("es-CO", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d.toString();
  }
}

function formatCurrency(value: any) {
  const n = Number(value ?? 0);
  if (isNaN(n)) return String(value ?? "-");
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP" }).format(n);
}

/* --- Component --- */
const SearchForm: React.FC = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date();
  const minDate = today.toISOString().split("T")[0];
  const twoYearsLater = new Date();
  twoYearsLater.setFullYear(today.getFullYear() + 2);
  const maxDate = twoYearsLater.toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await searchFlights({ origin, destination, date });
      setResults(data.results || data || []);
      window.scrollTo({ top: 300, behavior: "smooth" });
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error buscando vuelos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "1.5rem 1rem 6.5rem" /* bottom padding para que footer no tape */ }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            background: "rgba(255,255,255,0.88)",
            borderRadius: 12,
            padding: 18,
            boxShadow: "0 8px 24px rgba(6,12,34,0.12)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <h2 style={{ textAlign: "center", margin: 0, color: "#083b57", fontSize: 20, fontWeight: 800 }}>
            Busca tus vuelos
          </h2>

          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: 4,
            }}
          >
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              style={fieldStyle}
              aria-label="Origen"
            >
              <option value="">Selecciona origen</option>
              {originCities.filter((c) => c !== destination).map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              style={fieldStyle}
              aria-label="Destino"
            >
              <option value="">Selecciona destino</option>
              {destinationCities.filter((c) => c !== origin).map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={minDate}
              max={maxDate}
              style={fieldStyle}
              aria-label="Fecha"
            />

            <button type="submit" style={buttonStyle}>
              {loading ? "Buscando..." : "Buscar"}
            </button>
          </form>
        </div>

        {error && (
          <div style={{ marginTop: 12, color: "crimson", textAlign: "center" }}>{error}</div>
        )}

        <section style={{ marginTop: 18 }}>
          {loading && (
            <div style={{ textAlign: "center", padding: 40, color: "#666" }}>Cargando resultados...</div>
          )}

          {!loading && results.length === 0 && (
            <div style={{ textAlign: "center", color: "#666", padding: 28 }}>No hay resultados</div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 14,
            }}
          >
            {results.map((r) => {
              // parse start date/iso for card
              const startDate = tryParseDate(r);
              const startIso = startDate ? startDate.toISOString() : tryParseDateToIsoString(r);
              const duration = computeDurationHuman(r);
              const price = formatCurrency(r.costoBase ?? r.price ?? r.cost ?? r.costo);
              const status = (r.estado || r.status || "programado").toString();
              const code = r.codigoVuelo || r.codigo || r.code || r.id;

              return (
                <article
                  key={r.id ?? code ?? Math.random()}
                  style={{
                    background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(250,250,250,0.96))",
                    borderRadius: 12,
                    padding: 16,
                    boxShadow: "0 6px 16px rgba(6,12,34,0.06)",
                    border: "1px solid rgba(6,12,34,0.05)",
                    display: "flex",
                    gap: 12,
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "transform .14s ease, box-shadow .14s ease",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = "translateY(-6px)";
                    el.style.boxShadow = "0 18px 40px rgba(6,12,34,0.12)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.transform = "translateY(0)";
                    el.style.boxShadow = "0 6px 16px rgba(6,12,34,0.06)";
                  }}
                >
                  <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 12,
                        background: "linear-gradient(180deg,#e6f7ff,#dff6ff)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 800,
                        color: "#025373",
                        flexShrink: 0,
                        fontSize: 14,
                      }}
                    >
                      ✈️
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "baseline", flexWrap: "wrap" }}>
                        <div style={{ fontWeight: 800, color: "#083b57", fontSize: 16, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {r.origen} → {r.destino}
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280", background: "#f1f5f9", padding: "2px 8px", borderRadius: 999 }}>
                          {String(code)}
                        </div>
                      </div>

                      <div style={{ marginTop: 8, fontSize: 13, color: "#5b6b6f" }}>
                        <div>{startDate ? formatDateForCard(startDate) : r.fecha ?? r.hora ?? "Fecha: -"}</div>
                        <div style={{ marginTop: 6, color: "#6b7280", fontSize: 13 }}>
                          Duración: <strong style={{ color: "#0b5569" }}>{duration}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ textAlign: "right", minWidth: 140 }}>
                      <div style={{ fontWeight: 900, color: "#083b57", fontSize: 18 }}>{price}</div>
                      <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>
                        <span style={{ display: "inline-block", padding: "4px 8px", borderRadius: 999, background: status.includes("prog") ? "#e6f7ff" : "#fff3e0", color: status.includes("prog") ? "#0369a1" : "#b45309" }}>
                          {status}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => {
                          // comportamiento rápido: abrir modal o ir a compra
                          alert("Ir a comprar/reservar (iteración posterior).");
                        }}
                        style={{
                          padding: "8px 12px",
                          borderRadius: 10,
                          border: "none",
                          background: "linear-gradient(180deg,#0b4f6c,#07607a)",
                          color: "#fff",
                          cursor: "pointer",
                          fontWeight: 800,
                        }}
                      >
                        Seleccionar
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

/* --- small shared styles --- */
const fieldStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
  fontSize: 16,
  borderRadius: 10,
  border: "1px solid rgba(6,12,34,0.08)",
  minWidth: 180,
  background: "#ffffff",
  color: "#000",
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  padding: "0.7rem 1.25rem",
  fontSize: 16,
  borderRadius: 10,
  border: "none",
  background: "#003b5e",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
  minWidth: 110,
};

export default SearchForm;
