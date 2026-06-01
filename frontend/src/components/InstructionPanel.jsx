import ExperimentHintButton from "./ExperimentHintButton";

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
          <h3>Aim</h3>
          <p>{aim}</p>
        </>
      )}

      {theory && (
        <>
          <h3>Theory</h3>
          <p>{theory}</p>
        </>
      )}

      {procedure.length > 0 && (
        <>
          <h3>Procedure</h3>
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
          <h3>Observation</h3>
          <p>{observation}</p>
        </>
      )}

      {result && (
        <>
          <h3>Result</h3>
          <p>{result}</p>
        </>
      )}

      {precautions.length > 0 && (
        <>
          <h3>Precautions</h3>
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
