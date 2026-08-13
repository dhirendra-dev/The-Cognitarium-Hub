import React, { useState } from 'react';
import { BookOpen, AlertCircle, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';

interface Concept {
  chapter: string;
  core: string;
  traps: string;
}

const CONCEPT_VAULT: Record<string, Concept[]> = {
  physics: [
    {
      chapter: 'Rotational Dynamics',
      core: 'Rigid Body rotation involves pure rotational kinetics and dynamics. The Torque is defined as τ = r × F, and the fundamental governing equation is τ = Iα. For Rolling without Slipping on a rough horizontal surface, the condition is v_cm = ωR and a_cm = αR. Conservation of Angular Momentum (L = Iω = const) applies if the external torque τ_ext = 0.',
      traps: 'Students frequently forget to check if the point of rotation is accelerating when writing τ = Iα. If applying rotational mechanics about a moving/accelerating center of mass, you must include pseudo-forces or calculate torque strictly about the accelerating axis (which is usually tricky). Always prefer the instantaneous center of zero velocity (ICOR) for simpler calculations.'
    },
    {
      chapter: 'Thermodynamics',
      core: 'First Law of Thermodynamics is the conservation of energy: ΔQ = ΔU + W. Note the sign conventions: ΔQ > 0 if heat is supplied to the system, W > 0 if work is done by the system. For an ideal gas, ΔU = n C_v ΔT always. For Adiabatic Processes, PV^γ = constant where γ = C_p/C_v.',
      traps: 'In Chemistry, the sign convention of work is opposite (W = -PΔV is work done on the system). Always confirm which convention is being requested. Also, for adiabatic processes, do not use T_1 V_1^(γ-1) = T_2 V_2^(γ-1) with Celsius degrees; always convert to Kelvin first.'
    }
  ],
  chemistry: [
    {
      chapter: 'Chemical Bonding',
      core: 'Hybridisation state dictates geometry. Steric Number (SN) = (number of σ bonds) + (number of lone pairs on central atom). For SN=2 (sp, linear), SN=3 (sp², trigonal planar), SN=4 (sp³, tetrahedral), SN=5 (sp³d, trigonal bipyramidal), SN=6 (sp³d², octahedral). Molecular Orbital Theory (MOT) explains bond order, magnetic behavior, and fractional bond orders.',
      traps: 'In sp³d hybridization (e.g., PCl₅), axial bonds are longer and weaker than equatorial bonds due to high steric repulsion (90-degree interactions with three equatorial bonds). In SF₄, the lone pair goes to the equatorial position to minimize repulsion, forming a see-saw shape.'
    },
    {
      chapter: 'Ionic Equilibrium',
      core: 'For a weak acid HA ⇌ H⁺ + A⁻, the dissociation constant is K_a = [H⁺][A⁻]/[HA]. For weak acid-weak base buffers, pH is governed by the Henderson-Hasselbalch equation: pH = pK_a + log([Conjugate Base]/[Acid]). Solubility Product K_sp defines saturation limits for sparingly soluble salts.',
      traps: 'When calculating the pH of highly dilute strong acids (e.g., 10⁻⁸ M HCl), do not simply write pH = 8. You must include the auto-ionization contribution of water ([H⁺]_H2O ≈ 10⁻⁷), which yields a total [H⁺] = 1.1 × 10⁻⁷, so pH ≈ 6.96.'
    }
  ],
  math: [
    {
      chapter: 'Conic Sections - Ellipse',
      core: 'Standard equation: x²/a² + y²/b² = 1 (a > b). Eccentricity e = √(1 - b²/a²). Foci are at (±ae, 0). Directrices are x = ±a/e. Equation of tangent in slope form is y = mx ± √(a²m² + b²). Standard parameterization is (a cos θ, b sin θ).',
      traps: 'Be extremely careful of the "Auxiliary Circle" properties. The normal to an ellipse at point P(a cos θ, b sin θ) is given by ax/cos θ - by/sin θ = a² - b². Students frequently mix up the denominator terms with the tangent equation.'
    },
    {
      chapter: 'Permutations & Combinations',
      core: 'Fundamental Principles of Counting: Product Rule (AND) and Addition Rule (OR). Permutations of n distinct objects taken r at a time: ⁿP_r = n!/(n-r)!. Combinations (selection): ⁿC_r = n!/(r!(n-r)!). Circular Permutations of n distinct objects: (n-1)!. Multinomial theorem is highly effective for distributing identical/distinct elements into groups.',
      traps: 'In circular arrangement problems, check if clockwise and anti-clockwise arrangements are identical (like keyrings, necklaces). If so, divide the arrangements by 2. When applying constraints (e.g., "no two girls sit together"), place the non-restricted items first, then arrange inside the gaps.'
    }
  ]
};

export default function ConceptVault() {
  const [selectedSubject, setSelectedSubject] = useState<'physics' | 'chemistry' | 'math'>('physics');
  const [expandedChapter, setExpandedChapter] = useState<string | null>(null);

  const concepts = CONCEPT_VAULT[selectedSubject];

  const toggleChapter = (chapter: string) => {
    setExpandedChapter(expandedChapter === chapter ? null : chapter);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Lightbulb className="w-8 h-8 text-amber-400" />
            <h1 className="text-4xl font-bold text-white">Concept Vault</h1>
          </div>
          <p className="text-slate-300">Master core concepts and avoid common traps</p>
        </div>

        {/* Subject Tabs */}
        <div className="flex gap-4 mb-8">
          {(['physics', 'chemistry', 'math'] as const).map((subject) => (
            <button
              key={subject}
              onClick={() => {
                setSelectedSubject(subject);
                setExpandedChapter(null);
              }}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                selectedSubject === subject
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {subject.charAt(0).toUpperCase() + subject.slice(1)}
            </button>
          ))}
        </div>

        {/* Concepts List */}
        <div className="space-y-4">
          {concepts.map((concept, idx) => (
            <div
              key={idx}
              className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-slate-600 transition-colors"
            >
              {/* Header */}
              <button
                onClick={() => toggleChapter(concept.chapter)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex items-center gap-3 text-left">
                  <BookOpen className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <h3 className="text-lg font-semibold text-white">{concept.chapter}</h3>
                </div>
                {expandedChapter === concept.chapter ? (
                  <ChevronUp className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                )}
              </button>

              {/* Content */}
              {expandedChapter === concept.chapter && (
                <div className="px-6 py-4 bg-slate-700/30 border-t border-slate-700 space-y-4">
                  {/* Core Concepts */}
                  <div>
                    <h4 className="font-semibold text-blue-300 mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Core Concept
                    </h4>
                    <p className="text-slate-200 leading-relaxed">{concept.core}</p>
                  </div>

                  {/* Common Traps */}
                  <div>
                    <h4 className="font-semibold text-amber-300 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Common Traps & Mistakes
                    </h4>
                    <p className="text-slate-200 leading-relaxed">{concept.traps}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-12 p-6 bg-slate-800 border border-slate-700 rounded-lg">
          <p className="text-slate-300 text-sm">
            💡 <strong>Pro Tip:</strong> Review one concept daily. Understanding the "traps" section is crucial for avoiding silly mistakes in exams.
          </p>
        </div>
      </div>
    </div>
  );
}
