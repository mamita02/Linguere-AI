
import { createClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
    filterListings,
    message,
    money,
    plans,
    regions,
    score,
    stages,
} from "./core.js";

import { Admin } from "./Admin.jsx";
import { PublicPage } from "./Public.jsx";

import "./style.css";

// ==========================================
// CONFIGURATION SUPABASE
// ==========================================

const sb =
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY
    ? createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      )
    : null;

// ==========================================
// NAVIGATION CLIENT
// ==========================================

const nav = [
  ["Accueil", "home"],
  ["Pige immobilière", "search"],
  ["Opportunités IA", "sparkles"],
  ["Baisses de prix", "trend"],
  ["Annonces anciennes", "clock"],
  ["Foncier", "land", 1],
  ["Projets", "building", 1],
  ["Appels d’offres", "file", 1],
  ["Partenariats", "users", 1],
  ["Veille concurrentielle", "eye", 1],
  ["Marché & cartographie", "map", 1],
  ["Prospects", "briefcase", 1],
  ["Rapports", "chart", 1],
  ["Sources & historique", "refresh"],
  ["Abonnement", "card"],
];

const colors = [
  "#4B281A",
  "#A35D39",
  "#C58F6A",
  "#D8B79B",
  "#E9D7C4",
  "#806958",
  "#B87955",
  "#93755F",
];

// ==========================================
// ICÔNES SVG
// ==========================================

function Icon({ name, size = 20 }) {
  const paths = {
    home: "M3 10l9-7 9 7v10H3z M9 20v-7h6v7",
    search: "M21 21l-6-6 M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
    sparkles: "M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z",
    trend: "M3 5l7 7 4-4 7 10 M15 18h6v-6",
    clock: "M12 6v6l4 2 M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
    land: "M3 7l9-4 9 4-9 4z M3 7v10l9 4 9-4V7 M12 11v10",
    building: "M4 22V3h12v19 M16 10h4v12 M8 7h4 M8 11h4 M8 15h4 M9 22v-4",
    file: "M5 2h9l5 5v15H5z M14 2v6h5 M8 12h8 M8 16h8",
    users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M20 21v-2a4 4 0 0 0-3-4 M13 5a4 4 0 1 0-8 0 4 4 0 0 0 8 0",
    eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
    map: "M3 5l6-3 6 3 6-3v17l-6 3-6-3-6 3z M9 2v17 M15 5v17",
    briefcase: "M3 7h18v14H3z M8 7V3h8v4 M3 13h18 M10 13v3h4v-3",
    chart: "M3 3v18h18 M7 17v-5 M12 17V7 M17 17V4",
    refresh: "M20 8a8 8 0 0 0-14-4L3 7 M3 2v5h5 M4 16a8 8 0 0 0 14 4l3-3 M21 22v-5h-5",
    card: "M2 5h20v14H2z M2 10h20 M6 15h4",
    logout: "M10 3H3v18h7 M14 8l5 4-5 4 M8 12h11",
    download: "M12 3v12 M7 10l5 5 5-5 M3 17v4h18v-4",
    check: "M4 12l5 5L20 6",
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.file} />
    </svg>
  );
}

// ==========================================
// FONCTIONS UTILITAIRES
// ==========================================

function formatDate(value) {
  if (!value || !Number.isFinite(Date.parse(value))) {
    return "Non renseignée";
  }

  return new Date(value).toLocaleDateString("fr-FR");
}

function isOld(listing) {
  const date = listing.published_at || listing.first_seen;

  return (
    Number.isFinite(Date.parse(date)) &&
    Date.now() - Date.parse(date) > 30 * 86400000
  );
}

function hasPriceDrop(listing) {
  return (
    listing.price != null &&
    listing.previous_price != null &&
    Number(listing.previous_price) > Number(listing.price)
  );
}

function safeUrl(value) {
  try {
    const url = new URL(value);

    return ["http:", "https:"].includes(url.protocol)
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function downloadCsv(items) {
  const cell = (value) =>
    '"' +
    String(value ?? "")
      .replace(/^[=+\-@\t\r]/, "'$&")
      .replaceAll('"', '""') +
    '"';

  const content = [
    "Titre;Région;Localité;Prix;Source;URL",
    ...items.map((item) =>
      [
        item.title,
        item.region,
        item.locality,
        item.price,
        item.source_platform || item.source,
        item.url,
      ]
        .map(cell)
        .join(";")
    ),
  ].join("\n");

  const url = URL.createObjectURL(
    new Blob(["\ufeff" + content], {
      type: "text/csv;charset=utf-8",
    })
  );

  const link = document.createElement("a");

  link.href = url;
  link.download = "linguere-rapport.csv";
  link.click();

  URL.revokeObjectURL(url);
}

// ==========================================
// COMPOSANT INDICATEUR
// ==========================================

function StatCard({ title, value, icon, subtitle }) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span>{title}</span>

        <div className="stat-icon">
          <Icon name={icon} />
        </div>
      </div>

      <strong>{value}</strong>

      {subtitle && <small>{subtitle}</small>}
    </article>
  );
}

// ==========================================
// RAPPORTS ET ANALYSE AUTOMATIQUE
// ==========================================

