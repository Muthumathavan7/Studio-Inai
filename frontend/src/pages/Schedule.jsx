import React, { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { ChevronLeft, ChevronRight, CheckCircle2, Calendar as CalIcon, Clock } from "lucide-react";
import { toast } from "sonner";

function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function monthLabel(d) {
  return d.toLocaleString("en-GB", { month: "long", year: "numeric" });
}

export default function Schedule() {
  const [availability, setAvailability] = useState(null);
  const [monthCursor, setMonthCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [step, setStep] = useState(1); // 1=date,2=details,3=success
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    service: "General Consultation",
    notes: "",
  });
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    api.get("/availability").then((r) => {
      setAvailability(r.data);
      setForm((f) => ({ ...f, service: r.data.services?.[0] || "General Consultation" }));
    });
  }, []);

  // Build calendar grid
  const days = useMemo(() => {
    const first = monthCursor;
    const startDay = (first.getDay() + 6) % 7; // shift Mon=0
    const lastDate = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const arr = [];
    for (let i = 0; i < startDay; i++) arr.push(null);
    for (let d = 1; d <= lastDate; d++) {
      arr.push(new Date(first.getFullYear(), first.getMonth(), d));
    }
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [monthCursor]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isDateBookable = (d) => {
    if (!d || !availability) return false;
    if (d < today) return false;
    const weekday = ((d.getDay() + 6) % 7).toString();
    const slots = availability.weekday_slots?.[weekday] || [];
    if (slots.length === 0) return false;
    if (availability.blocked_dates?.includes(fmtDate(d))) return false;
    return true;
  };

  const pickDate = async (d) => {
    if (!isDateBookable(d)) return;
    setSelectedDate(d);
    setSelectedSlot(null);
    setSlots([]);
    const dateStr = fmtDate(d);
    try {
      const r = await api.get(`/availability/slots?date=${dateStr}`);
      setSlots(r.data.slots || []);
    } catch (e) {
      toast.error("Could not load time slots.");
    }
  };

  const submit = async () => {
    if (!selectedDate || !selectedSlot) {
      toast.error("Please select a date and time.");
      return;
    }
    if (!form.name || !form.email) {
      toast.error("Please provide your name and email.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        date: fmtDate(selectedDate),
        time: selectedSlot,
        duration_minutes: 30,
      };
      const r = await api.post("/bookings", payload);
      setSuccess(r.data);
      setStep(3);
    } catch (err) {
      const msg = err?.response?.data?.detail || "Could not book. Please try again.";
      toast.error(typeof msg === "string" ? msg : "Could not book.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!availability) return <div className="min-h-screen" />;

  return (
    <div data-testid="schedule-page">
      <section className="pt-40 pb-12">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="overline text-stone-500">Schedule</div>
          <h1 className="editorial-h1 text-5xl md:text-8xl mt-6 max-w-5xl">Book a consultation.</h1>
          <p className="font-sans text-base md:text-lg text-stone-600 mt-6 max-w-2xl">
            A 30-minute conversation to understand your project, brief, and aspirations. We'll get back with a meeting link by email.
          </p>
        </div>
      </section>

      {step === 3 ? (
        <section className="pb-24" data-testid="schedule-success">
          <div className="max-w-3xl mx-auto px-6 md:px-12">
            <div className="border border-stone-200 bg-white p-10 md:p-14">
              <CheckCircle2 size={32} className="text-stone-900" />
              <h2 className="editorial-h2 text-4xl mt-5">Consultation requested.</h2>
              <p className="font-sans text-stone-700 mt-4 leading-relaxed">
                Thanks {success?.name}. Your consultation is pending confirmation. We've recorded:
              </p>
              <div className="mt-8 grid sm:grid-cols-2 gap-6 border-t border-stone-200 pt-6">
                <div><div className="overline text-stone-500">Date</div><div className="font-serif text-2xl mt-2">{success?.date}</div></div>
                <div><div className="overline text-stone-500">Time</div><div className="font-serif text-2xl mt-2">{success?.time}</div></div>
                <div><div className="overline text-stone-500">Service</div><div className="font-sans mt-2">{success?.service}</div></div>
                <div><div className="overline text-stone-500">Duration</div><div className="font-sans mt-2">{success?.duration_minutes} minutes</div></div>
              </div>
              <p className="font-sans text-sm text-stone-500 mt-8 leading-relaxed">
                You'll receive an email with the confirmation and meeting link once our team confirms availability.
              </p>
            </div>
          </div>
        </section>
      ) : (
        <section className="pb-24">
          <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-12 gap-12">
            {/* Calendar */}
            <div className="md:col-span-7">
              <div className="border border-stone-200 bg-white p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <button
                    onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() - 1, 1))}
                    className="p-2 hover:bg-stone-100"
                    data-testid="cal-prev"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <div className="font-serif text-2xl" data-testid="cal-month-label">{monthLabel(monthCursor)}</div>
                  <button
                    onClick={() => setMonthCursor(new Date(monthCursor.getFullYear(), monthCursor.getMonth() + 1, 1))}
                    className="p-2 hover:bg-stone-100"
                    data-testid="cal-next"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-display text-stone-500 mb-2">
                  {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((d) => <div key={d}>{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {days.map((d, i) => {
                    if (!d) return <div key={i} />;
                    const bookable = isDateBookable(d);
                    const selected = selectedDate && fmtDate(selectedDate) === fmtDate(d);
                    return (
                      <button
                        key={i}
                        onClick={() => pickDate(d)}
                        disabled={!bookable}
                        data-testid={`cal-day-${fmtDate(d)}`}
                        className={`aspect-square font-display text-sm border transition-all ${
                          selected
                            ? "bg-stone-900 text-stone-50 border-stone-900"
                            : bookable
                            ? "border-stone-200 hover:border-stone-900 text-stone-900"
                            : "border-transparent text-stone-300 cursor-not-allowed"
                        }`}
                      >
                        {d.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slots */}
              <div className="mt-6 border border-stone-200 bg-white p-6 md:p-8 min-h-[180px]" data-testid="slots-panel">
                {!selectedDate ? (
                  <div className="text-stone-500 font-sans text-sm flex items-center gap-2">
                    <CalIcon size={16} /> Pick an available date to see time slots.
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-4 overline text-stone-500">
                      <Clock size={14} /> Available times — {selectedDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
                    </div>
                    {slots.length === 0 ? (
                      <div className="font-sans text-sm text-stone-500">No times available on this day. Please choose another date.</div>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {slots.map((t) => (
                          <button
                            key={t}
                            onClick={() => setSelectedSlot(t)}
                            data-testid={`slot-${t}`}
                            className={`font-display text-sm px-4 py-2 border transition-all ${
                              selectedSlot === t
                                ? "bg-stone-900 text-stone-50 border-stone-900"
                                : "border-stone-300 hover:border-stone-900 text-stone-800"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Details panel */}
            <div className="md:col-span-5">
              <div className="border border-stone-200 bg-white p-6 md:p-8 space-y-5" data-testid="schedule-form">
                <div className="overline text-stone-500">Your Details</div>
                <Field label="Full name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} testid="sched-name" />
                <Field label="Email *" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} testid="sched-email" />
                <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} testid="sched-phone" />
                <Field label="Company / Project" value={form.company} onChange={(v) => setForm({ ...form, company: v })} testid="sched-company" />
                <div>
                  <label className="overline text-stone-500">Service</label>
                  <select
                    value={form.service}
                    onChange={(e) => setForm({ ...form, service: e.target.value })}
                    data-testid="sched-service"
                    className="mt-2 w-full bg-transparent border-b border-stone-300 font-sans text-base py-2 focus:border-stone-900"
                  >
                    {availability.services.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="overline text-stone-500">Notes</label>
                  <textarea
                    rows={4}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    data-testid="sched-notes"
                    className="mt-2 w-full bg-transparent border-b border-stone-300 font-sans text-base py-2 focus:border-stone-900 resize-none"
                    placeholder="Tell us briefly about your project."
                  />
                </div>

                <div className="border-t border-stone-200 pt-4 text-sm font-display text-stone-500">
                  {selectedDate && selectedSlot ? (
                    <span>{selectedDate.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · {selectedSlot} · 30 min</span>
                  ) : (
                    <span>Select a date and time to continue.</span>
                  )}
                </div>

                <button
                  onClick={submit}
                  disabled={submitting || !selectedDate || !selectedSlot}
                  data-testid="sched-submit"
                  className="w-full font-display text-sm tracking-wide px-8 py-3.5 bg-stone-900 text-stone-50 hover:bg-stone-700 transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed"
                >
                  {submitting ? "Booking…" : "Confirm Booking"}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", testid }) {
  return (
    <div>
      <label className="overline text-stone-500">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        data-testid={testid}
        className="mt-2 w-full bg-transparent border-b border-stone-300 font-sans text-base py-2 focus:border-stone-900"
      />
    </div>
  );
}
