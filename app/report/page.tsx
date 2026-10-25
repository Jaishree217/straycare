"use client";

import { useState } from "react";
import Link from "next/link";

type Provider = {
  id: string;
  name: string;
  type: string;
  phones: string[];
  address: string | null;
  is24x7: boolean | null;
  hours: string | null;
  distanceKm: number | null;
};

const TYPE_LABEL: Record<string, string> = {
  VET: "Vet",
  NGO: "Rescue group",
  GOVERNMENT: "Helpline",
  VOLUNTEER: "Volunteer",
};

export default function ReportPage() {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [locState, setLocState] = useState<
    "idle" | "asking" | "ok" | "denied"
  >("idle");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [providers, setProviders] = useState<Provider[] | null>(null);
  const [saved, setSaved] = useState(false);

  function getLocation() {
    if (!navigator.geolocation) {
      setLocState("denied");
      return;
    }
    setLocState("asking");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocState("ok");
      },
      () => setLocState("denied"),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  }

  async function submit() {
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lat: coords?.lat ?? null,
          lng: coords?.lng ?? null,
          note,
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = (await res.json()) as {
        reportId: string | null;
        providers: Provider[];
      };
      setProviders(data.providers);
      setSaved(data.reportId !== null);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (providers) {
    return (
      <main className="mx-auto max-w-md space-y-4 p-4">
        <h1 className="text-2xl font-bold">Call for help</h1>
        <p className="text-sm text-gray-600">
          {saved
            ? "Your report is saved. Call one of these now. Nobody has been alerted automatically yet."
            : "Location not shared, so these are not sorted by distance."}
        </p>
        <ul className="space-y-3">
          {providers.map((p) => (
            <li key={p.id} className="rounded-xl border p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-gray-500">
                    {TYPE_LABEL[p.type] ?? p.type}
                    {p.distanceKm !== null && ` · ${p.distanceKm} km away`}
                  </p>
                </div>
                {p.is24x7 && (
                  <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    24 hours
                  </span>
                )}
              </div>
              {p.hours && !p.is24x7 && (
                <p className="mt-1 text-sm text-gray-600">{p.hours}</p>
              )}
              {p.address && (
                <p className="mt-1 text-sm text-gray-500">{p.address}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {p.phones.map((ph) => (
                  <a
                    key={ph}
                    href={`tel:${ph.replace(/\s/g, "")}`}
                    className="rounded-lg bg-green-600 px-4 py-2 font-medium text-white"
                  >
                    Call {ph}
                  </a>
                ))}
              </div>
            </li>
          ))}
        </ul>
        <p className="text-xs text-gray-500">
          Hours and numbers can change. If nobody answers, try the next one.
        </p>
        <Link href="/" className="block text-center text-green-700 underline">
          Back to home
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md space-y-5 p-4">
      <h1 className="text-2xl font-bold">Report a stray</h1>

      <div className="space-y-2">
        <p className="font-medium">1. Share where the animal is</p>
        <button
          onClick={getLocation}
          disabled={locState === "asking"}
          className="w-full rounded-xl border-2 border-green-600 px-4 py-3 font-semibold text-green-700"
        >
          {locState === "asking" ? "Finding you..." : "Use my location"}
        </button>
        {locState === "ok" && (
          <p className="text-sm text-green-700">Location captured.</p>
        )}
        {locState === "denied" && (
          <p className="text-sm text-red-600">
            Could not get your location. You can still see who to call below.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <p className="font-medium">2. What is the situation? (optional)</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={500}
          rows={4}
          placeholder="Injured dog near the bus stop, can't walk..."
          className="w-full rounded-xl border p-3"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={submit}
        disabled={sending}
        className="w-full rounded-xl bg-green-600 px-4 py-4 text-lg font-semibold text-white disabled:opacity-60"
      >
        {sending ? "Sending..." : "Show me who to call"}
      </button>
    </main>
  );
}