function Reports({ rows, geographic = false }) {
  const [period, setPeriod] = useState("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [interpretation, setInterpretation] = useState(false);

  const now = new Date();

  const filtered = rows.filter((row) => {
    const date = new Date(row.first_seen);

    if (!Number.isFinite(date.getTime())) return false;

    if (period === "week") {
      return date >= new Date(now.getTime() - 7 * 86400000);
    }

    if (period === "month") {
      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }

    if (period === "quarter") {
      return date >= new Date(now.getTime() - 90 * 86400000);
    }

    if (period === "custom") {
      const start = startDate
        ? new Date(startDate + "T00:00:00")
        : null;

      const end = endDate
        ? new Date(endDate + "T23:59:59")
        : null;

      return (!start || date >= start) && (!end || date <= end);
    }

    return true;
  });

  const distribution = regions
    .map((region) => ({
      name: region,
      count: filtered.filter((row) => row.region === region).length,
    }))
    .sort((a, b) => b.count - a.count);

  const activeRegions = distribution.filter(
    (item) => item.count > 0
  );

  const unknownCount = filtered.filter(
    (row) => !regions.includes(row.region)
  ).length;

  const chartData = [
    ...activeRegions,
    ...(unknownCount
      ? [{ name: "Zone à confirmer", count: unknownCount }]
      : []),
  ];

  const total = filtered.length;

  const dominant = activeRegions[0];

  const percentage =
    total && dominant
      ? Math.round((dominant.count / total) * 100)
      : 0;

  const priceDrops = filtered.filter(hasPriceDrop).length;

  const priorities = filtered.filter(
    (row) => (row.score ?? score(row)) >= 65
  ).length;

  const kinds = [
    ["Immobilier", "immobilier"],
    ["Appels d’offres", "appel_offres"],
    ["Construction", "construction"],
    ["Rénovation", "renovation"],
    ["Partenariats", "partenariat"],
    ["Concurrence", "concurrence"],
  ].map(([name, kind]) => ({
    name,
    count: filtered.filter((row) => row.kind === kind).length,
  }));

  let angle = 0;

  const segments = chartData.map((item, index) => {
    const start = angle;

    angle += (item.count / Math.max(1, total)) * 360;

    return `${colors[index % colors.length]} ${start}deg ${angle}deg`;
  });

  const donutBackground = segments.length
    ? `conic-gradient(${segments.join(",")})`
    : "#EEE7DF";

  function changePeriod(value) {
    setPeriod(value);
    setInterpretation(false);
  }

  return (
    <section className="reports-page">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            ANALYSE DU MARCHÉ
          </span>

          <h2>
            {geographic
              ? "Répartition géographique"
              : "Rapport de veille stratégique"}
          </h2>

          <p>
            Analysez les opportunités observées pendant la
            période sélectionnée.
          </p>
        </div>

        <select
          value={period}
          onChange={(e) => changePeriod(e.target.value)}
        >
          <option value="week">7 derniers jours</option>
          <option value="month">Ce mois-ci</option>
          <option value="quarter">90 derniers jours</option>
          <option value="all">Toutes les données</option>
          <option value="custom">Période personnalisée</option>
        </select>
      </div>

      {period === "custom" && (
        <article className="date-filters">
          <label>
            Date de début
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setInterpretation(false);
              }}
            />
          </label>

          <label>
            Date de fin
            <input
              type="date"
              min={startDate || undefined}
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setInterpretation(false);
              }}
            />
          </label>
        </article>
      )}

      <div className="stats">
        <StatCard
          title="Résultats observés"
          value={total}
          icon="search"
        />

        <StatCard
          title="Régions représentées"
          value={`${activeRegions.length}/14`}
          icon="map"
        />

        <StatCard
          title="Opportunités prioritaires"
          value={priorities}
          icon="sparkles"
        />

        <StatCard
          title="Baisses de prix"
          value={priceDrops}
          icon="trend"
        />
      </div>

      <div className="report-grid">
        <article className="chart-card">
          <h3>Répartition par région</h3>

          <p>Part des résultats par territoire.</p>

          <div className="donut-wrapper">
            <div
              className="donut-chart"
              style={{ background: donutBackground }}
            >
              <div className="donut-center">
                <strong>{total}</strong>
                <small>Résultats</small>
              </div>
            </div>
          </div>

          <div className="chart-legend">
            {chartData.map((item, index) => (
              <div className="legend-row" key={item.name}>
                <span
                  className="legend-dot"
                  style={{
                    background: colors[index % colors.length],
                  }}
                />

                <span>{item.name}</span>

                <strong>{item.count}</strong>
              </div>
            ))}

            {!chartData.length && (
              <p>Aucune donnée sur cette période.</p>
            )}
          </div>
        </article>

        <article className="chart-card">
          <h3>Volume par région</h3>

          <p>
            Comparaison des résultats entre les régions.
          </p>

          <div className="vertical-chart">
            {activeRegions.slice(0, 7).map((item) => (
              <div className="chart-column" key={item.name}>
                <div className="column-track">
                  <span>{item.count}</span>

                  <div
                    className="column-bar"
                    style={{
                      height: `${
                        (item.count /
                          Math.max(1, distribution[0].count)) *
                        100
                      }%`,
                    }}
                  />
                </div>

                <small>{item.name}</small>
              </div>
            ))}

            {!activeRegions.length && (
              <p>Aucune région renseignée.</p>
            )}
          </div>

          {unknownCount > 0 && (
            <small>
              {unknownCount} résultat(s) sans région confirmée.
            </small>
          )}
        </article>
      </div>

      <article className="chart-card">
        <h3>Répartition des opportunités</h3>

        <p>Nombre de résultats par domaine d’activité.</p>

        {kinds.map((item) => (
          <div className="barrow" key={item.name}>
            <span>{item.name}</span>

            <div>
              <i
                style={{
                  width: `${
                    (item.count / Math.max(1, total)) * 100
                  }%`,
                }}
              />
            </div>

            <b>{item.count}</b>
          </div>
        ))}
      </article>

      <article className="interpretation-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              AIDE À LA DÉCISION
            </span>

            <h3>Interprétation des résultats</h3>

            <p>
              Obtenez une synthèse automatique de votre veille.
            </p>
          </div>

          <button
            className="primary"
            onClick={() => setInterpretation(!interpretation)}
          >
            <Icon name="sparkles" />

            {interpretation
              ? "Masquer l’interprétation"
              : "Interpréter les graphiques"}
          </button>
        </div>

        {interpretation && (
          <div className="interpretation-content">
            {total === 0 ? (
              <p>
                Les données sont insuffisantes pour établir une
                interprétation sur cette période.
              </p>
            ) : (
              <>
                <h4>Synthèse de la période</h4>

                <p>
                  LINGUERE AI a identifié {total} résultat(s)
                  observé(s) pendant la période sélectionnée.
                </p>

                <h4>Analyse géographique</h4>

                {dominant ? (
                  <p>
                    La région de {dominant.name} concentre{" "}
                    {percentage}% des résultats observés.
                    {percentage >= 60
                      ? " Cette concentration invite à diversifier les recherches sur les autres territoires."
                      : " La veille présente une répartition plus diversifiée entre les territoires."}
                  </p>
                ) : (
                  <p>
                    Les localisations disponibles ne permettent
                    pas encore une analyse géographique fiable.
                  </p>
                )}

                <h4>Opportunités commerciales</h4>

                <p>
                  {priorities} résultat(s) présentent un intérêt
                  prioritaire selon les critères de classement
                  disponibles.
                  {priorities > 0 &&
                    " Il est recommandé de consulter ces fiches en priorité et de qualifier les besoins des annonceurs."}
                </p>

                <h4>Évolution des prix</h4>

                <p>
                  {priceDrops > 0
                    ? `${priceDrops} baisse(s) de prix sont identifiées parmi les résultats sélectionnés. Vérifiez les annonces originales avant toute prise de contact.`
                    : "Aucune baisse de prix n’est identifiée parmi les résultats sélectionnés. Cela ne signifie pas que les prix du marché sont stables."}
                </p>

                <h4>Recommandation stratégique</h4>

                <p>
                  Examiner les projets de construction,
                  les besoins de rénovation et les opportunités
                  foncières susceptibles de nécessiter des
                  prestations d’architecture ou d’ingénierie.
                </p>

                <small>
                  Analyse automatique fondée sur les données
                  observées et des règles statistiques.
                  Échantillon non représentatif de l’ensemble
                  du marché sénégalais.
                </small>
              </>
            )}
          </div>
        )}
      </article>

      <div className="report-actions">
        <button onClick={() => window.print()}>
          <Icon name="file" />
          Imprimer / PDF
        </button>

        <button onClick={() => downloadCsv(filtered)}>
          <Icon name="download" />
          Exporter vers Excel (CSV)
        </button>
      </div>
    </section>
  );
}

