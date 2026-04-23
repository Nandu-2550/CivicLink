import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { STATUS_STAGES } from "../constants";
import { apiFetch } from "../lib/api";
import { clearSession, getAuthority } from "../lib/auth";

export default function AuthorityDashboard() {
  const navigate = useNavigate();
  const authority = useMemo(() => getAuthority(), []);
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authority?.department) {
      navigate("/authority-login");
      return;
    }
    loadDepartmentComplaints();
  }, [authority, navigate]);

  async function loadDepartmentComplaints() {
    try {
      const data = await apiFetch("/api/complaints/department");
      setComplaints(data);
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  async function onStatusChange(id, status) {
    try {
      const updated = await apiFetch(`/api/complaints/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });
      setComplaints((prev) => prev.map((item) => (item._id === id ? updated : item)));
    } catch (updateError) {
      setError(updateError.message);
    }
  }

  function logout() {
    clearSession();
    navigate("/authority-login");
  }

  return (
    <main className="mx-auto max-w-6xl p-5 md:p-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="brand-title text-left text-3xl">Authority Dashboard</h1>
          <p className="subtitle">Department: {authority?.department}</p>
        </div>
        <button type="button" className="btn-secondary" onClick={logout}>
          Logout
        </button>
      </header>

      {error ? <p className="error-box mb-4">{error}</p> : null}

      <section className="glass-card p-5">
        <h2 className="text-xl font-semibold text-slate-100">Category Segregated Complaints</h2>
        <p className="subtitle mt-1">Only complaints in {authority?.department} are shown.</p>
        <div className="mt-4 space-y-4">
          {complaints.length === 0 ? (
            <p className="subtitle">No complaints assigned to this department.</p>
          ) : (
            complaints.map((complaint) => (
              <article key={complaint._id} className="rounded-xl border border-indigo-300/20 bg-slate-950/45 p-4">
                <h3 className="text-lg font-medium text-slate-100">{complaint.title}</h3>
                <p className="mt-2 text-slate-300">{complaint.description}</p>
                <div className="mt-3 grid gap-3 md:grid-cols-[minmax(180px,260px)_1fr]">
                  <select value={complaint.status} onChange={(event) => onStatusChange(complaint._id, event.target.value)}>
                    {STATUS_STAGES.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-slate-300">
                    Citizen: {complaint.name}
                    {complaint.location?.latitude
                      ? ` | Location: ${complaint.location.latitude.toFixed(4)}, ${complaint.location.longitude.toFixed(4)}`
                      : ""}
                  </p>
                </div>
                {complaint.media?.dataUrl ? (
                  <img
                    src={complaint.media.dataUrl}
                    alt={complaint.media.name || "Complaint attachment"}
                    className="mt-3 max-h-64 w-full rounded-lg object-cover"
                  />
                ) : null}
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
