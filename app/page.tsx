import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-6 text-center">
      <h1 className="text-3xl font-bold">Found a stray animal in Bengaluru?</h1>
      <p className="text-lg text-gray-600">
        Share your location and see the nearest vets and rescue groups, with
        one-tap calling.
      </p>
      <Link
        href="/report"
        className="rounded-xl bg-green-600 px-6 py-4 text-xl font-semibold text-white"
      >
        Report a stray
      </Link>
      <p className="text-sm text-gray-500">
        This is not an emergency service, and a response is not guaranteed.
        If an animal is in immediate danger, call a vet or helpline directly.
      </p>
    </main>
  );
}
