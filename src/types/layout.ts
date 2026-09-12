export type Surface = 'desktop' | 'tablet' | 'mobile'

export type LayoutMode =
  | 'split'
  | 'balanced'
  | 'stacked'

export interface LayoutCandidate {
  mode: LayoutMode
  score: number
  rationale: string
}

export interface LayoutParameters {
  textScale: number
  contentWidth: number
  spacing: number
  ctaScale: number
  visualEmphasis: number
}
export interface AdContent {
  brand: string
  headline: string
  description: string
  cta: string
}

export interface SurfaceConfig {
  surface: Surface
  label: string
  width: number
  height: number
}

export interface DecisionSignals {
  surfacePressure: 'Low' | 'Medium' | 'High'
  contentPressure: 'Low' | 'Medium' | 'High'
  selectedCandidate: LayoutMode
}

export interface LayoutDecision {
  mode: LayoutMode
  label: string
  score: number
  reason: string
  adaptations: number

  constraints: {
    typography: boolean
    ctaVisibility: boolean
    visualBalance: boolean
    safeMargins: boolean
  }

  contentDensity: 'Low' | 'Medium' | 'High'

surface: SurfaceConfig
candidates: LayoutCandidate[]
parameters: LayoutParameters
signals: DecisionSignals
}