"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Check,
  Calendar,
  Mail,
  UserRound,
  Plus,
} from "lucide-react";

// Ported from the Claude Design v2 book.html — a self-contained 3-step booking
// widget (pick date/time, confirm details, confirmation). DESIGN ONLY: it is
// not wired to a real scheduler and nothing on the site links here yet. Dates
// are computed after mount to avoid SSR/hydration mismatch.

const TIMES = [
  "10:00 AM", "10:30 AM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM",
  "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM",
  "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM",
];
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const FULLD = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  x.setDate(x.getDate() - x.getDay());
  x.setHours(0, 0, 0, 0);
  return x;
}
function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function ord(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
function addMin(t: string, mins: number): string {
  const m = t.match(/(\d+):(\d+) (AM|PM)/);
  if (!m) return t;
  const h = +m[1], mn = +m[2], ap = m[3];
  const H = ap === "PM" ? (h % 12) + 12 : h % 12;
  const total = H * 60 + mn + mins;
  const H2 = Math.floor(total / 60) % 24;
  const M2 = total % 60;
  const ap2 = H2 >= 12 ? "PM" : "AM";
  let h2 = H2 % 12;
  if (h2 === 0) h2 = 12;
  return `${h2}:${String(M2).padStart(2, "0")} ${ap2}`;
}

export function BookingWidget() {
  const [today, setToday] = useState<Date | null>(null);
  const [weekStart, setWeekStart] = useState<Date | null>(null);
  const [selDate, setSelDate] = useState<Date | null>(null);
  const [selTime, setSelTime] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [tz, setTz] = useState("Central European Summer Time");
  const [form, setForm] = useState({ first: "", last: "", email: "", phone: "", website: "" });
  const [guestAdded, setGuestAdded] = useState(false);

  useEffect(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    setToday(t);
    setWeekStart(startOfWeek(t));
    setSelDate(new Date(t));
    try {
      const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (zone) setTz(zone.replace(/_/g, " "));
    } catch {
      // keep default label
    }
  }, []);

  const days = useMemo(() => {
    if (!weekStart) return [];
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const minWeek = today ? startOfWeek(today).getTime() : 0;
  const formValid =
    form.first.trim() &&
    form.last.trim() &&
    /.+@.+\..+/.test(form.email.trim()) &&
    form.phone.trim().length >= 6 &&
    form.website.trim();

  function whenString(): string {
    if (!selDate || !selTime) return "";
    return `${FULLD[selDate.getDay()]}, ${MON[selDate.getMonth()]} ${ord(selDate.getDate())}, ${selTime} to ${addMin(selTime, 20)} CEST`;
  }

  function pickTime(t: string) {
    setSelTime(t);
    setStep(2);
    window.scrollTo(0, 0);
  }

  function onField(name: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [name]: e.target.value }));
  }

  if (!today || !weekStart || !selDate) {
    // pre-mount skeleton (matches SSR so hydration is stable)
    return <div className="bk-main" style={{ minHeight: "60vh" }} />;
  }

  return (
    <main className="bk-main">
      {/* STEP 1 — pick date + time */}
      <section className={`step${step === 1 ? " active" : ""}`}>
        <div className="bk-eyebrow">Book a call</div>
        <h1 className="bk-h">What day works best?</h1>
        <p className="bk-sub">A 20-minute strategy call, direct with the founder.</p>

        <div className="cal-block">
          <button
            className="cal-nav"
            aria-label="Previous week"
            disabled={weekStart.getTime() <= minWeek}
            onClick={() => {
              const ws = new Date(weekStart);
              ws.setDate(ws.getDate() - 7);
              setWeekStart(ws);
            }}
          >
            <ChevronLeft />
          </button>
          <div className="cal">
            <div className="cal-head">
              {DOW.map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
            <div className="cal-row">
              {days.map((d) => {
                const past = d.getTime() < today.getTime();
                const isSel = sameDay(d, selDate);
                return (
                  <button
                    key={d.toISOString()}
                    className={`day${isSel ? " sel" : ""}`}
                    disabled={past}
                    onClick={() => {
                      setSelDate(d);
                      setSelTime(null);
                    }}
                  >
                    <span className="dn">{d.getDate()}</span>
                    <span className="dm">{MON[d.getMonth()]}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <button
            className="cal-nav"
            aria-label="Next week"
            onClick={() => {
              const ws = new Date(weekStart);
              ws.setDate(ws.getDate() + 7);
              setWeekStart(ws);
            }}
          >
            <ChevronRight />
          </button>
        </div>

        <h2 className="bk-label">What time works?</h2>
        <div className="times-meta">
          <span>20-minute meeting</span>
          <span className="dot" />
          <span>{tz}</span>
        </div>
        <div className="times">
          {TIMES.map((t) => (
            <button
              key={t}
              className={`slot${t === selTime ? " sel" : ""}`}
              onClick={() => pickTime(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      {/* STEP 2 — form */}
      <section className={`step${step === 2 ? " active" : ""}`}>
        <div className="almost">
          <div className="bk-eyebrow" style={{ textAlign: "left" }}>
            Almost there
          </div>
          <h1 className="bk-h" style={{ textAlign: "left", marginBottom: 24 }}>
            Confirm your details.
          </h1>
          <div className="summary">
            <div className="when">
              <span className="sm">Your call</span>
              <span>{whenString()}</span>
            </div>
            <button className="change" onClick={() => setStep(1)}>
              Change
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!formValid) return;
              setStep(3);
              window.scrollTo(0, 0);
            }}
          >
            <div className="field">
              <label>
                First name <span className="req">*</span>
              </label>
              <input className="inp" value={form.first} onChange={onField("first")} placeholder="Your first name" required />
            </div>
            <div className="field">
              <label>
                Last name <span className="req">*</span>
              </label>
              <input className="inp" value={form.last} onChange={onField("last")} placeholder="Your last name" required />
            </div>
            <div className="field">
              <label>
                Email <span className="req">*</span>
              </label>
              <input className="inp" type="email" value={form.email} onChange={onField("email")} placeholder="youremail@domain.com" required />
            </div>
            <div className="field">
              <label>
                Phone number <span className="req">*</span>
              </label>
              <input className="inp" type="tel" value={form.phone} onChange={onField("phone")} placeholder="(555) 000-0000" required />
            </div>
            <div className="field">
              <label>
                Website{" "}
                <span className="hint">(we only work with B2B companies that have a website)</span>{" "}
                <span className="req">*</span>
              </label>
              <input className="inp" value={form.website} onChange={onField("website")} placeholder="yourcompany.com" required />
            </div>

            <button
              type="button"
              className="guests"
              disabled={guestAdded}
              onClick={() => setGuestAdded(true)}
            >
              <Plus /> {guestAdded ? "Guest field added, add more after booking" : "Invite additional guests"}
            </button>

            <button type="submit" className="confirm" disabled={!formValid}>
              Confirm meeting <ArrowRight />
            </button>
          </form>
        </div>
      </section>

      {/* STEP 3 — confirmed */}
      <section className={`step${step === 3 ? " active" : ""}`}>
        <div className="done">
          <div className="tick">
            <Check />
          </div>
          <div className="bk-eyebrow">{"You're booked"}</div>
          <h1 className="bk-h">See you on the call.</h1>
          <div className="card">
            <div className="r">
              <Calendar />
              <span>{whenString()}</span>
            </div>
            <div className="r">
              <Mail />
              <span>
                A calendar invite is on its way to <b>{form.email.trim() || "you"}</b>.
              </span>
            </div>
            <div className="r">
              <UserRound />
              <span>
                {"You'll meet "}
                <b>Mihai Pol</b>
                {", founder, no SDR handoff."}
              </span>
            </div>
          </div>
          <Link className="home" href="/">
            Back to site <ArrowRight />
          </Link>
        </div>
      </section>
    </main>
  );
}
