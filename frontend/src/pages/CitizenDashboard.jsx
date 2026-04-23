import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { STATUS_STAGES } from "../constants";
import { apiFetch } from "../lib/api";
import { clearSession, getUser } from "../lib/auth";

function Timeline({ status }) {
  const activeIndex = STATUS_STAGES.indexOf(status);
  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-2">
        {STATUS_STAGES.map((item, index) => (
          <div key={item} className="flex w-full items-center gap-2">
            <span className={`timeline-dot ${index <= activeIndex ? "timeline-dot-active" : ""}`} />
            {index < STATUS_STAGES.length - 1 ? (
              <span className={`h-[2px] w-full ${index < activeIndex ? "bg-indigo-400" : "bg-slate-700"}`} />
            ) : null}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-2 text-[11px] text-slate-400">
        {STATUS_STAGES.map((item) => (
          <span key={item} className="text-center">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function CitizenDashboard() {
  const navigate = useNavigate();
  const user = useMemo(() => getUser(), []);
  const [complaints, setComplaints] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: user?.name || "",
    title: "",
    description: "",
    location: null,
    media: null,
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    loadMyComplaints();
  }, [navigate, user]);

  async function loadMyComplaints() {
    try {
      const data = await apiFetch("/api/complaints/mine");
      setComplaints(data);
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  function detectLocation() {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((prev) => ({
          ...prev,
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            address: "Detected from browser geolocation",
          },
        }));
        setLocating(false);
      },
      () => {
        setError("Unable to detect location. Enable location permissions and retry.");
        setLocating(false);
      }
    );
  }

  async function submitComplaint(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const createdComplaint = await apiFetch("/api/complaints", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setComplaints((prev) => [createdComplaint, ...prev]);
      setForm((prev) => ({ ...prev, title: "", description: "", location: null, media: null }));
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  function logout() {
    clearSession();
    navigate("/login");
  }

  function handleFileUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file only.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        media: {
          name: file.name,
          mimeType: file.type,
          dataUrl: String(reader.result || ""),
        },
      }));
    };
    reader.readAsDataURL(file);
  }

  return (
    <main className="mx-auto max-w-6xl p-5 md:p-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="brand-title text-left text-3xl">Citizen Dashboard</h1>
          <p className="subtitle">{user?.name}, submit and track your complaints.</p>
        </div>
        <button type="button" className="btn-secondary" onClick={logout}>
          Logout
        </button>
      </header>

      {error ? <p className="error-box mb-4">{error}</p> : null}

      <section className="glass-card mb-6 p-5">
        <h2 className="text-xl font-semibold text-slate-100">User Profile Details</h2>
        <div className="mt-3 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
          <p>
            <strong className="text-slate-100">Full Name:</strong> {user?.name || "-"}
          </p>
          <p>
            <strong className="text-slate-100">Username:</strong> {user?.username || "-"}
          </p>
          <p>
            <strong className="text-slate-100">Contact Number:</strong> {user?.contactNumber || "-"}
          </p>
          <p>
            <strong className="text-slate-100">Email Address:</strong> {user?.email || "-"}
          </p>
          <p>
            <strong className="text-slate-100">Address / Location:</strong> {user?.address || "-"}
          </p>
          <p>
            <strong className="text-slate-100">Role:</strong> {user?.role || "citizen"}
          </p>
          <p>
            <strong className="text-slate-100">Date of Registration:</strong>{" "}
            {user?.registeredAt ? new Date(user.registeredAt).toLocaleString() : "-"}
          </p>
          <p>
            <strong className="text-slate-100">Last Login:</strong>{" "}
            {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : "-"}
          </p>
        </div>
      </section>

      <section className="glass-card mb-6 p-5">
        <h2 className="text-xl font-semibold text-slate-100">Submit Complaint</h2>
        <form className="mt-4 space-y-4" onSubmit={submitComplaint}>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              type="text"
              placeholder="Name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
            <input
              type="text"
              placeholder="Complaint title"
              value={form.title}
              onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
              required
            />
          </div>
          <textarea
            className="min-h-28"
            placeholder="Describe the issue (AI categorization is based on keywords)."
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            required
          />

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn-secondary" onClick={detectLocation} disabled={locating}>
              {locating ? "Detecting..." : "Detect Location"}
            </button>
            {form.location ? (
              <p className="text-sm text-emerald-300">
                Location: {form.location.latitude.toFixed(4)}, {form.location.longitude.toFixed(4)}
              </p>
            ) : null}
          </div>

          <div className="rounded-xl border border-dashed border-indigo-300/40 bg-white/5 p-3 text-sm text-slate-300">
            <label className="mb-2 block text-sm text-slate-200">Upload Complaint Image</label>
            <input type="file" accept="image/*" onChange={handleFileUpload} />
            {form.media?.dataUrl ? (
              <img
                src={form.media.dataUrl}
                alt="Selected complaint"
                className="mt-3 max-h-56 w-full rounded-lg object-cover"
              />
            ) : (
              <p className="mt-2 text-xs text-slate-400">No image selected.</p>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Complaint"}
          </button>
        </form>
      </section>

      <section className="glass-card p-5">
        <h2 className="text-xl font-semibold text-slate-100">Complaint History</h2>
        <div className="mt-4 space-y-4">
          {complaints.length === 0 ? (
            <p className="subtitle">No complaints yet.</p>
          ) : (
            complaints.map((complaint) => (
              <article key={complaint._id} className="rounded-xl border border-indigo-300/20 bg-slate-950/45 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-medium text-slate-100">{complaint.title}</h3>
                  <span className="rounded-full border border-indigo-300/30 bg-indigo-400/10 px-3 py-1 text-xs text-indigo-200">
                    {complaint.status}
                  </span>
                </div>
                <p className="mt-2 text-slate-300">{complaint.description}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-300">
                  <span className="rounded bg-fuchsia-400/15 px-2 py-1 text-fuchsia-200">{complaint.category}</span>
                  {complaint.location?.latitude ? (
                    <span>
                      {complaint.location.latitude.toFixed(4)}, {complaint.location.longitude.toFixed(4)}
                    </span>
                  ) : null}
                </div>
                {complaint.media?.dataUrl ? (
                  <img
                    src={complaint.media.dataUrl}
                    alt={complaint.media.name || "Complaint attachment"}
                    className="mt-3 max-h-64 w-full rounded-lg object-cover"
                  />
                ) : null}
                <Timeline status={complaint.status} />
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