// ==========================================
// GESTION DES PROSPECTS
// ==========================================

function Prospects({ leads, updateLead, openListings }) {
  const [stageFilter, setStageFilter] = useState("");
  const [search, setSearch] = useState("");

  const visible = leads.filter(
    (lead) =>
      (!stageFilter || lead.stage === stageFilter) &&
      String(lead.title || "")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  const today = new Date().toLocaleDateString("en-CA");

  return (
    <section className="prospects-page">
      <div className="section-heading">
        <div>
          <span className="eyebrow">RELATION COMMERCIALE</span>
          <h2>Votre portefeuille de prospects</h2>
          <p>
            Organisez vos contacts et suivez vos opportunités.
          </p>
        </div>

        <button className="primary" onClick={openListings}>
          <Icon name="search" />
          Trouver des prospects
        </button>
      </div>

      <div className="stats">
        <StatCard
          title="Total prospects"
          value={leads.length}
          icon="users"
        />

        <StatCard
          title="À contacter"
          value={
            leads.filter((lead) =>
              ["Nouveau", "À contacter"].includes(lead.stage)
            ).length
          }
          icon="briefcase"
        />

        <StatCard
          title="Rendez-vous"
          value={
            leads.filter((lead) => lead.stage === "Rendez-vous")
              .length
          }
          icon="clock"
        />

        <StatCard
          title="Contrats signés"
          value={
            leads.filter((lead) => lead.stage === "Contrat signé")
              .length
          }
          icon="check"
        />
      </div>

      <article>
        <h3>Suivi des opportunités commerciales</h3>

        <div className="pipeline">
          {stages.map((stage) => (
            <button
              key={stage}
              className={`pipeline-stage ${
                stageFilter === stage ? "selected" : ""
              }`}
              onClick={() =>
                setStageFilter(
                  stageFilter === stage ? "" : stage
                )
              }
            >
              <strong>
                {leads.filter((lead) => lead.stage === stage).length}
              </strong>

              <small>{stage}</small>
            </button>
          ))}
        </div>
      </article>

      <div className="filters">
        <input
          placeholder="Rechercher un prospect..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
        >
          <option value="">Tous les statuts</option>

          {stages.map((stage) => (
            <option key={stage}>{stage}</option>
          ))}
        </select>
      </div>

      {!visible.length && (
        <article className="empty-state">
          <div className="empty-icon">
            <Icon name="briefcase" size={36} />
          </div>

          <h3>
            {leads.length
              ? "Aucun prospect correspondant"
              : "Votre portefeuille est encore vide"}
          </h3>

          <p>
            Enregistrez des opportunités depuis les fiches
            d’annonces pour commencer votre suivi commercial.
          </p>

          <button className="primary" onClick={openListings}>
            Explorer les annonces
          </button>
        </article>
      )}

      <div className="cards">
        {visible.map((lead) => (
          <article className="lead-card" key={lead.id}>
            <div className="split">
              <span className="tag">{lead.stage}</span>

              {lead.followup &&
                lead.followup <= today &&
                !["Sans suite", "Contrat signé"].includes(
                  lead.stage
                ) && (
                  <span className="reminder-tag">
                    Relance prévue
                  </span>
                )}
            </div>

            <h3>{lead.title}</h3>

            <label>
              Statut commercial
              <select
                value={lead.stage}
                onChange={(e) =>
                  updateLead(lead.id, {
                    stage: e.target.value,
                  })
                }
              >
                {stages.map((stage) => (
                  <option key={stage}>{stage}</option>
                ))}
              </select>
            </label>

            <label>
              Notes commerciales
              <textarea
                placeholder="Besoins du prospect, échanges..."
                defaultValue={lead.notes || ""}
                onBlur={(e) => {
                  if (e.target.value !== (lead.notes || "")) {
                    updateLead(lead.id, {
                      notes: e.target.value,
                    });
                  }
                }}
              />
            </label>

            <label>
              Prochaine relance
              <input
                type="date"
                value={lead.followup || ""}
                onChange={(e) =>
                  updateLead(lead.id, {
                    followup: e.target.value || null,
                  })
                }
              />
            </label>
          </article>
        ))}
      </div>
    </section>
  );
}

// ==========================================
// APPLICATION PRINCIPALE
// ==========================================

function App() {
  const [screen, setScreen] = useState("home");
  const [ready, setReady] = useState(false);

  const [session, S] = useState(null);
  const [profile, P] = useState(null);

  const [plan, B] = useState("pro");
  const [tab, T] = useState("Accueil");

  const [rows, R] = useState([]);
  const [allowed, A] = useState([]);

  const [q, Q] = useState("");
  const [region, G] = useState("");
  const [seller, H] = useState("");
  const [maxPrice, K] = useState("");
  const [dealType, setDealType] = useState("");
  const [propertyType, setPropertyType] = useState("");

  const [detail, D] = useState(null);
  const [notice, N] = useState("");
  const [busy, U] = useState(false);
  const [leadBusy, setLeadBusy] = useState(false);

  const [email, E] = useState("");
  const [password, W] = useState("");

  const [leads, L] = useState([]);
  const [logs, J] = useState([]);
  const [orgs, O] = useState([]);

  const admin = profile?.role === "super_admin";

  // ========================================
  // CHARGEMENT DES DONNÉES
  // ========================================

  async function load() {
    if (!sb) return;

    const {
      data: { session: currentSession },
      error: sessionError,
    } = await sb.auth.getSession();

    if (sessionError) throw sessionError;

    S(currentSession);

    if (!currentSession) {
      P(null);
      return;
    }

    const { data: currentProfile, error } = await sb
      .from("profiles")
      .select("*,companies(*)")
      .eq("id", currentSession.user.id)
      .single();

    if (error) throw error;

    P(currentProfile);

    // Espace administrateur séparé

    if (currentProfile.role === "super_admin") {
      const { data, error: orgError } = await sb
        .from("companies")
        .select("*");

      if (orgError) throw orgError;

      O(data || []);
      return;
    }

    // Espace entreprise

    B(currentProfile.companies?.plan || "essential");
    A(currentProfile.companies?.regions || []);

    const results = await Promise.all([
      sb
        .from("listings")
        .select("*")
        .order("first_seen", { ascending: false }),

      sb
        .from("prospects")
        .select("*")
        .eq("company_id", currentProfile.company_id),

      sb
        .from("collection_runs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30),
    ]);

    const [listingsResult, prospectsResult, logsResult] =
      results;

    if (!listingsResult.error) {
      R(listingsResult.data || []);
    }

    if (!prospectsResult.error) {
      L(prospectsResult.data || []);
    }

    if (!logsResult.error) {
      J(logsResult.data || []);
    }

    if (listingsResult.error) {
      N("Impossible de charger les annonces.");
    } else if (prospectsResult.error) {
      N("Impossible de charger les prospects.");
    }
  }

  useEffect(() => {
    async function initialize() {
      try {
        await load();
      } catch (error) {
        N(error.message);
      } finally {
        setReady(true);
      }
    }

    initialize();
  }, []);

  // ========================================
  // AUTHENTIFICATION
  // ========================================

  async function login(event) {
    event.preventDefault();

    if (!sb || busy) return;

    U(true);
    N("");

    try {
      const { error } = await sb.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      await load();
      T("Accueil");
      W("");
    } catch (error) {
      N(
        error.message === "Invalid login credentials"
          ? "Adresse e-mail ou mot de passe incorrect."
          : error.message
      );
    } finally {
      U(false);
    }
  }

  async function logout() {
    if (!sb) return;

    const { error } = await sb.auth.signOut();

    if (error) {
      N("Impossible de vous déconnecter. Réessayez.");
      return;
    }

    S(null);
    P(null);
    R([]);
    L([]);
    O([]);
    J([]);
    D(null);
    W("");
    E("");
    N("");

    T("Accueil");
    setScreen("home");
  }

  // ========================================
  // NAVIGATION ET FILTRES
  // ========================================

  function changeTab(name) {
    T(name);

    N("");
    Q("");
    G("");
    H("");
    K("");
    setDealType("");
    setPropertyType("");
  }

  const accessibleRows = filterListings(
    rows,
    plan,
    allowed,
    "",
    ""
  );

  const visible = filterListings(
    rows,
    plan,
    allowed,
    q,
    region
  ).filter(
    (item) =>
      (!seller || item.seller === seller) &&
      (!maxPrice ||
        (item.price != null &&
          Number(item.price) <= Number(maxPrice))) &&
      (!dealType || item.deal_type === dealType) &&
      (!propertyType || item.property_type === propertyType)
  );

  let shown = visible.filter(
    (item) =>
      ({
        "Pige immobilière": item.kind === "immobilier",
        "Baisses de prix": hasPriceDrop(item),
        "Annonces anciennes": isOld(item),

        Foncier: /terrain|parcelle|foncier|land/i.test(
          `${item.title} ${item.property_type || ""}`
        ),

        Projets: ["construction", "renovation"].includes(
          item.kind
        ),

        "Appels d’offres": item.kind === "appel_offres",
        Partenariats: item.kind === "partenariat",
        "Veille concurrentielle": item.kind === "concurrence",
      })[tab] ?? true
  );

  if (tab === "Opportunités IA") {
    shown = [...shown].sort(
      (a, b) =>
        (b.score ?? score(b)) - (a.score ?? score(a))
    );
  }

  const propertyTypes = [
    ...new Set(
      accessibleRows.map((item) => item.property_type).filter(Boolean)
    ),
  ];

  const dealTypes = [
    ...new Set(
      accessibleRows.map((item) => item.deal_type).filter(Boolean)
    ),
  ];

  // ========================================
  // COLLECTE DES ANNONCES
  // ========================================

  async function collect() {
    if (!sb || busy) return;

    U(true);
    N("Recherche de nouvelles opportunités en cours...");

    try {
      const { data, error } = await sb.functions.invoke(
        "collect",
        {
          body: {},
        }
      );

      if (error) {
        const status = error.context?.status;

        let payload = {};

        try {
          payload = await error.context?.clone().json();
        } catch {
          // La réponse peut ne pas être au format JSON.
        }

        const reason = String(
          payload?.error || payload?.message || ""
        );

        if (status === 429) {
          if (/quota|limit|limite/i.test(reason)) {
            N(
              "Une limite de collecte a été atteinte. " +
                "Vos annonces existantes restent accessibles."
            );
          } else {
            N(
              "Le service de recherche est momentanément limité. " +
                "Réessayez ultérieurement."
            );
          }

          return;
        }

        if (status === 401 || status === 403) {
          N(
            "Votre accès à la collecte doit être vérifié. " +
              "Reconnectez-vous ou contactez l’administration."
          );

          return;
        }

        N(
          "La collecte est temporairement indisponible. " +
            "Vos données existantes sont conservées."
        );

        return;
      }

      if (data?.error) {
        N("La collecte n’a pas pu aboutir.");
        return;
      }

      await load();

      N(
        `Collecte terminée : ${
          data?.count ?? 0
        } résultat(s) traité(s).`
      );
    } catch {
      N(
        "Impossible de terminer la recherche. " +
          "Veuillez réessayer ultérieurement."
      );
    } finally {
      U(false);
    }
  }

  // ========================================
  // GESTION DES PROSPECTS
  // ========================================

  async function addLead(item) {
    if (leadBusy || plan !== "pro") return;

    if (!profile?.company_id) {
      N("Entreprise non associée à votre compte.");
      return;
    }

    if (leads.some((lead) => lead.listing_id === item.id)) {
      N("Cette opportunité est déjà dans vos prospects.");
      D(null);
      return;
    }

    setLeadBusy(true);

    try {
      const { data, error } = await sb
        .from("prospects")
        .insert({
          company_id: profile.company_id,
          listing_id: item.id,
          title: item.title,
          stage: "Nouveau",
          notes: "",
        })
        .select()
        .single();

      if (error) {
        if (error.code === "23505") {
          N("Cette opportunité est déjà enregistrée.");
        } else {
          N("Impossible d’enregistrer le prospect.");
          console.error("Prospect:", error);
        }

        return;
      }

      L((previous) => [...previous, data]);

      D(null);

      changeTab("Prospects");

      N("Le prospect a bien été enregistré.");
    } finally {
      setLeadBusy(false);
    }
  }

  async function updateLead(id, patch) {
    if (plan !== "pro") return;

    const { data, error } = await sb
      .from("prospects")
      .update(patch)
      .eq("id", id)
      .eq("company_id", profile.company_id)
      .select()
      .single();

    if (error) {
      N("La modification du prospect n’a pas été enregistrée.");
      return;
    }

    L((previous) =>
      previous.map((lead) => (lead.id === id ? data : lead))
    );
  }

  // ========================================
  // CARTES DES ANNONCES
  // ========================================

  function renderCards(items) {
    return (
      <div className="cards listing-grid">
        {items.map((item) => (
          <article className="listing-card" key={item.id}>
            {safeUrl(item.thumbnail) ? (
              <img
                className="listing-image"
                src={safeUrl(item.thumbnail)}
                alt={item.title}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="listing-placeholder">
                <Icon name="building" size={42} />
                <small>Visuel non disponible</small>
              </div>
            )}

            <div className="listing-body">
              <div className="split">
                <span className="tag">
                  {item.category_label ||
                    String(item.kind || "").replaceAll("_", " ")}
                </span>

                <span className="score">
                  {item.score ?? score(item)}/100
                </span>
              </div>

              <h3>{item.title}</h3>

              <p className="listing-location">
                <Icon name="map" size={16} />

                {item.locality
                  ? `${item.locality} · ${item.region || ""}`
                  : item.region || "Zone à confirmer"}
              </p>

              <div className="listing-price">
                {item.price == null || Number(item.price) === 0
                  ? "Prix sur demande"
                  : money(item.price)}
              </div>

              {item.price_unit && (
                <small>Unité du prix : {item.price_unit}</small>
              )}

              <div className="listing-features">
                {item.deal_type && (
                  <span>{item.deal_type}</span>
                )}

                {item.area_sqm != null && (
                  <span>{item.area_sqm} m²</span>
                )}

                {item.bedrooms != null && (
                  <span>{item.bedrooms} chambre(s)</span>
                )}

                {item.rooms != null && (
                  <span>{item.rooms} pièce(s)</span>
                )}
              </div>

              {hasPriceDrop(item) && (
                <div className="price-drop">
                  Prix précédent : {money(item.previous_price)}
                </div>
              )}

              {item.location_warning && (
                <small className="warning-text">
                  Localisation à vérifier
                </small>
              )}

              <p className="listing-description">
                {item.description?.slice(0, 145)}
              </p>

              <div className="listing-meta">
                <small>
                  {item.source_platform || item.source}
                </small>

                <small>
                  {formatDate(
                    item.published_at || item.first_seen
                  )}
                </small>
              </div>

              <button
                className="primary full-width"
                onClick={() => D(item)}
              >
                Consulter l’opportunité →
              </button>
            </div>
          </article>
        ))}
      </div>
    );
  }

  // ========================================
  // PAGE PUBLIQUE
  // ========================================

  if (!ready) {
    return (
      <div className="loading-screen">
        <div className="loading-logo">L</div>
        <p>Chargement de votre espace...</p>
      </div>
    );
  }

  if (!session || !profile) {
    return (
      <PublicPage
        {...{
          screen,
          setScreen,
          email,
          E,
          password,
          W,
          login,
          notice,
          busy,
          configured: !!sb,
        }}
      />
    );
  }

  // ========================================
  // ESPACE SUPER ADMIN
  // ========================================

  if (admin) {
    return (
      <div className="layout">
        <aside>
          <div className="brand">
            <b>L</b>

            <div>
              LINGUERE AI
              <small>Mame Fatou Wade</small>
            </div>
          </div>

          <div className="workspace">SUPER ADMIN</div>

          <nav>
            <button className="active">
              Clients & abonnements
            </button>

            <button onClick={logout}>Déconnexion</button>
          </nav>
        </aside>

        <main>
          <header>
            <div>
              <small>ADMINISTRATION</small>
              <h1>Tableau de bord</h1>
            </div>
          </header>

          {notice && (
            <div className="banner" role="status">
              {notice}

              <button onClick={() => N("")}>×</button>
            </div>
          )}

          <Admin
            sb={sb}
            orgs={orgs}
            reload={load}
            notify={N}
          />
        </main>
      </div>
    );
  }

  // ========================================
  // CONTRÔLE DE L'ABONNEMENT
  // ========================================

  if (
    !profile.companies?.active ||
    (profile.companies.expires_at &&
      Date.parse(profile.companies.expires_at) <= Date.now())
  ) {
    return (
      <div className="loading-screen">
        <h1>Abonnement indisponible</h1>

        <p>
          Contactez l’administration pour réactiver votre accès.
        </p>

        <button onClick={logout}>Déconnexion</button>
      </div>
    );
  }

  // ========================================
  // ESPACE CLIENT
  // ========================================

  return (
    <div className="layout client-layout">
      <aside className="client-sidebar">
        <div className="brand">
          <b>L</b>

          <div>
            LINGUERE AI
            <small>Intelligence stratégique</small>
          </div>
        </div>

        <div className="workspace">
          <small>VOTRE ENTREPRISE</small>

          <strong>{profile.companies?.name}</strong>

          <span className="plan-pill">
            PACK {plan.toUpperCase()}
          </span>
        </div>

        <div className="nav-label">ESPACE DE TRAVAIL</div>

        <nav>
          {nav.map(([name, icon, proOnly]) => (
            <button
              key={name}
              className={tab === name ? "active" : ""}
              disabled={proOnly === 1 && plan !== "pro"}
              onClick={() => changeTab(name)}
            >
              <Icon name={icon} size={18} />

              <span>{name}</span>

              {proOnly === 1 && plan !== "pro" && (
                <small>PRO</small>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button onClick={logout}>
            <Icon name="logout" size={18} />
            Déconnexion
          </button>

          <small>© LINGUERE AI</small>
        </div>
      </aside>

      <main className="client-main">
        <header className="client-header">
          <div>
            <small className="eyebrow">
              ESPACE DE TRAVAIL / {tab.toUpperCase()}
            </small>

            <h1>{tab}</h1>
          </div>

          <div className="actions">
            {["Accueil", "Pige immobilière"].includes(tab) && (
              <button
                className="primary"
                disabled={busy}
                onClick={collect}
              >
                <Icon name="refresh" />

                {busy ? "Recherche en cours..." : "Lancer une pige"}
              </button>
            )}
          </div>
        </header>

        {notice && (
          <div role="status" className="banner">
            <span>{notice}</span>

            <button onClick={() => N("")}>×</button>
          </div>
        )}

        {/* TABLEAU DE BORD */}

        {tab === "Accueil" && (
          <>
            <section className="hero client-hero">
              <div>
                <small>VOTRE VEILLE STRATÉGIQUE</small>

                <h2>
                  Bienvenue, {profile.companies?.name}.
                </h2>

                <p>
                  Identifiez les nouvelles opportunités et
                  développez votre activité grâce à une vision
                  centralisée du marché.
                </p>

                <button
                  onClick={() => changeTab("Opportunités IA")}
                >
                  Explorer les opportunités →
                </button>
              </div>

              <div className="hero-decoration">
                <Icon name="chart" size={140} />
              </div>
            </section>

            <div className="stats">
              <StatCard
                title="Résultats disponibles"
                value={accessibleRows.length}
                icon="search"
              />

              <StatCard
                title="Opportunités prioritaires"
                value={
                  accessibleRows.filter(
                    (item) =>
                      (item.score ?? score(item)) >= 65
                  ).length
                }
                icon="sparkles"
              />

              <StatCard
                title="Baisses de prix"
                value={accessibleRows.filter(hasPriceDrop).length}
                icon="trend"
              />

              <StatCard
                title="Régions incluses"
                value={plans[plan].regions}
                icon="map"
              />
            </div>

            <div className="section-heading">
              <h2>Dernières opportunités</h2>

              <button
                onClick={() => changeTab("Pige immobilière")}
              >
                Voir les annonces →
              </button>
            </div>

            {renderCards(accessibleRows.slice(0, 6))}
          </>
        )}

        {/* PAGES DES ANNONCES */}

        {![
          "Accueil",
          "Prospects",
          "Rapports",
          "Marché & cartographie",
          "Sources & historique",
          "Abonnement",
        ].includes(tab) && (
          <>
            <div className="filters">
              <input
                placeholder="Rechercher une opportunité..."
                value={q}
                onChange={(e) => Q(e.target.value)}
              />

              <select
                value={region}
                onChange={(e) => G(e.target.value)}
              >
                <option value="">Toutes les régions</option>

                {(plan === "pro" ? regions : allowed).map(
                  (item) => (
                    <option key={item}>{item}</option>
                  )
                )}
              </select>

              <select
                value={seller}
                onChange={(e) => H(e.target.value)}
              >
                <option value="">Tous les vendeurs</option>
                <option value="particulier">Particulier</option>
                <option value="professionnel">Professionnel</option>
                <option value="indéterminé">Non renseigné</option>
              </select>

              <input
                type="number"
                min="0"
                placeholder="Budget maximum"
                value={maxPrice}
                onChange={(e) => K(e.target.value)}
              />

              {tab === "Pige immobilière" && (
                <>
                  <select
                    value={dealType}
                    onChange={(e) => setDealType(e.target.value)}
                  >
                    <option value="">Vente et location</option>

                    {dealTypes.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>

                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                  >
                    <option value="">Tous les biens</option>

                    {propertyTypes.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </>
              )}

              {plan === "pro" && (
                <button onClick={() => downloadCsv(shown)}>
                  <Icon name="download" />
                  Exporter
                </button>
              )}
            </div>

            <p>{shown.length} résultat(s) disponible(s)</p>

            {renderCards(shown)}

            {!shown.length && (
              <article className="empty-state">
                <div className="empty-icon">
                  <Icon name="search" size={36} />
                </div>

                <h3>Aucune opportunité disponible</h3>

                <p>
                  Aucun résultat ne correspond actuellement
                  à vos critères de recherche.
                </p>
              </article>
            )}
          </>
        )}

        {/* RAPPORTS */}

        {tab === "Rapports" && plan === "pro" && (
          <Reports rows={accessibleRows} />
        )}

        {tab === "Marché & cartographie" && plan === "pro" && (
          <Reports rows={accessibleRows} geographic />
        )}

        {/* PROSPECTS */}

        {tab === "Prospects" && plan === "pro" && (
          <Prospects
            leads={leads}
            updateLead={updateLead}
            openListings={() => changeTab("Pige immobilière")}
          />
        )}

        {/* SOURCES ET HISTORIQUE */}

        {tab === "Sources & historique" && (
          <>
            <div className="section-heading">
              <div>
                <h2>Nos sources de recherche</h2>

                <p>
                  Les résultats sont centralisés depuis
                  plusieurs sources complémentaires.
                </p>
              </div>
            </div>

            <div className="cards">
              {[
                ["Expat-Dakar", "Annonces immobilières"],
                ["CoinAfrique", "Annonces et biens immobiliers"],
                ["Tavily", "Recherche web et veille stratégique"],
              ].map(([name, description]) => (
                <article className="source-card" key={name}>
                  <div className="stat-icon">
                    <Icon name="search" size={24} />
                  </div>

                  <h3>{name}</h3>

                  <p>{description}</p>

                  <small>
                    {
                      accessibleRows.filter(
                        (item) =>
                          (item.source_platform || item.source) ===
                          name
                      ).length
                    }{" "}
                    résultat(s) disponible(s)
                  </small>
                </article>
              ))}
            </div>

            <article>
              <h3>Historique des collectes accessibles</h3>

              {logs.map((log) => (
                <div className="history-row" key={log.id}>
                  <span>{formatDate(log.created_at)}</span>

                  <span className="tag">{log.status}</span>

                  <strong>{log.count || 0} résultats</strong>
                </div>
              ))}

              {!logs.length && (
                <p>Aucune collecte accessible pour le moment.</p>
              )}
            </article>
          </>
        )}

        {/* ABONNEMENT */}

        {tab === "Abonnement" && (
          <>
            <article className="subscription-card">
              <span className="tag">Votre abonnement</span>

              <h2>Pack {plan.toUpperCase()}</h2>

              <div className="subscription-price">
                {money(plans[plan].price)}
                <small> / mois</small>
              </div>

              <div className="subscription-features">
                <p>
                  <Icon name="check" />
                  {plans[plan].regions} régions du Sénégal
                </p>

                <p>
                  <Icon name="check" />
                  {plans[plan].users} utilisateur(s)
                </p>

                <p>
                  <Icon name="check" />
                  {plans[plan].runs} collectes quotidiennes
                </p>

                <p>
                  <Icon name="check" />
                  Accès aux annonces immobilières
                </p>

                {plan === "pro" && (
                  <>
                    <p>
                      <Icon name="check" />
                      Veille stratégique et appels d’offres
                    </p>

                    <p>
                      <Icon name="check" />
                      Gestion des prospects
                    </p>

                    <p>
                      <Icon name="check" />
                      Rapports et exports
                    </p>
                  </>
                )}
              </div>

              <p>
                Échéance :{" "}
                {profile.companies?.expires_at
                  ? formatDate(profile.companies.expires_at)
                  : "Non renseignée"}
              </p>
            </article>

            <article>
              <h3>Vos régions accessibles</h3>

              <div className="region-list">
                {(plan === "pro" ? regions : allowed).map(
                  (item) => (
                    <span className="tag" key={item}>
                      {item}
                    </span>
                  )
                )}
              </div>
            </article>
          </>
        )}

        <footer>
          LINGUERE AI · Intelligence immobilière et stratégique
        </footer>
      </main>

      {/* FICHE DÉTAILLÉE */}

      {detail && (
        <div className="overlay" onClick={() => D(null)}>
          <article
            className="modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="split">
              <span className="tag">
                {detail.source_platform || detail.source}
              </span>

              <button onClick={() => D(null)}>Fermer ×</button>
            </div>

            {safeUrl(detail.thumbnail) && (
              <img
                className="detail-image"
                src={safeUrl(detail.thumbnail)}
                alt={detail.title}
              />
            )}

            <h2>{detail.title}</h2>

            <h3>{money(detail.price)}</h3>

            <p>{detail.description}</p>

            <div className="interpretation-content">
              <h3>Analyse de l’opportunité</h3>

              <p>
                Niveau d’intérêt :{" "}
                {detail.score ?? score(detail)}/100
              </p>

              <p>
                {detail.analysis ||
                  "Classement indicatif établi à partir des informations disponibles."}
              </p>

              <small>
                {detail.analysis_mode || "Analyse par critères"}
              </small>
            </div>

            <p>
              Première observation :{" "}
              {formatDate(detail.first_seen)}
            </p>

            {safeUrl(detail.url) && (
              <a
                href={safeUrl(detail.url)}
                target="_blank"
                rel="noreferrer"
              >
                Consulter l’annonce originale ↗
              </a>
            )}

            <h3>Message commercial</h3>

            <textarea
              readOnly
              value={
                detail.suggested_message || message(detail)
              }
            />

            <div className="actions">
              <a
                className="btn"
                href={
                  "https://wa.me/?text=" +
                  encodeURIComponent(
                    detail.suggested_message || message(detail)
                  )
                }
                target="_blank"
                rel="noreferrer"
              >
                Partager sur WhatsApp
              </a>

              {plan === "pro" && (
                <button
                  className="primary"
                  disabled={leadBusy}
                  onClick={() => addLead(detail)}
                >
                  {leadBusy
                    ? "Enregistrement..."
                    : "Ajouter aux prospects"}
                </button>
              )}
            </div>
          </article>
        </div>
      )}
    </div>
  );
}

// ==========================================
// RENDU DE L'APPLICATION
// ==========================================

// ==========================================
// RENDU DE L'APPLICATION
// ==========================================

createRoot(document.getElementById("root")).render(<App />);
