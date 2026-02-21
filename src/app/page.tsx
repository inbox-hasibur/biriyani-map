export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-orange-50">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold text-orange-600">
          Biriyani Map 🍛
        </h1>
        <p className="mt-4 text-xl text-slate-600 font-sans">
          Find Iftar spots in real-time.
        </p>
      </div>
      <div className="mt-8 px-6 py-3 bg-green-500 text-white rounded-full font-bold animate-bounce shadow-lg">
        System Initialized
      </div>
    </main>
  );
}