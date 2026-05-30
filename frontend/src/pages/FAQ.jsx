import { useState } from "react";
import {
  ChevronDown,
  HelpCircle,
  Atom,
  Microscope,
  FlaskConical,
  Wifi,
  Trophy,
  Moon,
} from "lucide-react";

const faqSections = [
  {
    title: "General",
    icon: <HelpCircle size={18} />,
    items: [
      {
        q: "What is Virtual Science Lab?",
        a: "Virtual Science Lab is an interactive educational platform where students can explore Biology, Chemistry, and Physics experiments using immersive simulations and smart learning tools.",
      },
      {
        q: "Is the platform free to use?",
        a: "Yes. Core educational features and simulations are accessible for students and educators without additional setup.",
      },
    ],
  },

  {
    title: "3D Simulations",
    icon: <Atom size={18} />,
    items: [
      {
        q: "How do the science simulations work?",
        a: "The platform uses browser-based rendering to provide interactive experiments, allowing students to visualize concepts in real time.",
      },
      {
        q: "Can I rotate and interact with models?",
        a: "Yes. Most simulations support zooming, rotating, and direct interaction for better understanding.",
      },
      {
        q: "Do simulations work on mobile devices?",
        a: "Yes, simulations are optimized for modern smartphones, tablets, and desktop browsers.",
      },
    ],
  },

  {
    title: "Learning & Progress",
    icon: <Microscope size={18} />,
    items: [
      {
        q: "What is the XP system?",
        a: "Students earn XP by completing quizzes, experiments, and weekly science challenges.",
      },
      {
        q: "How is progress tracked?",
        a: "The platform stores completed activities and learning milestones locally for a smooth learning experience.",
      },
      {
        q: "What are weekly science challenges?",
        a: "Weekly challenges are time-limited educational tasks that reward students with bonus XP and achievement badges.",
      },
    ],
  },

  {
    title: "Offline Support",
    icon: <Wifi size={18} />,
    items: [
      {
        q: "Can I use the platform offline?",
        a: "Yes. Previously loaded lessons and cached educational content can remain available offline.",
      },
      {
        q: "Why does offline caching help?",
        a: "Offline caching improves loading speed and allows continued learning in low-network environments.",
      },
    ],
  },

  {
    title: "Customization",
    icon: <Moon size={18} />,
    items: [
      {
        q: "Does the platform support dark mode?",
        a: "Yes. Users can toggle between light and dark themes for comfortable viewing.",
      },
      {
        q: "Can I personalize my learning dashboard?",
        a: "Yes. The dashboard adapts based on your progress, XP, and completed experiments.",
      },
    ],
  },

  {
    title: "Rewards & Badges",
    icon: <Trophy size={18} />,
    items: [
      {
        q: "How do I unlock badges?",
        a: "Badges are earned by completing experiments, challenges, and maintaining learning streaks.",
      },
      {
        q: "Are rewards saved automatically?",
        a: "Yes. Your achievements and XP are automatically tracked during your learning journey.",
      },
    ],
  },
];

function Accordion({ item, open, onClick }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
      <button
        onClick={onClick}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-white/5"
      >
        <span className="font-semibold text-white">{item.q}</span>

        <ChevronDown
          size={20}
          className={`text-white/70 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-sm leading-relaxed text-white/70">
            {item.a}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [active, setActive] = useState(null);

  let indexCounter = 0;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-20">
        <div className="absolute left-20 top-10 h-44 w-44 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute right-10 bottom-0 h-52 w-52 rounded-full bg-pink-500/20 blur-3xl" />

        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 backdrop-blur-md">
            <HelpCircle size={16} />
            FAQ Center
          </div>

          <h1 className="text-5xl font-black tracking-tight md:text-6xl">
            Frequently Asked Questions
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-white/80">
            Everything you need to know about simulations, offline learning,
            XP rewards, weekly challenges, and smart educational tools inside
            Virtual Science Lab.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="space-y-14">
          {faqSections.map((section, sectionIndex) => (
            <div key={sectionIndex}>
              {/* Section Title */}
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-3 text-cyan-300">
                  {section.icon}
                </div>

                <h2 className="text-3xl font-bold">{section.title}</h2>
              </div>

              {/* Questions */}
              <div className="space-y-4">
                {section.items.map((item) => {
                  const currentIndex = indexCounter++;

                  return (
                    <Accordion
                      key={currentIndex}
                      item={item}
                      open={active === currentIndex}
                      onClick={() =>
                        setActive(
                          active === currentIndex ? null : currentIndex
                        )
                      }
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Card */}
        <div className="mt-20 rounded-3xl border border-cyan-400/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-10 text-center backdrop-blur-xl">
          <FlaskConical
            className="mx-auto mb-5 text-cyan-300"
            size={50}
          />

          <h3 className="text-3xl font-bold">
            Still have questions?
          </h3>

          <p className="mx-auto mt-4 max-w-2xl text-white/70">
            Our Virtual Science Lab continues evolving with new simulations,
            experiments, and intelligent educational systems designed for modern
            science learning.
          </p>

          <button className="mt-7 rounded-2xl bg-cyan-400 px-7 py-3 font-semibold text-slate-900 transition hover:scale-105 hover:bg-cyan-300">
            Contact Support
          </button>
        </div>
      </section>
    </div>
  );
}