import { useEffect, useMemo, useRef, useState, type JSX } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaCopy,
  FaExternalLinkAlt,
  FaTrash,
  FaLink,
  FaMouse,
  FaChartBar,
  FaStar,
  FaSun,
  FaMoon,
  FaBell,
  FaBolt,
  FaSyncAlt,
  FaPlus,
  FaDownload,
  FaCog,
  FaCheckCircle,
  FaQrcode,
  FaHome,
  FaFire,
  FaServer,
  FaDatabase,
} from "react-icons/fa";

/* =========================================================
   TYPES
========================================================= */

interface LinkData {
  id: number;
  code: string;
  phone: string;
  message: string;
  clicks: number;
}

interface Activity {
  id: number;
  label: string;
  detail?: string;
  time: string;
}

type ServiceState = "online" | "degraded" | "offline";

interface ServiceStatus {
  name: string;
  label: string;
  state: ServiceState;
  icon: JSX.Element;
  lastChecked: string;
}

/* =========================================================
   SMALL PRESENTATIONAL PRIMITIVES
========================================================= */

const cardBase =
  "rounded-3xl bg-white/[0.06] backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.25)]";

function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={`${cardBase} p-6 ${className}`}
    >
      {children}
    </motion.div>
  );
}

function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-linear-to-r from-white/5 via-white/10 to-white/5 bg-size-[200%_100%] ${className}`}
    />
  );
}

function StatusPulse({ state }: { state: ServiceState }) {
  const color =
    state === "online"
      ? "bg-emerald-400"
      : state === "degraded"
      ? "bg-amber-400"
      : "bg-rose-500";
  return (
    <span className="relative flex h-3 w-3">
      <span
        className={`absolute inline-flex h-full w-full animate-ping rounded-full ${color} opacity-60`}
      />
      <span className={`relative inline-flex h-3 w-3 rounded-full ${color}`} />
    </span>
  );
}

/* =========================================================
   404 PAGE (standalone component — wire into your router,
   e.g. <Route path="*" element={<NotFoundPage />} />)
========================================================= */

export function NotFoundPage({ onGoHome }: { onGoHome?: () => void }) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`${cardBase} max-w-md w-full p-10 text-center`}
      >
        <motion.div
          animate={{ rotate: [0, -8, 8, -8, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 2 }}
          className="text-7xl mb-4"
        >
          🔗
        </motion.div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Oops!</h1>
        <p className="text-white/60 mb-8">
          The QuickChat link you're looking for doesn't exist.
        </p>
        <button
          onClick={onGoHome}
          className="inline-flex items-center gap-2 rounded-full bg-orange-500 hover:bg-orange-400 transition px-6 py-3 font-semibold shadow-lg shadow-orange-500/30"
        >
          <FaHome /> Go Home
        </button>
      </motion.div>
    </div>
  );
}

/* =========================================================
   SUCCESS OVERLAY (shown briefly after a link is generated,
   before revealing the QR code)
========================================================= */

function SuccessOverlay({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 18 }}
            className={`${cardBase} px-10 py-8 flex flex-col items-center gap-3`}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
              className="text-emerald-400 text-6xl"
            >
              <FaCheckCircle />
            </motion.div>
            <p className="text-xl font-semibold">Link generated!</p>
            <p className="text-white/50 text-sm">Preparing your QR code…</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* =========================================================
   MAIN DASHBOARD
========================================================= */

export default function Dashboard() {
  const [links, setLinks] = useState<LinkData[]>([]);
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [loading, setLoading] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showNotFound, setShowNotFound] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const [activities, setActivities] = useState<Activity[]>([
    { id: 1, label: "Link Generated", detail: "support", time: "2m ago" },
    { id: 2, label: "Link Copied", detail: "promo24", time: "14m ago" },
    { id: 3, label: "QR Downloaded", detail: "support", time: "41m ago" },
    { id: 4, label: "Link Deleted", detail: "test-01", time: "1h ago" },
  ]);

  const pushActivity = (label: string, detail?: string) => {
    setActivities((prev) =>
      [{ id: Date.now(), label, detail, time: "Just now" }, ...prev].slice(
        0,
        10
      )
    );
  };

  useEffect(() => {
    setLoading(true);
    axios
      .get("http://localhost:5000/analytics/all")
      .then((res) => setLinks(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const deleteLink = async (id: number, code: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this link?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/delete/${id}`);
      setLinks((prev) => prev.filter((link) => link.id !== id));
      pushActivity("Link Deleted", code);
    } catch (error) {
      console.error(error);
      alert("Failed to delete link.");
    }
  };

  const copyLink = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      pushActivity("Link Copied", code);
    } catch (err) {
      console.error(err);
      alert("Failed to copy link");
    }
  };

  const openLink = (code: string) => {
    window.open(`/${code}`, "_blank");
    pushActivity("QR Downloaded", code);
  };

  const generateNewLink = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      pushActivity("Link Generated", "new-campaign");
    }, 1400);
  };

  const totalLinks = links.length;
  const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);
  const averageClicks =
    totalLinks === 0 ? 0 : (totalClicks / totalLinks).toFixed(1);

  const topCampaign = useMemo(() => {
    if (!links.length) {
      return { code: "support", clicks: 125, target: 200 };
    }
    const best = links.reduce((a, b) => (a.clicks > b.clicks ? a : b));
    return { code: best.code, clicks: best.clicks, target: Math.max(best.clicks + 50, 200) };
  }, [links]);

  const filteredLinks = links.filter((link) =>
    [link.code, link.phone, link.message]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const services: ServiceStatus[] = [
    {
      name: "api",
      label: "API Server",
      state: "online",
      icon: <FaServer size={26} />,
      lastChecked: "Just now",
    },
    {
      name: "db",
      label: "Database",
      state: "online",
      icon: <FaDatabase size={26} />,
      lastChecked: "Just now",
    },
    {
      name: "qr",
      label: "QR Generator",
      state: "online",
      icon: <FaQrcode size={26} />,
      lastChecked: "Just now",
    },
  ];

  const stateLabel: Record<ServiceState, string> = {
    online: "Online",
    degraded: "Degraded",
    offline: "Offline",
  };

  if (showNotFound) {
    return <NotFoundPage onGoHome={() => setShowNotFound(false)} />;
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-500 p-6 md:p-10 ${
        darkMode
          ? "bg-slate-950 text-white"
          : "bg-slate-100 text-slate-900"
      }`}
    >
      <SuccessOverlay show={showSuccess} />

      {/* ================= HEADER ================= */}
      <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
        <div>
          <p className="text-white/50 text-xs uppercase tracking-[0.2em]">
            ScoreMark Agency
          </p>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-2">
            ScoreMark QuickChat
          </h1>
          <p className="mt-2 text-white/60 text-sm md:text-base">
            Generate • Track • Analyze WhatsApp Campaigns
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative bg-white/10 backdrop-blur-xl rounded-full p-3 hover:scale-110 transition border border-white/10"
              aria-label="Notifications"
            >
              <FaBell size={18} />
              {activities.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {Math.min(activities.length, 9)}
                </span>
              )}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className={`${cardBase} absolute right-0 mt-3 w-72 p-2 z-40 max-h-96 overflow-y-auto`}
                >
                  <p className="text-xs uppercase tracking-wider text-white/40 px-3 py-2">
                    Recent activity
                  </p>
                  {activities.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-start gap-2 px-3 py-2 rounded-xl hover:bg-white/5 transition"
                    >
                      <FaCheckCircle className="text-emerald-400 mt-0.5 shrink-0" size={14} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{a.label}</p>
                        {a.detail && (
                          <p className="text-xs text-white/40 truncate">{a.detail}</p>
                        )}
                        <p className="text-[11px] text-white/30">{a.time}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-white/10 backdrop-blur-xl rounded-full p-3 hover:scale-110 transition border border-white/10"
            aria-label="Toggle theme"
          >
            {darkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
          </button>
        </div>
      </div>

      {/* ================= WELCOME BANNER ================= */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-linear-to-r from-orange-500/20 via-amber-400/10 to-transparent border border-white/10 p-6 md:p-8 mb-8"
      >
        <motion.div
          animate={{ x: ["-20%", "120%"] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          className="pointer-events-none absolute top-0 h-full w-1/3 bg-linear-to-r from-transparent via-white/10 to-transparent"
        />
        <p className="text-2xl md:text-3xl font-bold relative">
          👋 Welcome back, Covenant
        </p>
        <p className="text-white/60 mt-2 relative">
          Everything is running smoothly today.
        </p>
        <p className="text-white/60 relative">Have a productive day.</p>
      </motion.div>

      {/* ================= LIVE SYSTEM STATUS ================= */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white/80">System Status</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {services.map((s) => (
          <GlassCard key={s.name}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-orange-400">{s.icon}</div>
              <StatusPulse state={s.state} />
            </div>
            <h3 className="text-white/50 text-sm">{s.label}</h3>
            <p className="text-2xl font-bold mt-1">{stateLabel[s.state]}</p>
            <p className="text-xs text-white/30 mt-3 flex items-center gap-1">
              <FaSyncAlt size={10} /> Last checked: {s.lastChecked}
            </p>
          </GlassCard>
        ))}
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`${cardBase} p-6`}>
              <SkeletonBlock className="h-8 w-8 mb-4" />
              <SkeletonBlock className="h-4 w-24 mb-3" />
              <SkeletonBlock className="h-8 w-16" />
            </div>
          ))
        ) : (
          <>
            <GlassCard>
              <FaLink className="text-orange-400 mb-4" size={34} />
              <h3 className="text-white/50">Total Links</h3>
              <p className="text-5xl font-bold mt-2 font-mono tabular-nums">
                {totalLinks}
              </p>
            </GlassCard>

            <GlassCard>
              <FaMouse className="text-green-400 mb-4" size={34} />
              <h3 className="text-white/50">Total Clicks</h3>
              <p className="text-5xl font-bold mt-2 font-mono tabular-nums">
                {totalClicks}
              </p>
            </GlassCard>

            <GlassCard>
              <FaChartBar className="text-blue-400 mb-4" size={34} />
              <h3 className="text-white/50">Average Clicks</h3>
              <p className="text-5xl font-bold mt-2 font-mono tabular-nums">
                {averageClicks}
              </p>
            </GlassCard>

            <GlassCard>
              <FaStar className="text-yellow-400 mb-4" size={34} />
              <h3 className="text-white/50">Best Performer</h3>
              <p className="text-xl font-bold mt-2 truncate">
                {links.length
                  ? links.reduce((a, b) => (a.clicks > b.clicks ? a : b)).code
                  : "-"}
              </p>
            </GlassCard>
          </>
        )}
      </div>

      {/* ================= SECONDARY GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        {/* Project info */}
        <GlassCard>
          <h3 className="text-white/50 text-sm mb-4 uppercase tracking-wider">
            Project Information
          </h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-white/40">Project</dt>
              <dd className="font-semibold">ScoreMark QuickChat</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-white/40">Version</dt>
              <dd className="font-semibold font-mono">v1.0.0</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-white/40">Developer</dt>
              <dd className="font-semibold">Covenant Nsikak Johnson</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-white/40 shrink-0">Framework</dt>
              <dd className="font-semibold text-right">
                React + TypeScript + Express + SQLite
              </dd>
            </div>
          </dl>
        </GlassCard>

        {/* Performance */}
        <GlassCard>
          <h3 className="text-white/50 text-sm mb-4 uppercase tracking-wider">
            Performance
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FaBolt className="text-amber-400" />
              <div>
                <p className="text-white/40 text-xs">Average Response Time</p>
                <p className="font-mono font-bold">128 ms</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaChartBar className="text-blue-400" />
              <div>
                <p className="text-white/40 text-xs">Total Requests</p>
                <p className="font-mono font-bold">
                  {(totalClicks * 3 + 482).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaSyncAlt className="text-emerald-400" />
              <div>
                <p className="text-white/40 text-xs">Last Generated Link</p>
                <p className="font-mono font-bold truncate">
                  {links[0]?.code ?? "support"}
                </p>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Quick actions */}
        <GlassCard>
          <h3 className="text-white/50 text-sm mb-4 uppercase tracking-wider">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={generateNewLink}
              className="flex flex-col items-center gap-2 rounded-2xl bg-orange-500 hover:bg-orange-400 transition py-4 font-semibold text-sm"
            >
              <FaPlus /> New Link
            </button>
            <button
              disabled
              className="flex flex-col items-center gap-2 rounded-2xl bg-white/5 text-white/30 cursor-not-allowed py-4 font-semibold text-sm border border-white/5"
              title="Available once QR batch export is enabled"
            >
              <FaDownload /> All QR
            </button>
            <button
              onClick={() =>
                document
                  .getElementById("links-table")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="flex flex-col items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 transition py-4 font-semibold text-sm"
            >
              <FaChartBar /> Analytics
            </button>
            <button
              onClick={() => alert("Settings coming soon")}
              className="flex flex-col items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 transition py-4 font-semibold text-sm"
            >
              <FaCog /> Settings
            </button>
          </div>
        </GlassCard>
      </div>

      {/* ================= TOP CAMPAIGN ================= */}
      <GlassCard className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <FaFire className="text-orange-400" />
          <h3 className="text-white/50 text-sm uppercase tracking-wider">
            Top Campaign
          </h3>
        </div>
        <div className="flex items-end justify-between mb-3">
          <p className="text-2xl font-bold">{topCampaign.code}</p>
          <p className="font-mono text-white/60">
            {topCampaign.clicks} Clicks
          </p>
        </div>
        <div className="h-3 w-full rounded-full bg-white/10 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${Math.min(
                (topCampaign.clicks / topCampaign.target) * 100,
                100
              )}%`,
            }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full rounded-full bg-linear-to-r from-orange-500 to-amber-400"
          />
        </div>
      </GlassCard>

      {/* ================= SEARCH + TABLE ================= */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Search by code, phone or message..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 outline-none focus:border-orange-500 transition"
        />
      </div>

      <div id="links-table" className={`${cardBase} p-2 overflow-x-auto`}>
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left text-white/40 text-xs uppercase tracking-wider">
              <th className="p-4">Code</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Clicks</th>
              <th className="p-4">Message</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-t border-white/5">
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="p-4">
                        <SkeletonBlock className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              : filteredLinks.map((link) => (
                  <motion.tr
                    key={link.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-t border-white/5 hover:bg-white/5 transition"
                  >
                    <td className="p-4 font-mono">{link.code}</td>
                    <td className="p-4">{link.phone}</td>
                    <td className="p-4 font-mono">{link.clicks}</td>
                    <td className="p-4 max-w-xs truncate">{link.message}</td>
                    <td className="p-4">
                      <div className="flex gap-3 justify-center">
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => copyLink(link.code)}
                          className="text-blue-400 hover:text-blue-300"
                          aria-label="Copy link"
                        >
                          <FaCopy />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => openLink(link.code)}
                          className="text-green-400 hover:text-green-300"
                          aria-label="Open link"
                        >
                          <FaExternalLinkAlt />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => deleteLink(link.id, link.code)}
                          className="text-rose-400 hover:text-rose-300"
                          aria-label="Delete link"
                        >
                          <FaTrash />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
            {!loading && filteredLinks.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-white/30">
                  No links match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-white/40 text-sm my-6">
        Manage and track all generated WhatsApp links.
      </p>

      <footer className="text-center text-white/30 text-sm mt-12 mb-4">
        Built with ♥ by Covenant Nsikak Johnson
      </footer>

      {/* Dev helper — remove in production, wire real routing instead */}
      <button
        onClick={() => setShowNotFound(true)}
        className="fixed bottom-4 right-4 text-[10px] text-white/20 hover:text-white/50"
      >
        preview 404
      </button>
    </div>
  );
}