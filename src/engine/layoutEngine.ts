import type {
  AdContent,
  DecisionSignals,
  LayoutCandidate,
  LayoutDecision,
  LayoutMode,
  Surface,
} from '../types/layout'

import {
  SURFACES,
  getContentDensity,
} from './layoutRules'


/*
 * =========================================================
 * CANDIDATE SCORING
 * =========================================================
 */

function scoreCandidate(
  mode: LayoutMode,
  surface: Surface,
  content: AdContent
): LayoutCandidate {

  const density =
    getContentDensity(content)

  const headlineLength =
    content.headline.trim().length

  const descriptionLength =
    content.description.trim().length

  const ctaLength =
    content.cta.trim().length


  let score = 100


  /*
   * =======================================================
   * SURFACE PRESSURE
   * =======================================================
   */

  if (surface === 'mobile') {

    if (mode === 'split') {
      score -= 45
    }

    if (mode === 'balanced') {
      score -= 20
    }

    if (mode === 'stacked') {
      score += 0
    }
  }


  if (surface === 'tablet') {

    if (mode === 'split') {
      score -= 18
    }

    if (mode === 'balanced') {
      score += 2
    }

    if (mode === 'stacked') {
      score -= 4
    }
  }


  if (surface === 'desktop') {

    if (mode === 'split') {
      score += 4
    }

    if (mode === 'balanced') {
      score += 0
    }

    if (mode === 'stacked') {
      score -= 18
    }
  }


  /*
   * =======================================================
   * CONTENT PRESSURE
   * =======================================================
   */

  if (density === 'High') {

    if (mode === 'split') {
      score -= 28
    }

    if (mode === 'balanced') {
      score += 4
    }

    if (mode === 'stacked') {
      score += 8
    }
  }


  if (density === 'Low') {

    if (mode === 'split') {
      score += 5
    }

    if (mode === 'stacked') {
      score -= 8
    }
  }


  /*
   * =======================================================
   * HEADLINE PRESSURE
   * =======================================================
   */

  if (headlineLength > 60) {

    if (mode === 'split') {
      score -= 15
    }

    if (mode === 'balanced') {
      score += 3
    }

    if (mode === 'stacked') {
      score += 6
    }
  }


  /*
   * =======================================================
   * DESCRIPTION PRESSURE
   * =======================================================
   */

  if (descriptionLength > 100) {

    if (mode === 'split') {
      score -= 10
    }

    if (mode === 'balanced') {
      score += 3
    }

    if (mode === 'stacked') {
      score += 5
    }
  }


  /*
   * =======================================================
   * CTA PRESSURE
   * =======================================================
   */

  if (
    ctaLength === 0 ||
    ctaLength > 24
  ) {

    if (mode === 'split') {
      score -= 8
    }

    if (mode === 'balanced') {
      score -= 3
    }

    if (mode === 'stacked') {
      score += 2
    }
  }


  /*
   * Keep candidate scores within 0-100.
   */

  score =
    Math.max(
      0,
      Math.min(100, score)
    )


  /*
   * =======================================================
   * CANDIDATE RATIONALE
   * =======================================================
   */

  let rationale = ''

  if (mode === 'split') {

    rationale =
      'Maximizes parallel visual and content space.'

  } else if (mode === 'balanced') {

    rationale =
      'Balances visual presence with content readability.'

  } else {

    rationale =
      'Prioritizes vertical readability on constrained surfaces.'
  }


  return {
    mode,
    score,
    rationale,
  }
}


/*
 * =========================================================
 * MAIN LAYOUT EVALUATION
 * =========================================================
 */

