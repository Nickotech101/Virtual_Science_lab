// Utility to parse and balance simple chemical equations

function parseMolecule(moleculeStr) {
  const elements = {};
  // Regex to match Element (e.g. He, O, C) followed optionally by a number
  const regex = /([A-Z][a-z]*)(\d*)/g;
  let match;
  while ((match = regex.exec(moleculeStr)) !== null) {
    const elem = match[1];
    const count = match[2] ? parseInt(match[2]) : 1;
    elements[elem] = (elements[elem] || 0) + count;
  }
  // Handles brackets like (OH)2 -> not supported in this simple regex yet,
  // but for basic equations like H2 + O2 = H2O, C6H12O6 it works perfectly.
  return elements;
}

function parseEquation(equation) {
  // Split by = or ->
  const parts = equation.split(/=|->/);
  if (parts.length !== 2) throw new Error("Equation must have a left and right side separated by '=' or '->'");

  const lhsStrs = parts[0].split('+').map(s => s.trim()).filter(s => s);
  const rhsStrs = parts[1].split('+').map(s => s.trim()).filter(s => s);

  if (lhsStrs.length === 0 || rhsStrs.length === 0) throw new Error("Invalid equation structure");

  const lhs = lhsStrs.map(parseMolecule);
  const rhs = rhsStrs.map(parseMolecule);

  return { lhs, rhs, lhsStrs, rhsStrs };
}

// A simple brute-force search for small coefficients (up to 12)
// This works remarkably well and fast for 99% of educational equations.
export function balanceEquation(equationStr) {
  try {
    const { lhs, rhs, lhsStrs, rhsStrs } = parseEquation(equationStr);
    
    const allElements = new Set();
    [...lhs, ...rhs].forEach(mol => {
      Object.keys(mol).forEach(el => allElements.add(el));
    });

    const elementsArr = Array.from(allElements);
    
    const numLhs = lhs.length;
    const numRhs = rhs.length;
    const totalMols = numLhs + numRhs;

    // Brute force limits
    const MAX_COEF = 15;
    let solution = null;

    function search(depth, currentCoefs) {
      if (solution) return;
      if (depth === totalMols) {
        // Check if balanced
        let balanced = true;
        for (const el of elementsArr) {
          let leftCount = 0;
          for (let i = 0; i < numLhs; i++) {
            leftCount += (lhs[i][el] || 0) * currentCoefs[i];
          }
          let rightCount = 0;
          for (let i = 0; i < numRhs; i++) {
            rightCount += (rhs[i][el] || 0) * currentCoefs[numLhs + i];
          }
          if (leftCount !== rightCount) {
            balanced = false;
            break;
          }
        }
        if (balanced) {
          solution = [...currentCoefs];
        }
        return;
      }

      for (let i = 1; i <= MAX_COEF; i++) {
        currentCoefs.push(i);
        search(depth + 1, currentCoefs);
        currentCoefs.pop();
      }
    }

    search(0, []);

    if (!solution) {
      throw new Error("Could not balance equation with coefficients up to 15 or equation is invalid.");
    }

    // Format output
    const formatMol = (coef, molStr) => coef === 1 ? molStr : `${coef}${molStr}`;
    const leftSide = solution.slice(0, numLhs).map((c, i) => formatMol(c, lhsStrs[i])).join(" + ");
    const rightSide = solution.slice(numLhs).map((c, i) => formatMol(c, rhsStrs[i])).join(" + ");

    return `${leftSide} -> ${rightSide}`;

  } catch (err) {
    return `Error: ${err.message}`;
  }
}

export function calculateMolarity(mass, molarMass, volumeLiters) {
  if (!mass || !molarMass || !volumeLiters) return 0;
  const moles = parseFloat(mass) / parseFloat(molarMass);
  return moles / parseFloat(volumeLiters);
}

export function calculateMassFromMolarity(molarity, molarMass, volumeLiters) {
  if (!molarity || !molarMass || !volumeLiters) return 0;
  const moles = parseFloat(molarity) * parseFloat(volumeLiters);
  return moles * parseFloat(molarMass);
}
