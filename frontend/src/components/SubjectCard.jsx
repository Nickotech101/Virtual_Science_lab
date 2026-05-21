import { Link } from "react-router-dom";

const SubjectCard = ({ title, description, link }) => {
 
  const getIcon = (title) => {
    const t = title.trim().toLowerCase();

    if (t === "biology") return "🧬";
    if (t === "chemistry") return "⚗️";
    if (t === "physics") return "⚡";

    return "📘";
  };

  return (
    <Link
      to={link}
      style={{
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "24px",
          backgroundColor: "#ffffff",
          boxShadow: "0 6px 10px rgba(0,0,0,0.06)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-6px)";
          e.currentTarget.style.boxShadow = "0 10px 18px rgba(0,0,0,0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 6px 10px rgba(0,0,0,0.06)";
        }}
      >

        {/* ICON ADDED HERE */}
        <div style={{ fontSize: "28px", marginBottom: "10px" }}>
          {getIcon(title)}
        </div>

        <h2 style={{ marginBottom: "10px", color: "#1e293b" }}>
          {title}
        </h2>

        <p style={{ fontSize: "14px", color: "#6b7280" }}>
          {description}
        </p>

      </div>
    </Link>
  );
};

export default SubjectCard;