import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { api, formatCurrency, formatDate } from "@/lib/api";
import { toast } from "sonner";
import { Plus, Search, RefreshCw, ArrowUpRight, AlertTriangle } from "lucide-react";

const STATUS_OPTS = ["draft","queued","active","blocked","review","delivered","closed","archived","In Progress","Completed","Not Started"];

function RiskBadge({ level }) {
  const map = {
    low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    critical: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${map[level] || map.low}`}>
      {level}
    </span>
  );
}

function StatusBadge({ status }) {
  const s = status?.toLowerCase();
  const map = {
    active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    "in progress": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    completed: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    blocked: "bg-red-500/10 text-red-400 border-red-500/20",
    draft: "bg-zinc-600/10 text-zinc-500 border-zinc-600/20",
    review: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${map[s] || "bg-zinc-800 text-zinc-400 border-zinc-700"}`}>
      {status}
    </span>
  );
}

function NewProjectModal({ open, onClose, onCreated, clients }) {
  const [form, setForm] = useState({ client_id: "", name: "", project_type: "service", status: "active", risk_level: "low", budget: "" });
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, budget: form.budget ? parseFloat(form.budget) : null };
      const { data } = await api.post("/projects", payload);
      toast.success(`Project "${data.name}" created`);
      onCreated(data);
      onClose();
      setForm({ client_id: "", name: "", project_type: "service", status: "active", risk_level: "low", budget: "" });
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <h3 className="text-sm font-semibold text-white mb-4">New Project</h3>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Client *</label>
            <select required value={form.client_id} onChange={e=>setForm({...form,client_id:e.target.value})}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none">
              <option value="">Select client…</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Project Name *</label>
            <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Type</label>
              <select value={form.project_type} onChange={e=>setForm({...form,project_type:e.target.value})}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none">
                {["service","retainer","fixed_price","internal"].map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Risk Level</label>
              <select value={form.risk_level} onChange={e=>setForm({...form,risk_level:e.target.value})}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none">
                {["low","medium","high","critical"].map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Budget (AUD)</label>
            <input type="number" value={form.budget} onChange={e=>setForm({...form,budget:e.target.value})}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-white focus:outline-none" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800">Cancel</button>
            <button type="submit" disabled={loading} className="rounded-lg bg-indigo-500 px-4 py-2 text-sm text-white font-medium hover:bg-indigo-600 disabled:opacity-50">
              {loading ? "Creating…" : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        api.get("/projects", { params: statusFilter ? { status_filter: statusFilter } : {} }),
        api.get("/clients"),
      ]);
      setProjects(pRes.data);
      setClients(cRes.data);
    } catch (err) {
      if (err?.response?.status !== 401) toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const filtered = projects.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.client_name?.toLowerCase().includes(search.toLowerCase())
  );

  const updateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/projects/${id}`, { status: newStatus });
      setProjects(prev => prev.map(p => p.id === id ? {...p, status: newStatus} : p));
    } catch { toast.error("Update failed"); }
  };

  return (
    <div className="p-6 lg:p-8 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">cdxi / projects</p>
          <h1 className="mt-1 text-2xl font-bold text-white tracking-tight">Projects</h1>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600">
          <Plus size={15} /> New Project
        </button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search projects…"
            className="rounded-lg border border-zinc-700 bg-zinc-900 pl-8 pr-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none w-52" />
        </div>
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 focus:outline-none">
          <option value="">All statuses</option>
          {["active","blocked","review","completed","draft"].map(s=><option key={s} value={s}>{s}</option>)}
        </select>
        <button onClick={load} className="flex items-center gap-1.5 rounded-lg border border-zinc-700 px-3 py-2 text-xs text-zinc-400 hover:text-white">
          <RefreshCw size={12} /> Refresh
        </button>
        <span className="ml-auto text-xs text-zinc-500">{filtered.length} project{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="hidden lg:grid grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr_40px] gap-4 border-b border-zinc-800 bg-zinc-900/50 px-5 py-3">
          {["Project","Client","Type","Status","Risk","Budget",""].map(h=>
            <div key={h} className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">{h}</div>
          )}
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 py-12 text-zinc-500 text-sm">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-400" /> Loading…
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="py-12 text-center text-xs text-zinc-600">No projects found</div>
        )}

        {!loading && filtered.map(p => (
          <div key={p.id} className="group grid grid-cols-1 gap-2 border-b border-zinc-800/50 last:border-0 px-5 py-4 hover:bg-zinc-800/20 lg:grid-cols-[2fr_1.5fr_1fr_1fr_1fr_1fr_40px] lg:items-center lg:gap-4">
            <div>
              <div className="text-sm font-medium text-white">{p.name}</div>
              <div className="text-xs text-zinc-500">{p.milestones?.length || 0} milestones</div>
            </div>
            <div className="text-sm text-zinc-400">{p.client_name}</div>
            <div className="text-xs text-zinc-500 capitalize">{p.project_type?.replace(/_/g, " ")}</div>
            <div><StatusBadge status={p.status} /></div>
            <div><RiskBadge level={p.risk_level || "low"} /></div>
            <div className="text-sm text-zinc-300">{formatCurrency(p.budget || p.total_amount)}</div>
            <div className="hidden lg:flex justify-end">
              <ArrowUpRight size={14} className="text-zinc-600 group-hover:text-indigo-400 transition-colors" />
            </div>
          </div>
        ))}
      </div>

      <NewProjectModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onCreated={(p) => setProjects(prev => [p, ...prev])}
        clients={clients}
      />
    </div>
  );
}
