import { Link } from "react-router-dom";

const ExperimentCard = ({ title, description, link }) => {
 
  const getIcon = (title) => {
    const t = title?.trim().toLowerCase();

    if (t === "biology") return "🧬";
    if (t === "chemistry") return "⚗️";
    if (t === "physics") return "⚡";

    return "📘";
  };
 
  const getTypeClass = (title) => {
    const t = title?.trim().toLowerCase();

    if (t === "biology") return "biology";
    if (t === "chemistry") return "chemistry";
    if (t === "physics") return "physics";

    return "";
  };

  return (
    <Link to={link} className="card-link">
      <div className={`experiment-card ${getTypeClass(title)}`}>

        {/* ICON */}
        <div className="card-icon">
          {getIcon(title)}
        </div>

        {/* CONTENT */}
        <h3>{title}</h3>
        <p>{description}</p>

      </div>
    </Link>
  );
};

export default ExperimentCard;