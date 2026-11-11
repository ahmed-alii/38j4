// Units. The scene is built in metres (1 three.js unit = 1 m) so that it is 1:1 with the real plot.
// DHA documents and Pakistani builders work in feet and inches, so everything is entered in feet
// and displayed in feet-inches first, metres second.

export const FT = 0.3048;
export const IN = 0.0254;

/** feet → metres */
export const ft = (v) => v * FT;

/** metres → "15′ 9″" (rounded to the nearest half inch) */
export function fmtFtIn(m) {
  const neg = m < 0;
  const totalIn = Math.round((Math.abs(m) / IN) * 2) / 2;
  let f = Math.floor(totalIn / 12);
  let inch = totalIn - f * 12;
  if (inch >= 12) { f += 1; inch -= 12; }
  const whole = Math.floor(inch);
  const half = inch - whole >= 0.5;
  const inStr = half ? (whole === 0 ? '½' : `${whole}½`) : `${whole}`;
  return `${neg ? '−' : ''}${f}′ ${inStr}″`;
}

export const fmtM = (m) => `${m.toFixed(2)} m`;

export const fmtSqft = (sqft) => `${Math.round(sqft).toLocaleString('en-US')} sq ft`;

/** sq ft → "251 m²" */
export const fmtSqm = (sqft) => `${Math.round(sqft * FT * FT).toLocaleString('en-US')} m²`;
