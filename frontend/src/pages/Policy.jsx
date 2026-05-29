// src/pages/Policy.jsx

import {
  ShieldCheck,
  Lock,
  Database,
  Eye,
  Cpu,
  FileText,
} from "lucide-react";

export default function Policy() {
  const sections = [
    {
      icon: <ShieldCheck size={22} />,
      title: "User Safety & Educational Usage",
      content:
        "Virtual Science Lab is designed exclusively for educational and learning purposes. Users are expected to interact respectfully and responsibly while using simulations, quizzes, and collaborative learning tools.",
    },

    {
      icon: <Database size={22} />,
      title: "Data Collection",
      content:
        "The platform may store learning progress, XP points, cached lessons, and completed activities locally in your browser to improve educational performance and offline accessibility.",
    },

    {
      icon: <Lock size={22} />,
      title: "Privacy Protection",
      content:
        "We prioritize user privacy and do not intentionally expose personal educational records. Sensitive information should never be shared publicly inside collaborative spaces or discussion areas.",
    },

    {
      icon: <Cpu size={22} />,
      title: "Offline Caching Policy",
      content:
        "To improve performance, selected educational assets and simulations may be cached locally on your device. Users can clear cached content anytime through browser settings.",
    },

    {
      icon: <Eye size={22} />,
      title: "Analytics & Improvements",
      content:
        "Anonymous usage insights may be used to improve simulations, optimize learning experiences, and enhance accessibility across devices and browsers.",
    },

    {
      icon: <FileText size={22} />,
      title: "Content & Intellectual Property",
      content:
        "All educational materials, simulation designs, and platform assets remain protected intellectual property unless explicitly stated otherwise.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-20">
        <div className="absolute left-10 top-10 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute right-0 bottom-0 h-52 w-52 rounded-full bg-pink-500/20 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 backdrop-blur-md">
            <ShieldCheck size={16} />
            Platform Policies
          </div>

          <h1 className="text-5xl font-black tracking-tight md:text-6xl">
            Privacy & Usage Policy
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-white/80">
            Learn how Virtual Science Lab handles educational data, offline
            caching, platform safety, and user privacy across simulations and
            learning systems.
          </p>
        </div>
      </section>

      {/* Policy Cards */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {sections.map((section, index) => (
            <div
              key={index}
              className="group rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl transition duration-300 hover:border-cyan-400/30 hover:bg-white/10"
            >
              <div className="mb-5 inline-flex rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-300">
                {section.icon}
              </div>

              <h2 className="mb-4 text-2xl font-bold">
                {section.title}
              </h2>

              <p className="leading-relaxed text-white/70">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Notice */}
        <div className="mt-16 rounded-3xl border border-indigo-400/20 bg-gradient-to-r from-indigo-500/10 to-cyan-500/10 p-10 text-center backdrop-blur-xl">
          <h3 className="text-3xl font-bold">
            Educational Transparency
          </h3>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-white/70">
            Our mission is to provide a secure, interactive, and accessible
            science learning environment for students and educators using modern
            browser technologies and immersive simulations.
          </p>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-5 py-2 text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Policy updated for latest platform features
          </div>
        </div>
      </section>
    </div>
  );
}