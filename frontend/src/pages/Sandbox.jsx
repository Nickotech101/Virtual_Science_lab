import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import BackButton from "../components/BackButton";

const PHYSICS_PRESETS = [
  { name: "Earth (9.81 m/s²)", gravity: 9.81, color: "from-green-500 to-emerald-700" },
  { name: "Moon (1.62 m/s²)", gravity: 1.62, color: "from-slate-400 to-slate-600" },
  { name: "Mars (3.71 m/s²)", gravity: 3.71, color: "from-red-500 to-orange-700" },
  { name: "Jupiter (24.79 m/s²)", gravity: 24.79, color: "from-amber-600 to-yellow-800" },
];

const CHEMISTRY_INDICATORS = [
  { name: "Phenolphthalein", pKa: 9.4, colorAcid: "#f8fafc", colorBase: "#f43f5e" },
  { name: "Bromothymol Blue", pKa: 7.0, colorAcid: "#eab308", colorBase: "#2563eb" },
  { name: "Methyl Orange", pKa: 3.7, colorAcid: "#ef4444", colorBase: "#f97316" },
];

const Sandbox = () => {
  const [sandboxMode, setSandboxMode] = useState("physics"); // 'physics' or 'chemistry'

  // ==========================================
  // PHYSICS STATE
  // ==========================================
  const [physicsAngle, setPhysicsAngle] = useState(45); // degrees
  const [physicsSpeed, setPhysicsSpeed] = useState(20); // m/s
  const [physicsGravity, setPhysicsGravity] = useState(9.81);
  const [physicsMass, setPhysicsMass] = useState(1.0); // kg
  const [physicsTargetDist, setPhysicsTargetDist] = useState(35); // meters
  const [physicsPlotData, setPhysicsPlotData] = useState([]);
  const [physicsSimulating, setPhysicsSimulating] = useState(false);
  const [physicsAccuracy, setPhysicsAccuracy] = useState(null);

  // Animation refs/states
  const canvasRefPhysics = useRef(null);
  const simIntervalPhysics = useRef(null);
  const physicsBallPos = useRef({ x: 0, y: 0, vx: 0, vy: 0, t: 0 });
  const physicsPath = useRef([]);

  // ==========================================
  // CHEMISTRY STATE
  // ==========================================
  const [chemAcidConc, setChemAcidConc] = useState(0.1); // M
  const [chemBaseConc, setChemBaseConc] = useState(0.1); // M
  const [chemAcidVol, setChemAcidVol] = useState(25.0); // mL
  const [chemBaseAdded, setChemBaseAdded] = useState(0.0); // mL
  const [chemDropSpeed, setChemDropSpeed] = useState(5); // drops per second (1 drop = 0.05 mL)
  const [chemIndicator, setChemIndicator] = useState(CHEMISTRY_INDICATORS[0]);
  const [chemSimulating, setChemSimulating] = useState(false);
  const [chemPlotData, setChemPlotData] = useState([]);

  // Animation refs
  const canvasRefChemistry = useRef(null);
  const simIntervalChemistry = useRef(null);

  // ==========================================
  // PERSISTENCE (LOCAL STORAGE)
  // ==========================================
  useEffect(() => {
    const savedPhysics = localStorage.getItem("simlab_physics_settings");
    if (savedPhysics) {
      try {
        const parsed = JSON.parse(savedPhysics);
        setPhysicsAngle(parsed.angle ?? 45);
        setPhysicsSpeed(parsed.speed ?? 20);
        setPhysicsGravity(parsed.gravity ?? 9.81);
        setPhysicsMass(parsed.mass ?? 1.0);
        setPhysicsTargetDist(parsed.targetDist ?? 35);
      } catch (e) {
        console.error("Failed parsing physics settings", e);
      }
    }

    const savedChemistry = localStorage.getItem("simlab_chemistry_settings");
    if (savedChemistry) {
      try {
        const parsed = JSON.parse(savedChemistry);
        setChemAcidConc(parsed.acidConc ?? 0.1);
        setChemBaseConc(parsed.baseConc ?? 0.1);
        setChemAcidVol(parsed.acidVol ?? 25.0);
        setChemDropSpeed(parsed.dropSpeed ?? 5);
        const savedInd = CHEMISTRY_INDICATORS.find(ind => ind.name === parsed.indicatorName);
        if (savedInd) setChemIndicator(savedInd);
      } catch (e) {
        console.error("Failed parsing chemistry settings", e);
      }
    }
  }, []);

  const savePhysicsSettings = () => {
    localStorage.setItem(
      "simlab_physics_settings",
      JSON.stringify({
        angle: physicsAngle,
        speed: physicsSpeed,
        gravity: physicsGravity,
        mass: physicsMass,
        targetDist: physicsTargetDist,
      })
    );
  };

  const saveChemistrySettings = () => {
    localStorage.setItem(
      "simlab_chemistry_settings",
      JSON.stringify({
        acidConc: chemAcidConc,
        baseConc: chemBaseConc,
        acidVol: chemAcidVol,
        dropSpeed: chemDropSpeed,
        indicatorName: chemIndicator.name,
      })
    );
  };

  // ==========================================
  // PHYSICS ANIMATION LOOP
  // ==========================================
  useEffect(() => {
    if (sandboxMode === "physics") {
      drawPhysicsFrame();
    }
  }, [physicsAngle, physicsTargetDist, physicsGravity, sandboxMode]);

  const drawPhysicsFrame = () => {
    const canvas = canvasRefPhysics.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw sky/background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    bgGrad.addColorStop(0, "#0f172a");
    bgGrad.addColorStop(1, "#1e1b4b");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Gridlines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Scale mapping: 600px width = 100 meters, 400px height = 66 meters. Origin is (40, 360)
    const toPxX = (m) => 40 + m * 5.2;
    const toPxY = (m) => 360 - m * 5.2;

    // Draw Ground
    ctx.fillStyle = "#334155";
    ctx.fillRect(0, 360, canvas.width, canvas.height - 360);
    ctx.fillStyle = "#10b981";
    ctx.fillRect(0, 360, canvas.width, 4);

    // Draw Target
    const targetPx = toPxX(physicsTargetDist);
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(targetPx, 360, 15, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(targetPx, 360, 10, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(targetPx, 360, 5, Math.PI, 0);
    ctx.fill();

    // Draw Cannon at origin (0, 0) -> (40, 360)
    const originX = 40;
    const originY = 360;
    ctx.save();
    ctx.translate(originX, originY);
    ctx.rotate((-physicsAngle * Math.PI) / 180);
    ctx.fillStyle = "#64748b";
    ctx.fillRect(-5, -12, 35, 16);
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 3;
    ctx.strokeRect(-5, -12, 35, 16);
    ctx.restore();

    ctx.fillStyle = "#475569";
    ctx.beginPath();
    ctx.arc(originX, originY, 12, 0, Math.PI * 2);
    ctx.fill();

    // Draw trajectory path trace
    if (physicsPath.current.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = "rgba(129, 140, 248, 0.6)";
      ctx.lineWidth = 3;
      ctx.setLineDash([4, 4]);
      ctx.moveTo(toPxX(physicsPath.current[0].x), toPxY(physicsPath.current[0].y));
      for (let i = 1; i < physicsPath.current.length; i++) {
        ctx.lineTo(toPxX(physicsPath.current[i].x), toPxY(physicsPath.current[i].y));
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw ball during simulation
    if (physicsSimulating) {
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(
        toPxX(physicsBallPos.current.x),
        toPxY(physicsBallPos.current.y),
        6,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.shadowColor = "#f59e0b";
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0; // reset
    }
  };

  const startPhysicsSimulation = () => {
    if (physicsSimulating) return;

    // Reset ball position
    physicsPath.current = [];
    setPhysicsPlotData([]);
    setPhysicsAccuracy(null);
    setPhysicsSimulating(true);

    const rad = (physicsAngle * Math.PI) / 180;
    physicsBallPos.current = {
      x: 0,
      y: 0,
      vx: physicsSpeed * Math.cos(rad),
      vy: physicsSpeed * Math.sin(rad),
      t: 0,
    };

    const dt = 0.05; // seconds per frame step
    const dataPoints = [];

    simIntervalPhysics.current = setInterval(() => {
      const pos = physicsBallPos.current;

      // Update position (basic Euler integration)
      pos.x += pos.vx * dt;
      pos.y += pos.vy * dt;
      pos.vy -= physicsGravity * dt; // gravity deceleration
      pos.t += dt;

      physicsPath.current.push({ x: pos.x, y: pos.y });

      // Save chart coordinate
      dataPoints.push({
        time: parseFloat(pos.t.toFixed(2)),
        height: parseFloat(Math.max(0, pos.y).toFixed(2)),
        distance: parseFloat(pos.x.toFixed(2)),
      });

      // Hit boundary check
      if (pos.y <= 0) {
        clearInterval(simIntervalPhysics.current);
        setPhysicsSimulating(false);

        // Calculate accuracy
        const diff = Math.abs(pos.x - physicsTargetDist);
        if (diff < 1.5) {
          setPhysicsAccuracy("Direct Hit! 🎯 (100% accuracy)");
        } else if (diff < 5) {
          setPhysicsAccuracy(`Near Miss! 🔔 (${Math.round((1 - diff / 5) * 100)}% accuracy)`);
        } else {
          setPhysicsAccuracy("Missed the target. Try adjusting angle or speed! ☄️");
        }

        // Set plot data
        setPhysicsPlotData(dataPoints);
      }

      drawPhysicsFrame();
    }, 25);
  };

  const resetPhysics = () => {
    if (simIntervalPhysics.current) clearInterval(simIntervalPhysics.current);
    physicsPath.current = [];
    setPhysicsPlotData([]);
    setPhysicsSimulating(false);
    setPhysicsAccuracy(null);
    drawPhysicsFrame();
  };

  // ==========================================
  // CHEMISTRY SIMULATION LOOP
  // ==========================================
  useEffect(() => {
    if (sandboxMode === "chemistry") {
      drawChemistryFrame();
    }
  }, [chemBaseAdded, chemIndicator, sandboxMode]);

  const drawChemistryFrame = () => {
    const canvas = canvasRefChemistry.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dark backdrop style
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Gridlines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Determine current pH and corresponding liquid color
    const currentPh = calculatepH(chemBaseAdded);

    // Color interpolation between acid state and base state based on pH relative to indicator pKa
    const delta = currentPh - chemIndicator.pKa;
    let transitionFactor = 0; // 0 = Acid color, 1 = Base color
    if (delta <= -1) {
      transitionFactor = 0;
    } else if (delta >= 1) {
      transitionFactor = 1;
    } else {
      transitionFactor = (delta + 1) / 2;
    }

    // Interpolate hex colors (simple mix helper)
    const mixColors = (color1, color2, weight) => {
      const hex = (x) => x.toString(16).padStart(2, "0");
      const c1 = color1.startsWith("#") ? color1 : "#ffffff";
      const c2 = color2.startsWith("#") ? color2 : "#f43f5e";
      const r1 = parseInt(c1.slice(1, 3), 16);
      const g1 = parseInt(c1.slice(3, 5), 16);
      const b1 = parseInt(c1.slice(5, 7), 16);

      const r2 = parseInt(c2.slice(1, 3), 16);
      const g2 = parseInt(c2.slice(3, 5), 16);
      const b2 = parseInt(c2.slice(5, 7), 16);

      const r = Math.round(r1 + (r2 - r1) * weight);
      const g = Math.round(g1 + (g2 - g1) * weight);
      const b = Math.round(b1 + (b2 - b1) * weight);

      return `#${hex(r)}${hex(g)}${hex(b)}`;
    };

    const solutionColor = mixColors(chemIndicator.colorAcid, chemIndicator.colorBase, transitionFactor);

    // Draw Stand
    ctx.fillStyle = "#64748b";
    ctx.fillRect(160, 40, 10, 320); // vertical post
    ctx.fillRect(100, 350, 140, 15); // stand base

    // Draw Clamp
    ctx.fillStyle = "#475569";
    ctx.fillRect(170, 120, 70, 8); // clamp arm
    ctx.fillRect(170, 260, 70, 8); // secondary clamp

    // Draw Buret (Liquid column)
    const buretLeft = 230;
    const buretWidth = 16;
    ctx.fillStyle = "rgba(148, 163, 184, 0.15)";
    ctx.fillRect(buretLeft, 50, buretWidth, 190); // body
    ctx.strokeStyle = "#94a3b8";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(buretLeft, 50, buretWidth, 190);

    // Base liquid in Buret
    const remainingBasePct = Math.max(0, (50 - chemBaseAdded) / 50);
    const liquidHt = 180 * remainingBasePct;
    const buretFillGrad = ctx.createLinearGradient(buretLeft, 50, buretLeft + buretWidth, 50);
    buretFillGrad.addColorStop(0, "rgba(59, 130, 246, 0.4)");
    buretFillGrad.addColorStop(1, "rgba(29, 78, 216, 0.4)");
    ctx.fillStyle = buretFillGrad;
    ctx.fillRect(buretLeft, 230 - liquidHt, buretWidth, liquidHt);

    // Draw buret marks
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 1;
    for (let mark = 0; mark <= 180; mark += 18) {
      ctx.beginPath();
      ctx.moveTo(buretLeft, 50 + mark);
      ctx.lineTo(buretLeft + 6, 50 + mark);
      ctx.stroke();
    }

    // Buret Tip / Stopcock
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(buretLeft - 4, 240, 24, 8); // stopcock valve
    ctx.fillStyle = "#475569";
    ctx.beginPath();
    ctx.moveTo(buretLeft + 5, 248);
    ctx.lineTo(buretLeft + 8, 275);
    ctx.lineTo(buretLeft + 11, 275);
    ctx.lineTo(buretLeft + 11, 248);
    ctx.fill();

    // Drop animation during titration
    if (chemSimulating && chemBaseAdded < 50) {
      ctx.fillStyle = "#3b82f6";
      ctx.beginPath();
      ctx.arc(buretLeft + 8, 285 + ((Date.now() % 200) / 200) * 25, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Erlenmeyer Flask below (centered at X: 238, bottom Y: 350)
    const flaskX = 238;
    const flaskBottomY = 350;
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(flaskX - 12, flaskBottomY - 70); // neck top left
    ctx.lineTo(flaskX + 12, flaskBottomY - 70); // neck top right
    ctx.lineTo(flaskX + 12, flaskBottomY - 50); // neck bottom right
    ctx.lineTo(flaskX + 45, flaskBottomY);      // body right base
    ctx.lineTo(flaskX - 45, flaskBottomY);      // body left base
    ctx.lineTo(flaskX - 12, flaskBottomY - 50); // body left shoulder
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw Solution inside the flask
    ctx.fillStyle = solutionColor;
    ctx.beginPath();
    const fillY = flaskBottomY - 24; // level of liquid
    ctx.moveTo(flaskX - 25, fillY);
    ctx.lineTo(flaskX + 25, fillY);
    ctx.lineTo(flaskX + 42, flaskBottomY);
    ctx.lineTo(flaskX - 42, flaskBottomY);
    ctx.closePath();
    ctx.fill();
  };

  const calculatepH = (baseVol) => {
    // Basic acid-base calculations: HCl (strong acid) vs NaOH (strong base)
    const molesH = (chemAcidVol / 1000) * chemAcidConc;
    const molesOH = (baseVol / 1000) * chemBaseConc;

    if (molesH > molesOH) {
      // Acidic range
      const remainingMolesH = molesH - molesOH;
      const totalVolL = (chemAcidVol + baseVol) / 1000;
      const concH = remainingMolesH / totalVolL;
      return parseFloat(Math.max(1.0, -Math.log10(concH)).toFixed(2));
    } else if (molesOH > molesH) {
      // Alkaline range
      const remainingMolesOH = molesOH - molesH;
      const totalVolL = (chemAcidVol + baseVol) / 1000;
      const concOH = remainingMolesOH / totalVolL;
      const pOH = -Math.log10(concOH);
      return parseFloat(Math.min(14.0, 14 - pOH).toFixed(2));
    } else {
      // Neutral
      return 7.0;
    }
  };

  const startChemistrySimulation = () => {
    if (chemSimulating) return;

    setChemSimulating(true);
    const stepMl = 0.05; // 1 drop = 0.05 mL
    let baseVol = chemBaseAdded;
    const newPlotData = [];

    simIntervalChemistry.current = setInterval(() => {
      if (baseVol >= 50.0) {
        clearInterval(simIntervalChemistry.current);
        setChemSimulating(false);
        return;
      }

      baseVol += stepMl * (chemDropSpeed / 5);
      if (baseVol > 50) baseVol = 50;

      const pH = calculatepH(baseVol);

      setChemBaseAdded(parseFloat(baseVol.toFixed(2)));

      newPlotData.push({
        baseVolume: parseFloat(baseVol.toFixed(2)),
        pH: pH,
      });

      // Periodically update state data for charting
      if (Math.round(baseVol * 20) % 5 === 0 || baseVol >= 50) {
        setChemPlotData([...newPlotData]);
      }

      drawChemistryFrame();
    }, 40);
  };

  const stopChemistrySimulation = () => {
    if (simIntervalChemistry.current) clearInterval(simIntervalChemistry.current);
    setChemSimulating(false);
  };

  const resetChemistry = () => {
    stopChemistrySimulation();
    setChemBaseAdded(0.0);
    setChemPlotData([]);
    setTimeout(drawChemistryFrame, 50);
  };

  // ==========================================
  // CSV EXPORT UTILITY
  // ==========================================
  const exportCSV = () => {
    let headers = "";
    let rows = [];
    let fileName = "";

    if (sandboxMode === "physics") {
      headers = "Time (s),Distance (m),Height (m)\n";
      rows = physicsPlotData.map(d => `${d.time},${d.distance},${d.height}`);
      fileName = "physics_projectile_simulation.csv";
    } else {
      headers = "Volume of Base Added (mL),pH Level\n";
      rows = chemPlotData.map(d => `${d.baseVolume},${d.pH}`);
      fileName = "chemistry_titration_simulation.csv";
    }

    const csvContent = "data:text/csv;charset=utf-8," + headers + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12 transition-all duration-300">
      <div className="max-w-7xl mx-auto">
        <BackButton label="Back to Lab" />

        {/* Heading Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 mt-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              🧪 SimLab <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400">Sandbox Workspace</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold mt-1">
              Customize starting conditions, simulate, and observe equations in action offline.
            </p>
          </div>

          {/* Toggle Tab */}
          <div className="flex p-1 bg-slate-200 dark:bg-slate-900 rounded-xl border border-slate-300/40 dark:border-slate-800/40">
            <button
              onClick={() => {
                setSandboxMode("physics");
                resetChemistry();
              }}
              className={`px-6 py-2 rounded-lg font-black text-xs uppercase tracking-wider transition-all duration-300 ${
                sandboxMode === "physics"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Physics Projectile
            </button>
            <button
              onClick={() => {
                setSandboxMode("chemistry");
                resetPhysics();
              }}
              className={`px-6 py-2 rounded-lg font-black text-xs uppercase tracking-wider transition-all duration-300 ${
                sandboxMode === "chemistry"
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Chemistry Titrator
            </button>
          </div>
        </div>

        {/* Outer Glassmorphic Flex Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* CONTROL SIDEBAR (1/3 COL) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <h3 className="text-lg font-black text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800/60 pb-3 flex items-center gap-2">
              ⚙️ Controls Panel
            </h3>

            {sandboxMode === "physics" ? (
              // PHYSICS CONTROLS
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between items-center text-xs font-black text-slate-500 dark:text-slate-400 mb-2">
                    <span>LAUNCH ANGLE</span>
                    <span className="font-mono text-indigo-500">{physicsAngle}°</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    value={physicsAngle}
                    onChange={(e) => setPhysicsAngle(parseInt(e.target.value))}
                    disabled={physicsSimulating}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-black text-slate-500 dark:text-slate-400 mb-2">
                    <span>INITIAL VELOCITY</span>
                    <span className="font-mono text-indigo-500">{physicsSpeed} m/s</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="45"
                    value={physicsSpeed}
                    onChange={(e) => setPhysicsSpeed(parseInt(e.target.value))}
                    disabled={physicsSimulating}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-black text-slate-500 dark:text-slate-400 mb-2">
                    <span>TARGET DISTANCE</span>
                    <span className="font-mono text-indigo-500">{physicsTargetDist} meters</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    value={physicsTargetDist}
                    onChange={(e) => setPhysicsTargetDist(parseInt(e.target.value))}
                    disabled={physicsSimulating}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 dark:text-slate-400 mb-2">
                    SELECT GRAVITY ENVIRONMENT
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PHYSICS_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => setPhysicsGravity(preset.gravity)}
                        disabled={physicsSimulating}
                        className={`py-2 px-3 rounded-xl text-center font-bold text-[11px] border transition-all duration-200 ${
                          physicsGravity === preset.gravity
                            ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-950 dark:border-white"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-950/40 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800"
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 space-y-2.5">
                  <button
                    onClick={startPhysicsSimulation}
                    disabled={physicsSimulating}
                    className="w-full font-black text-xs uppercase tracking-wider py-3 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all duration-300 disabled:opacity-50"
                  >
                    🔥 Fire Projectile
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={resetPhysics}
                      className="flex-1 font-black text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all"
                    >
                      Reset
                    </button>
                    <button
                      onClick={savePhysicsSettings}
                      className="flex-1 font-black text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl border border-indigo-200 dark:border-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all"
                    >
                      Save Preset
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // CHEMISTRY CONTROLS
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between items-center text-xs font-black text-slate-500 dark:text-slate-400 mb-2">
                    <span>ACID CONCENTRATION (HCl)</span>
                    <span className="font-mono text-indigo-500">{chemAcidConc} M</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1.0"
                    step="0.05"
                    value={chemAcidConc}
                    onChange={(e) => setChemAcidConc(parseFloat(e.target.value))}
                    disabled={chemSimulating}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-black text-slate-500 dark:text-slate-400 mb-2">
                    <span>BASE CONCENTRATION (NaOH)</span>
                    <span className="font-mono text-indigo-500">{chemBaseConc} M</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1.0"
                    step="0.05"
                    value={chemBaseConc}
                    onChange={(e) => setChemBaseConc(parseFloat(e.target.value))}
                    disabled={chemSimulating}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-black text-slate-500 dark:text-slate-400 mb-2">
                    <span>FLASK ACID VOLUME</span>
                    <span className="font-mono text-indigo-500">{chemAcidVol} mL</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="5"
                    value={chemAcidVol}
                    onChange={(e) => setChemAcidVol(parseInt(e.target.value))}
                    disabled={chemSimulating}
                    className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-500 dark:text-slate-400 mb-2">
                    pH INDICATOR
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {CHEMISTRY_INDICATORS.map((ind) => (
                      <button
                        key={ind.name}
                        onClick={() => setChemIndicator(ind)}
                        disabled={chemSimulating}
                        className={`py-2.5 px-4 rounded-xl text-left font-bold text-[11px] border flex justify-between items-center transition-all ${
                          chemIndicator.name === ind.name
                            ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-950 dark:border-white"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 dark:bg-slate-950/40 dark:text-slate-300 dark:border-slate-800 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span>{ind.name}</span>
                        <span className="opacity-75 font-mono">Transition pH ~ {ind.pKa}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 space-y-2.5">
                  <div className="flex gap-2">
                    <button
                      onClick={startChemistrySimulation}
                      disabled={chemSimulating || chemBaseAdded >= 50}
                      className="flex-1 font-black text-xs uppercase tracking-wider py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50"
                    >
                      💧 Start Drop
                    </button>
                    <button
                      onClick={stopChemistrySimulation}
                      disabled={!chemSimulating}
                      className="flex-1 font-black text-xs uppercase tracking-wider py-3 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white transition-all disabled:opacity-50"
                    >
                      ⏸️ Pause
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={resetChemistry}
                      className="flex-1 font-black text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all"
                    >
                      Reset
                    </button>
                    <button
                      onClick={saveChemistrySettings}
                      className="flex-1 font-black text-xs uppercase tracking-wider py-2.5 px-4 rounded-xl border border-indigo-200 dark:border-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all"
                    >
                      Save Preset
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* DYNAMIC CANVAS VISUALIZER (2/3 COL) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex justify-between items-center mb-4 border-b border-slate-100 dark:border-slate-800/60 pb-3">
                <h3 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
                  🎨 Live Simulation Canvas
                </h3>
                {sandboxMode === "chemistry" && (
                  <div className="flex gap-4">
                    <span className="text-xs font-black text-slate-500 dark:text-slate-400">
                      Volume Added: <span className="font-mono text-indigo-500">{chemBaseAdded.toFixed(2)} mL</span>
                    </span>
                    <span className="text-xs font-black text-slate-500 dark:text-slate-400">
                      Solution pH: <span className="font-mono text-indigo-500">{calculatepH(chemBaseAdded)}</span>
                    </span>
                  </div>
                )}
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-slate-250 dark:border-slate-800 bg-[#0f172a] shadow-inner">
                {sandboxMode === "physics" ? (
                  <canvas
                    ref={canvasRefPhysics}
                    width={600}
                    height={400}
                    className="w-full h-auto block"
                  />
                ) : (
                  <canvas
                    ref={canvasRefChemistry}
                    width={600}
                    height={400}
                    className="w-full h-auto block"
                  />
                )}
              </div>

              {/* Simulation metrics feedback */}
              {sandboxMode === "physics" && physicsAccuracy && (
                <div className="mt-4 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-center text-sm font-black tracking-tight animate-fadeIn">
                  {physicsAccuracy}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DYNAMIC GRAPHS & EXPORTER SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 items-stretch">
          
          {/* DATA GRAPH COMPONENT */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl">
            <h3 className="text-lg font-black text-slate-800 dark:text-white mb-6 border-b border-slate-100 dark:border-slate-800/60 pb-3 flex items-center gap-2">
              📊 Continuous Graph Plotter
            </h3>

            {sandboxMode === "physics" ? (
              physicsPlotData.length >= 2 ? (
                <div className="w-full h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={physicsPlotData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                      <XAxis
                        dataKey="distance"
                        type="number"
                        name="Distance"
                        unit="m"
                        tick={{ fill: "var(--text-muted, #94a3b8)", fontSize: 11 }}
                        label={{ value: "Distance (m)", position: "insideBottom", offset: -10, fill: "#94a3b8" }}
                      />
                      <YAxis
                        dataKey="height"
                        type="number"
                        name="Height"
                        unit="m"
                        tick={{ fill: "var(--text-muted, #94a3b8)", fontSize: 11 }}
                        label={{ value: "Height (m)", angle: -90, position: "insideLeft", offset: -5, fill: "#94a3b8" }}
                      />
                      <Tooltip contentStyle={{ borderRadius: "8px", backgroundColor: "#0f172a", border: "1px solid #1e293b", color: "#f8fafc" }} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="height"
                        name="Trajectory"
                        stroke="#6366f1"
                        strokeWidth={3}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 text-slate-400 dark:text-slate-600 font-bold text-xs italic">
                  Launch the projectile to plot the trajectory graph dynamically!
                </div>
              )
            ) : chemPlotData.length >= 2 ? (
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chemPlotData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                    <XAxis
                      dataKey="baseVolume"
                      type="number"
                      name="Base Volume"
                      unit="mL"
                      tick={{ fill: "var(--text-muted, #94a3b8)", fontSize: 11 }}
                      label={{ value: "Base Added (mL)", position: "insideBottom", offset: -10, fill: "#94a3b8" }}
                    />
                    <YAxis
                      dataKey="pH"
                      type="number"
                      domain={[0, 14]}
                      tick={{ fill: "var(--text-muted, #94a3b8)", fontSize: 11 }}
                      label={{ value: "pH Value", angle: -90, position: "insideLeft", offset: -5, fill: "#94a3b8" }}
                    />
                    <Tooltip contentStyle={{ borderRadius: "8px", backgroundColor: "#0f172a", border: "1px solid #1e293b", color: "#f8fafc" }} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="pH"
                      name="pH curve"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20 text-slate-400 dark:text-slate-600 font-bold text-xs italic">
                Start adding drops of base to plot the titration curve!
              </div>
            )}
          </div>

          {/* TABLE LOGS & CSV DOWNLOAD (1/3 COL) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-white mb-4 border-b border-slate-100 dark:border-slate-800/60 pb-3 flex items-center justify-between">
                <span>📋 Run Logger</span>
                <span className="text-[10px] font-black uppercase text-indigo-500 tracking-wider">Auto logs</span>
              </h3>

              <div className="overflow-y-auto max-h-[180px] rounded-xl border border-slate-150 dark:border-slate-800">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950/40 text-[10px] font-black text-slate-400 tracking-wider border-b border-slate-150 dark:border-slate-850">
                      {sandboxMode === "physics" ? (
                        <>
                          <th className="p-3">DIST (m)</th>
                          <th className="p-3">HEIGHT (m)</th>
                          <th className="p-3">TIME (s)</th>
                        </>
                      ) : (
                        <>
                          <th className="p-3">VOL ADDED</th>
                          <th className="p-3">pH VALUE</th>
                          <th className="p-3">STATE</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {sandboxMode === "physics" ? (
                      physicsPlotData.slice(-6).reverse().map((row, i) => (
                        <tr key={i} className="text-xs font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-850/40">
                          <td className="p-3 font-mono">{row.distance}m</td>
                          <td className="p-3 font-mono">{row.height}m</td>
                          <td className="p-3 font-mono">{row.time}s</td>
                        </tr>
                      ))
                    ) : (
                      chemPlotData.slice(-6).reverse().map((row, i) => (
                        <tr key={i} className="text-xs font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-850/40">
                          <td className="p-3 font-mono">{row.baseVolume} mL</td>
                          <td className="p-3 font-mono">{row.pH}</td>
                          <td className="p-3 font-black text-[10px] uppercase">
                            {row.pH < 6.5 ? (
                              <span className="text-red-500">Acid</span>
                            ) : row.pH > 7.5 ? (
                              <span className="text-blue-500">Base</span>
                            ) : (
                              <span className="text-emerald-500">Neutral</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                    {((sandboxMode === "physics" ? physicsPlotData : chemPlotData).length === 0) && (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-xs font-medium text-slate-400 dark:text-slate-600">
                          No logged points yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <button
              onClick={exportCSV}
              disabled={(sandboxMode === "physics" ? physicsPlotData : chemPlotData).length === 0}
              className="mt-6 w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-800 dark:hover:bg-slate-700"
            >
              📥 Export Run Data (CSV)
            </button>
          </div>
        </div>

      </div>
    </main>
  );
};

export default Sandbox;
