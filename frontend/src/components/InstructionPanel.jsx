import ExperimentHintButton from "./ExperimentHintButton";
import TTSButton from "./TTSButton";

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
          <p>{aim}</p>
        </>
      )}

      {theory && (
        <>
          <h3 style={{ display: "flex", alignItems: "center" }}>
            Theory <TTSButton text={theory} ariaLabel="Read theory" />
          </h3>
          <p>{theory}</p>
        </>
      )}

      {procedure.length > 0 && (
        <>
          <h3 style={{ display: "flex", alignItems: "center" }}>
            Procedure <TTSButton text={procedure.join(". ")} ariaLabel="Read procedure" />
          </h3>
          <ol>
            {procedure.map((step, index) => (
              <li key={index}>{step}</li>
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
          <p>{observation}</p>
        </>
      )}

      {result && (
        <>
          <h3 style={{ display: "flex", alignItems: "center" }}>
            Result <TTSButton text={result} ariaLabel="Read result" />
          </h3>
          <p>{result}</p>
        </>
      )}

      {precautions.length > 0 && (
        <>
          <h3 style={{ display: "flex", alignItems: "center" }}>
            Precautions <TTSButton text={precautions.join(". ")} ariaLabel="Read precautions" />
          </h3>
          <ul>
            {precautions.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default InstructionPanel;
