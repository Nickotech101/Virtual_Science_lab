import ExperimentHintButton from "./ExperimentHintButton";
import TTSButton from "./TTSButton";
import { parseGlossary } from "../utils/glossaryParser";

const InstructionPanel = ({
  aim,
  theory,
  procedure = [],
  observation,
  result,
  precautions = [],
}) => {
  return (
    <div className="instruction-panel fade-in">
      <h2>Experiment Instructions</h2>

      {aim && (
        <>
          <h3 style={{ display: "flex", alignItems: "center" }}>
            Aim <TTSButton text={aim} ariaLabel="Read aim" />
          </h3>
          <p>{parseGlossary(aim)}</p>
        </>
      )}

      {theory && (
        <>
          <h3 style={{ display: "flex", alignItems: "center" }}>
            Theory <TTSButton text={theory} ariaLabel="Read theory" />
          </h3>
          <p>{parseGlossary(theory)}</p>
        </>
      )}

      {procedure.length > 0 && (
        <>
          <h3 style={{ display: "flex", alignItems: "center" }}>
            Procedure <TTSButton text={procedure.join(". ")} ariaLabel="Read procedure" />
          </h3>
          <ol>
            {procedure.map((step, index) => (
              <li key={index}>{parseGlossary(step)}</li>
            ))}
          </ol>
          <ExperimentHintButton />
        </>
      )}

      {observation && (
        <>
          <h3 style={{ display: "flex", alignItems: "center" }}>
            Observation <TTSButton text={observation} ariaLabel="Read observation" />
          </h3>
          <p>{parseGlossary(observation)}</p>
        </>
      )}

      {result && (
        <>
          <h3 style={{ display: "flex", alignItems: "center" }}>
            Result <TTSButton text={result} ariaLabel="Read result" />
          </h3>
          <p>{parseGlossary(result)}</p>
        </>
      )}

      {precautions.length > 0 && (
        <>
          <h3 style={{ display: "flex", alignItems: "center" }}>
            Precautions <TTSButton text={precautions.join(". ")} ariaLabel="Read precautions" />
          </h3>
          <ul>
            {precautions.map((item, index) => (
              <li key={index}>{parseGlossary(item)}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default InstructionPanel;
