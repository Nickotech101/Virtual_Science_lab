import { useState } from "react";
import { Calculator, X, Beaker, Check, RefreshCw } from "lucide-react";
import { balanceEquation, calculateMolarity, calculateMassFromMolarity } from "../utils/equationBalancer";

export default function ScientificCalculatorWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("balancer");

  // Equation Balancer State
  const [equation, setEquation] = useState("");
  const [balancedResult, setBalancedResult] = useState("");
  const [isBalancing, setIsBalancing] = useState(false);

  // Molarity State
  const [mode, setMode] = useState("findMolarity"); // findMolarity or findMass
  const [mass, setMass] = useState("");
  const [molarMass, setMolarMass] = useState("");
  const [volume, setVolume] = useState("");
  const [molarity, setMolarity] = useState("");
  const [calcResult, setCalcResult] = useState(null);

  const handleBalance = () => {
    setIsBalancing(true);
    setTimeout(() => {
      const result = balanceEquation(equation);
      setBalancedResult(result);
      setIsBalancing(false);
    }, 100); // Simulate brief thought process
  };

  const handleCalculateMolarity = () => {
    if (mode === "findMolarity") {
      const res = calculateMolarity(mass, molarMass, volume);
      setCalcResult(`${res.toFixed(4)} M`);
    } else {
      const res = calculateMassFromMolarity(molarity, molarMass, volume);
      setCalcResult(`${res.toFixed(4)} g`);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-xl transition-transform hover:scale-110 active:scale-95"
          title="Scientific Calculator"
        >
          <Calculator className="h-6 w-6" />
        </button>
      )}

      {/* Widget Panel */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 z-50 flex w-80 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-2xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 sm:w-96">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-teal-500 to-emerald-500 p-4 text-white">
            <div className="flex items-center gap-2 font-bold">
              <Beaker className="h-5 w-5" />
              <span>Lab Assistant Tools</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="rounded-full p-1 hover:bg-white/20">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab("balancer")}
              className={`flex-1 py-3 text-sm font-semibold transition ${
                activeTab === "balancer"
                  ? "border-b-2 border-teal-500 text-teal-600 dark:text-teal-400"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Equation Balancer
            </button>
            <button
              onClick={() => setActiveTab("molarity")}
              className={`flex-1 py-3 text-sm font-semibold transition ${
                activeTab === "molarity"
                  ? "border-b-2 border-teal-500 text-teal-600 dark:text-teal-400"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              Molarity Calc
            </button>
          </div>

          {/* Content Body */}
          <div className="p-5">
            {activeTab === "balancer" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Enter an unbalanced equation (e.g., <code>H2 + O2 = H2O</code>)
                </p>
                <input
                  type="text"
                  placeholder="C6H12O6 + O2 = CO2 + H2O"
                  value={equation}
                  onChange={(e) => setEquation(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
                <button
                  onClick={handleBalance}
                  disabled={!equation.trim() || isBalancing}
                  className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"
                >
                  {isBalancing ? (
                    <RefreshCw className="mx-auto h-4 w-4 animate-spin" />
                  ) : (
                    "Balance Equation"
                  )}
                </button>

                {balancedResult && (
                  <div className={`mt-3 rounded-xl border p-3 text-center text-sm font-bold ${balancedResult.startsWith("Error") ? "border-red-200 bg-red-50 text-red-600 dark:bg-red-900/20" : "border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900/50 dark:bg-teal-900/20 dark:text-teal-300"}`}>
                    {balancedResult}
                  </div>
                )}
              </div>
            )}

            {activeTab === "molarity" && (
              <div className="space-y-3 animate-in fade-in slide-in-from-left-4">
                <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-800/50">
                  <button
                    onClick={() => setMode("findMolarity")}
                    className={`flex-1 rounded-md py-1 text-xs font-semibold ${mode === "findMolarity" ? "bg-white shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-500"}`}
                  >
                    Find Molarity
                  </button>
                  <button
                    onClick={() => setMode("findMass")}
                    className={`flex-1 rounded-md py-1 text-xs font-semibold ${mode === "findMass" ? "bg-white shadow-sm dark:bg-slate-700 dark:text-white" : "text-slate-500"}`}
                  >
                    Find Mass
                  </button>
                </div>

                <div className="space-y-2 text-sm">
                  {mode === "findMolarity" ? (
                    <>
                      <input type="number" placeholder="Mass of Solute (g)" value={mass} onChange={(e) => setMass(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                      <input type="number" placeholder="Molar Mass (g/mol)" value={molarMass} onChange={(e) => setMolarMass(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                      <input type="number" placeholder="Volume of Solution (L)" value={volume} onChange={(e) => setVolume(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                    </>
                  ) : (
                    <>
                      <input type="number" placeholder="Target Molarity (M)" value={molarity} onChange={(e) => setMolarity(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                      <input type="number" placeholder="Molar Mass (g/mol)" value={molarMass} onChange={(e) => setMolarMass(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                      <input type="number" placeholder="Volume of Solution (L)" value={volume} onChange={(e) => setVolume(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-teal-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white" />
                    </>
                  )}
                </div>

                <button
                  onClick={handleCalculateMolarity}
                  className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
                >
                  Calculate
                </button>

                {calcResult && (
                  <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-teal-200 bg-teal-50 p-3 text-lg font-black text-teal-800 dark:border-teal-900/50 dark:bg-teal-900/20 dark:text-teal-400">
                    <Check className="h-5 w-5" />
                    {calcResult}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