export function evaluateLayout(
  surface: Surface,
  content: AdContent
): LayoutDecision {

  const density =
    getContentDensity(content)


  /*
   * =======================================================
   * EVALUATE ALL AVAILABLE LAYOUTS
   * =======================================================
   */

  const modes: LayoutMode[] = [
    'split',
    'balanced',
    'stacked',
  ]


  const candidates =
    modes
      .map((mode) =>
        scoreCandidate(
          mode,
          surface,
          content
        )
      )
      .sort(
        (a, b) =>
          b.score - a.score
      )


  /*
   * Highest-scoring candidate becomes
   * the selected layout.
   */

  const mode =
    candidates[0].mode


  /*
   * =======================================================
   * DECISION SIGNALS
   * =======================================================
   */

  const surfacePressure =
    surface === 'mobile'
      ? 'High'
      : surface === 'tablet'
        ? 'Medium'
        : 'Low'


  const contentPressure =
    density === 'High'
      ? 'High'
      : density === 'Medium'
        ? 'Medium'
        : 'Low'


  const signals: DecisionSignals = {
    surfacePressure,
    contentPressure,
    selectedCandidate: mode,
  }


  /*
   * =======================================================
   * CONSTRAINT EVALUATION
   * =======================================================
   */

  const headlineLength =
    content.headline.trim().length

  const ctaLength =
    content.cta.trim().length


  /*
   * Typography pressure
   */

  const typography =
    surface === 'mobile'
      ? headlineLength <= 65
      : headlineLength <= 80


  /*
   * CTA visibility
   */

  const ctaVisibility =
    ctaLength >= 2 &&
    ctaLength <= 24


  /*
   * Visual balance
   */

  const visualBalance =
    density === 'High'
      ? mode !== 'split'
      : true


  /*
   * Safe margins
   *
   * The renderer reserves internal spacing
   * around the creative.
   */

  const safeMargins = true


  const constraints = {
    typography,
    ctaVisibility,
    visualBalance,
    safeMargins,
  }


  /*
   * =======================================================
   * WEIGHTED FIT SCORE
   * =======================================================
   */

  const weights = {
    typography: 0.35,
    visualBalance: 0.30,
    ctaVisibility: 0.20,
    safeMargins: 0.15,
  }


  const weightedScore =
    (constraints.typography
      ? weights.typography
      : 0) +

    (constraints.visualBalance
      ? weights.visualBalance
      : 0) +

    (constraints.ctaVisibility
      ? weights.ctaVisibility
      : 0) +

    (constraints.safeMargins
      ? weights.safeMargins
      : 0)


  const score =
    Math.round(
      weightedScore * 100
    )


  /*
   * =======================================================
   * ADAPTIVE LAYOUT PARAMETERS
   * =======================================================
   *
   * These values are generated by the engine
   * and consumed by the renderer.
   */

  const parameters = {

    textScale:
      surface === 'mobile'
        ? density === 'High'
          ? 0.86
          : 0.92
        : mode === 'balanced'
          ? 0.96
          : 1,


    contentWidth:
      mode === 'split'
        ? 0.48
        : mode === 'balanced'
          ? 0.58
          : 0.88,


    spacing:
      surface === 'mobile'
        ? 0.72
        : mode === 'stacked'
          ? 0.84
          : 1,


    ctaScale:
      surface === 'mobile'
        ? 0.92
        : density === 'High'
          ? 0.94
          : 1,


    visualEmphasis:
      mode === 'split'
        ? 1
        : mode === 'balanced'
          ? 0.92
          : 0.82,
  }


  /*
   * =======================================================
   * DECISION EXPLANATION
   * =======================================================
   */

  let reason = ''

  if (mode === 'stacked') {

    reason =
      'Limited width makes a vertical composition the safest readable layout.'

  } else if (mode === 'balanced') {

    reason =
      'Content density requires a more balanced allocation of visual and text space.'

  } else {

    reason =
      'Available width supports parallel visual and content regions.'
  }


  /*
   * =======================================================
   * ADAPTATION COUNT
   * =======================================================
   */

  let adaptations = 3


  if (mode === 'balanced') {
    adaptations = 4
  }


  if (mode === 'stacked') {

    adaptations =
      surface === 'mobile'
        ? 5
        : 4
  }


  /*
   * Additional adaptations caused by
   * problematic content.
   */

  if (!typography) {
    adaptations += 1
  }


  if (!ctaVisibility) {
    adaptations += 1
  }


  adaptations =
    Math.min(
      adaptations,
      7
    )


  /*
   * =======================================================
   * FINAL ENGINE DECISION
   * =======================================================
   */

  return {

    mode,

    label:
      mode === 'split'
        ? 'Split Layout'
        : mode === 'balanced'
          ? 'Balanced Layout'
          : 'Stacked Layout',

    reason,

    score,

    contentDensity:
      density,

    adaptations,

    constraints,

    surface:
      SURFACES[surface],

    candidates,

    parameters,

    signals,
  }
}