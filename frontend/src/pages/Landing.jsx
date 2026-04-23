import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <main className="mx-auto max-w-6xl p-5 md:p-8">
      <section className="glass-card glow-border p-6 md:p-10">
        <h1 className="brand-title">CivicLink</h1>
        <p className="mt-3 text-center text-base text-slate-200 md:text-lg">
          A smart grievance platform that connects citizens, students, and authorities in one transparent workflow.
        </p>
        <p className="mx-auto mt-3 max-w-4xl text-center text-sm leading-relaxed text-slate-300">
          CivicLink is designed to make public grievance handling simple, trackable, and accountable. Instead of
          complaints getting lost between offices, the platform captures structured complaint data, auto-categorizes
          issues, and sends them directly to the relevant authority dashboard for action.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-indigo-300/20 bg-slate-950/45 p-4">
            <h2 className="text-lg font-semibold text-slate-100">About This Website</h2>
            <p className="mt-2 text-sm text-slate-300">
              CivicLink helps users register public complaints quickly, route them to the right department, and track
              each status stage from pending to resolved.
            </p>
          </article>
          <article className="rounded-xl border border-indigo-300/20 bg-slate-950/45 p-4">
            <h2 className="text-lg font-semibold text-slate-100">How It Works</h2>
            <p className="mt-2 text-sm text-slate-300">
              Citizens submit details, description, location, and optional image proof. Our smart category engine maps
              complaints to the appropriate authority dashboard.
            </p>
          </article>
          <article className="rounded-xl border border-indigo-300/20 bg-slate-950/45 p-4">
            <h2 className="text-lg font-semibold text-slate-100">Why Use CivicLink</h2>
            <p className="mt-2 text-sm text-slate-300">
              Built for accountability: users can monitor complaint timelines while authorities update progress in real
              time for better governance and faster action.
            </p>
          </article>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <article className="rounded-xl border border-indigo-300/20 bg-slate-950/45 p-4">
            <h2 className="text-lg font-semibold text-slate-100">Who Can Use CivicLink</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              <strong className="text-slate-100">Citizens and Students:</strong> Sign up, submit complaints, attach
              location and image proof, and track live status updates.
              <br />
              <strong className="text-slate-100">Authorities:</strong> Log in by department and manage only assigned
              complaints with controlled status transitions.
            </p>
          </article>
          <article className="rounded-xl border border-indigo-300/20 bg-slate-950/45 p-4">
            <h2 className="text-lg font-semibold text-slate-100">Complaint Categories</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              CivicLink routes complaints into 8 departments: Police, School/University, Municipality, Consumer/Cyber,
              Human Rights, Govt Dept, Traffic, and Pollution. This ensures each issue reaches the most responsible
              authority team quickly.
            </p>
          </article>
        </div>

        <div className="mt-6 rounded-xl border border-indigo-300/20 bg-slate-950/45 p-4">
          <h2 className="text-lg font-semibold text-slate-100">End-to-End Complaint Journey</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            Every complaint follows a transparent lifecycle: <strong className="text-slate-100">Pending</strong> -
            <strong className="text-slate-100"> Acknowledged</strong> -
            <strong className="text-slate-100"> Investigating</strong> -
            <strong className="text-slate-100"> In Progress</strong> -
            <strong className="text-slate-100"> Resolved</strong>. Users can view this timeline in their dashboard at
            any time.
          </p>
        </div>

        <div className="mt-6 rounded-xl border border-indigo-300/20 bg-slate-950/45 p-4">
          <h2 className="text-lg font-semibold text-slate-100">Platform Goal</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">
            CivicLink promotes responsive governance by reducing manual routing delays, improving communication between
            citizens and departments, and creating an auditable digital trail for every grievance from submission to
            closure.
          </p>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/login" className="btn-primary">
            Citizen Login
          </Link>
          <Link to="/signup" className="btn-secondary">
            Create Account
          </Link>
          <Link to="/authority-login" className="btn-secondary">
            Authority Login
          </Link>
        </div>
      </section>
    </main>
  );
}
