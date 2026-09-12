import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
} from 'react'

import './App.css'
import { toPng } from 'html-to-image'

import { evaluateLayout } from './engine/layoutEngine'
import { SURFACES } from './engine/layoutRules'

import type { AdContent, Surface } from './types/layout'

function App() {
  type HistoryEntry = {
    id: number
    surface: Surface
    layout: string
    density: string
    score: number
    adaptations: number
  }

  const adCanvasRef =
  useRef<HTMLDivElement>(null)
  
  const [history, setHistory] =
    useState<HistoryEntry[]>([])

  const [surface, setSurface] =
    useState<Surface>('desktop')

  const [zoom, setZoom] =
    useState(100)

  const [isPreview, setIsPreview] =
    useState(false)

  const [brand, setBrand] =
    useState('NOVA')

  const [headline, setHeadline] =
    useState('Designed for what comes next.')

  const [description, setDescription] =
    useState(
      'A smarter creative experience that adapts naturally across every surface.'
    )

  const [cta, setCta] =
    useState('Explore now')

  const [assetImage, setAssetImage] =
    useState<string | null>(null)

  const [assetName, setAssetName] =
    useState('Product visual')

  const [assetRemoved, setAssetRemoved] =
    useState(false)

  const [isAssetMenuOpen, setIsAssetMenuOpen] =
    useState(false)

  const [isProfileMenuOpen, setIsProfileMenuOpen] =
    useState(false)

  const [isAssetDetailsOpen, setIsAssetDetailsOpen] =
    useState(false)

  const [interactionMessage, setInteractionMessage] =
    useState('')

  const fileInputRef =
    useRef<HTMLInputElement>(null)

  const content: AdContent = {
    brand,
    headline,
    description,
    cta,
  }

  const decision = useMemo(
    () => evaluateLayout(surface, content),
    [
      surface,
      brand,
      headline,
      description,
      cta,
    ]
  )

  useEffect(() => {
    setHistory((previous) => {
      const last = previous[0]

      const isSameDecision =
        last &&
        last.surface === surface &&
        last.layout === decision.label &&
        last.density === decision.contentDensity &&
        last.score === decision.score

      if (isSameDecision) {
        return previous
      }

      const entry: HistoryEntry = {
        id: Date.now(),
        surface,
        layout: decision.label,
        density: decision.contentDensity,
        score: decision.score,
        adaptations: decision.adaptations,
      }

      return [entry, ...previous].slice(0, 6)
    })
  }, [
    surface,
    decision.label,
    decision.contentDensity,
    decision.score,
    decision.adaptations,
  ])

  useEffect(() => {
    if (!interactionMessage) {
      return
    }

    const timer =
      window.setTimeout(() => {
        setInteractionMessage('')
      }, 2200)

    return () => {
      window.clearTimeout(timer)
    }
  }, [interactionMessage])

  const currentSurface =
    SURFACES[surface]

  const previewDimensions = {
    desktop: {
      width: 760,
      height: 470,
    },

    tablet: {
      width: 590,
      height: 440,
    },

    mobile: {
      width: 290,
      height: 560,
    },
  }

  const preview =
    previewDimensions[surface]

  const engineStyle = {
    '--engine-text-scale':
      decision.parameters.textScale,

    '--engine-content-width':
      `${decision.parameters.contentWidth * 100}%`,

    '--engine-spacing':
      `${decision.parameters.spacing}em`,

    '--engine-cta-scale':
      decision.parameters.ctaScale,

    '--engine-visual-emphasis':
      decision.parameters.visualEmphasis,
  } as CSSProperties

  /*
   * -------------------------------------------------------------
   * EXPORT
   * -------------------------------------------------------------
   *
   * Exports the currently selected surface as an SVG file.
   * The generated file contains the current content and the
   * selected adaptive composition.
   */

  /*
   * Export the exact rendered creative shown on the canvas.
   * The zoom level does not affect the exported dimensions.
   */
  const handleExport = async () => {
    const element = adCanvasRef.current

    if (!element) {
      setInteractionMessage(
        'Creative is not ready to export'
      )

      return
    }

    try {
      setInteractionMessage(
        'Preparing creative...'
      )

      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#11131a',
      })

      const link =
        document.createElement('a')

      link.download =
        `adaptive-ad-${surface}.png`

      link.href = dataUrl

      document.body.appendChild(link)

      link.click()

      document.body.removeChild(link)

      setInteractionMessage(
        `${currentSurface.label} creative exported`
      )
    } catch (error) {
      console.error(
        'Creative export failed:',
        error
      )

      setInteractionMessage(
        'Export failed. Please try again.'
      )
    }
  }

  /*
   * -------------------------------------------------------------
   * ASSET HANDLING
   * -------------------------------------------------------------
   */

  const handleReplaceAsset = () => {
    setIsAssetMenuOpen(false)

    fileInputRef.current?.click()
  }

  const handleAssetSelected = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setInteractionMessage(
        'Please select an image file'
      )

      event.target.value = ''

      return
    }

    const reader =
      new FileReader()

    reader.onload = () => {
      const result =
        reader.result

      if (typeof result !== 'string') {
        return
      }

      setAssetImage(result)
      setAssetRemoved(false)
      setAssetName(file.name)
      setInteractionMessage(
        'Product visual replaced'
      )
    }

    reader.readAsDataURL(file)

    event.target.value = ''
  }

  const handleRemoveAsset = () => {
    setAssetImage(null)
    setAssetRemoved(true)
    setIsAssetMenuOpen(false)

    setInteractionMessage(
      'Product visual removed'
    )
  }

  const handleRestoreAsset = () => {
    setAssetRemoved(false)
    setIsAssetMenuOpen(false)

    setInteractionMessage(
      'Product visual restored'
    )
  }

  const handleViewAssetDetails = () => {
    setIsAssetMenuOpen(false)
    setIsAssetDetailsOpen(true)
  }

  /*
   * -------------------------------------------------------------
   * CTA INTERACTION
   * -------------------------------------------------------------
   */

  const handleCtaClick = () => {
    if (!cta.trim()) {
      setInteractionMessage(
        'CTA not configured'
      )

      return
    }

    setInteractionMessage(
      `"${cta}" interaction triggered`
    )
  }

  /*
   * -------------------------------------------------------------
   * PROFILE
   * -------------------------------------------------------------
   */

  const handleProfileToggle = () => {
    setIsProfileMenuOpen(
      (value) => !value
    )

    setIsAssetMenuOpen(false)
  }

  return (
    <div
      className="app-shell"
      onClick={() => {
        if (isAssetMenuOpen) {
          setIsAssetMenuOpen(false)
        }

        if (isProfileMenuOpen) {
          setIsProfileMenuOpen(false)
        }
      }}
    >

      {/* =========================================================
          HEADER
          ========================================================= */}

      <header
        className="app-header"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        <div className="brand-lockup">

          <div className="brand-mark">
            <span />
            <span />
            <span />
          </div>

          <div>

            <div className="product-name">
              Adaptive
            </div>

            <div className="product-subtitle">
              Layout Engine
            </div>

          </div>

        </div>


        <div className="header-center">

          <span className="workspace-label">
            AD STUDIO
          </span>

          <span className="header-separator" />

          <span className="project-name">
             BRAND LAUNCH
          </span>

        </div>


        <div className="header-actions">

          <button
            className="header-button"
            type="button"
            onClick={() =>
              setIsPreview(true)
            }
          >
            Preview
          </button>

          <button
            className="export-button"
            type="button"
            onClick={handleExport}
          >
            Export
          </button>

          <div className="profile-wrapper">

            <button
              className="avatar"
              type="button"
              onClick={handleProfileToggle}
              aria-label="Open workspace menu"
              aria-expanded={
                isProfileMenuOpen
              }
            >
              M
            </button>

            {isProfileMenuOpen && (

              <div className="profile-menu">

                <div className="profile-menu-heading">
                  Workspace
                </div>

                <div className="profile-menu-name">
                  Adaptive Studio
                </div>

                <div className="profile-menu-status">
                  Engine active
                </div>

              </div>

            )}

          </div>

        </div>

      </header>


      {/* =========================================================
          MAIN STUDIO
          ========================================================= */}

      <main className="studio">


        {/* =======================================================
            LEFT PANEL
            ======================================================= */}

        <aside className="left-panel">

          <div className="panel-heading">

            <div>

              <span className="eyebrow">
                01
              </span>

              <h2>
                Content
              </h2>

            </div>

            <span className="saved-indicator">
              Saved
            </span>

          </div>


          {/* BRAND */}

          <div className="form-section">

            <label>
              Brand
            </label>

            <input
              value={brand}
              onChange={(event) =>
                setBrand(event.target.value)
              }
              placeholder="Brand name"
            />

          </div>


          {/* HEADLINE */}

          <div className="form-section">

            <label>
              Headline
            </label>

            <textarea
              value={headline}
              onChange={(event) =>
                setHeadline(event.target.value)
              }
              rows={3}
              maxLength={80}
              placeholder="Your headline"
            />

            <div className="field-meta">

              <span>
                Primary message
              </span>

              <span>
                {headline.length}/80
              </span>

            </div>

          </div>


          {/* DESCRIPTION */}

          <div className="form-section">

            <label>
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              rows={4}
              placeholder="Supporting message"
            />

          </div>


          {/* CTA */}

          <div className="form-section">

            <label>
              Call to action
            </label>

            <div className="input-with-icon">

              <input
                value={cta}
                onChange={(event) =>
                  setCta(event.target.value)
                }
                placeholder="CTA"
              />

              <span>
                ↗
              </span>

            </div>

          </div>


          <div className="panel-divider" />


          {/* ASSET */}

          <div
            className="asset-row"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="asset-preview">

              {assetImage &&
              !assetRemoved ? (

                <img
                  src={assetImage}
                  alt="Product visual"
                />

              ) : (

                <span>
                  IMG
                </span>

              )}

            </div>

            <div className="asset-info">

              <strong>
                Product visual
              </strong>

              <span>
                {assetRemoved
                  ? 'Removed · restore or replace'
                  : assetImage
                    ? `${assetName} · Image`
                    : '1200 × 1200 · JPG'}
              </span>

            </div>


            <div className="asset-menu-wrapper">

              <button
                className="asset-action"
                type="button"
                aria-label="Asset options"
                aria-expanded={
                  isAssetMenuOpen
                }
                onClick={() => {
                  setIsAssetMenuOpen(
                    (value) => !value
                  )

                  setIsProfileMenuOpen(false)
                }}
              >
                •••
              </button>


              {isAssetMenuOpen && (

                <div
                  className="asset-menu"
                  onClick={(event) =>
                    event.stopPropagation()
                  }
                >

                  <button
                    type="button"
                    onClick={
                      handleReplaceAsset
                    }
                  >
                    Replace asset
                  </button>

                  <button
                    type="button"
                    onClick={
                      handleViewAssetDetails
                    }
                  >
                    View details
                  </button>

                  {assetRemoved ? (

                    <button
                      type="button"
                      onClick={
                        handleRestoreAsset
                      }
                    >
                      Restore visual
                    </button>

                  ) : (

                    <button
                      type="button"
                      className="asset-danger"
                      onClick={
                        handleRemoveAsset
                      }
                    >
                      Remove asset
                    </button>

                  )}

                </div>

              )}

            </div>

          </div>


          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleAssetSelected}
          />


          <div className="left-footer">

            <span className="keyboard-key">
              ⌘
            </span>

            <span>
              Auto-layout enabled
            </span>

          </div>

        </aside>


        {/* =======================================================
            CENTER PANEL
            ======================================================= */}

        <section className="canvas-panel">


          <div className="canvas-toolbar">

            <div>

              <span className="eyebrow">
                LIVE CANVAS
              </span>

              <h2>
                Adaptive Preview
              </h2>

            </div>


            {/* SURFACE SWITCHER */}

            <div className="surface-switcher">

              {(Object.keys(SURFACES) as Surface[]).map(
                (item) => (

                  <button
                    key={item}
                    type="button"
                    className={
                      surface === item
                        ? 'surface-active'
                        : ''
                    }
                    onClick={() =>
                      setSurface(item)
                    }
                  >

                    <span
                      className={`device-icon ${item}`}
                    />

                    {SURFACES[item].label}

                  </button>

                )
              )}

            </div>

          </div>


          {/* CANVAS META */}

          <div className="canvas-meta">

            <div className="canvas-meta-left">

              <span className="live-dot" />

              <span>
                Engine evaluated
              </span>

              <span className="meta-divider" />

              <span>
                {currentSurface.width} ×{' '}
                {currentSurface.height}
              </span>

            </div>


            {/* ZOOM */}

            <div className="zoom-control">

              <button
                type="button"
                onClick={() =>
                  setZoom((value) =>
                    Math.max(
                      60,
                      value - 10
                    )
                  )
                }
                aria-label="Zoom out"
              >
                −
              </button>

              <button
                type="button"
                className="zoom-value"
                onClick={() =>
                  setZoom(100)
                }
                aria-label="Reset zoom"
              >
                {zoom}%
              </button>

              <button
                type="button"
                onClick={() =>
                  setZoom((value) =>
                    Math.min(
                      140,
                      value + 10
                    )
                  )
                }
                aria-label="Zoom in"
              >
                +
              </button>

            </div>

          </div>


          {/* CANVAS */}

          <div className="canvas-workspace">

            <div
              className={`device-frame ${surface}`}
              style={{
                transform:
                  `scale(${zoom / 100})`,
                transformOrigin:
                  'center center',
              }}
            >

              <div
                ref={adCanvasRef}
                className={`ad-card ${surface} ${decision.mode}`}
                style={{
                  width: preview.width,
                  minHeight: preview.height,
                  ...engineStyle,
                }}
              >

                {/* VISUAL */}

                <div className="ad-visual">

                  {!assetRemoved &&
                  assetImage ? (

                    <img
                      className="uploaded-ad-visual"
                      src={assetImage}
                      alt="Product visual"
                    />

                  ) : (

                    <>
                      <div className="visual-glow" />

                      <div className="visual-grid" />

                      <div className="visual-object">

                        <div className="object-ring" />

                        <div className="object-core" />

                      </div>
                    </>

                  )}

                  <span className="visual-label">
                    PRODUCT VISUAL
                  </span>

                </div>


                {/* COPY */}

                <div className="ad-copy">

                  <span className="ad-brand">
                    {brand || 'BRAND'}
                  </span>

                  <h1>
                    {headline ||
                      'Your headline goes here.'}
                  </h1>

                  <p>
                    {description ||
                      'Add a supporting message for your audience.'}
                  </p>


                  {cta.trim() ? (

                    <button
                      className="ad-cta"
                      type="button"
                      onClick={
                        handleCtaClick
                      }
                    >

                      {cta}

                      <span>
                        ↗
                      </span>

                    </button>

                  ) : (

                    <div className="ad-cta-missing">
                      CTA not configured
                    </div>

                  )}


                  <div className="ad-footer">

                    <span>
                      NEW COLLECTION
                    </span>

                    <span>
                      01 / 03
                    </span>

                  </div>

                </div>

              </div>

            </div>


            {/* RULER */}

            <div className="canvas-ruler ruler-horizontal">

              <span>
                0
              </span>

              <span>
                25%
              </span>

              <span>
                50%
              </span>

              <span>
                75%
              </span>

              <span>
                100%
              </span>

            </div>

          </div>

        </section>


        {/* =======================================================
            RIGHT PANEL
            ======================================================= */}

        <aside className="right-panel">


          <div className="panel-heading">

            <div>

              <span className="eyebrow">
                02
              </span>

              <h2>
                Engine
              </h2>

            </div>


            <div className="engine-status">

              <span />

              Active

            </div>

          </div>


          {/* CURRENT SURFACE */}

          <div className="engine-card primary">

            <div className="engine-card-top">

              <div>

                <span className="card-label">
                  CURRENT SURFACE
                </span>

                <strong>
                  {currentSurface.label}
                </strong>

              </div>


              <div className="surface-number">

                {surface === 'desktop'
                  ? '01'
                  : surface === 'tablet'
                    ? '02'
                    : '03'}

              </div>

            </div>


            <div className="dimension-display">

              <span>
                {currentSurface.width}
              </span>

              <i>
                ×
              </i>

              <span>
                {currentSurface.height}
              </span>

            </div>


            <div className="fit-score">

              <div>

                <span>
                  Layout fit
                </span>

                <strong>
                  {decision.score}%
                </strong>

              </div>


              <div className="score-bar">

                <span
                  style={{
                    width:
                      `${decision.score}%`,
                  }}
                />

              </div>

            </div>

          </div>


          {/* LAYOUT DECISION */}

          <div className="inspector-section">

            <div className="section-title">

              <span>
                LAYOUT DECISION
              </span>

              <span>
                AUTO
              </span>

            </div>


            <div className="decision-card">

              <div className="decision-icon">
                ✦
              </div>


              <div>

                <strong>
                  {decision.label}
                </strong>

                <p>
                  {decision.reason}
                </p>

              </div>

            </div>

          </div>


          {/* CANDIDATE RANKING */}

          <div className="inspector-section candidate-section">

            <div className="section-title">

              <span>
                CANDIDATE RANKING
              </span>

              <span>
                {decision.candidates.length
                  .toString()
                  .padStart(2, '0')}
              </span>

            </div>


            <div className="candidate-list">

              {decision.candidates.map(
                (candidate, index) => (

                  <div
                    className={`candidate-item ${
                      candidate.mode ===
                      decision.mode
                        ? 'candidate-selected'
                        : ''
                    }`}
                    key={candidate.mode}
                  >

                    <div className="candidate-rank">

                      {String(index + 1).padStart(
                        2,
                        '0'
                      )}

                    </div>


                    <div className="candidate-info">

                      <div className="candidate-name">

                        {candidate.mode === 'split'
                          ? 'Split Layout'
                          : candidate.mode === 'balanced'
                            ? 'Balanced Layout'
                            : 'Stacked Layout'}

                      </div>


                      <div className="candidate-rationale">

                        {candidate.rationale}

                      </div>

                    </div>


                    <div className="candidate-score">

                      {candidate.score}

                    </div>

                  </div>

                )
              )}

            </div>

          </div>


          {/* CONSTRAINTS */}

          <div className="inspector-section">

            <div className="section-title">

              <span>
                CONSTRAINTS
              </span>

              <span className="constraint-count">
                04 / 04
              </span>

            </div>


            <div className="constraint-list">


              {/* TYPOGRAPHY */}

              <div>

                <span
                  className={
                    decision.constraints.typography
                      ? 'check'
                      : 'check failed'
                  }
                >
                  {decision.constraints.typography
                    ? '✓'
                    : '×'}
                </span>

                <span>
                  Readable typography
                </span>

                <b>
                  {decision.constraints.typography
                    ? 'PASS'
                    : 'WARN'}
                </b>

              </div>


              {/* CTA VISIBILITY */}

              <div>

                <span
                  className={
                    decision.constraints.ctaVisibility
                      ? 'check'
                      : 'check failed'
                  }
                >
                  {decision.constraints.ctaVisibility
                    ? '✓'
                    : '×'}
                </span>

                <span>
                  CTA visibility
                </span>

                <b>
                  {decision.constraints.ctaVisibility
                    ? 'PASS'
                    : 'WARN'}
                </b>

              </div>


              {/* VISUAL BALANCE */}

              <div>

                <span
                  className={
                    decision.constraints.visualBalance
                      ? 'check'
                      : 'check failed'
                  }
                >
                  {decision.constraints.visualBalance
                    ? '✓'
                    : '×'}
                </span>

                <span>
                  Visual balance
                </span>

                <b>
                  {decision.constraints.visualBalance
                    ? 'PASS'
                    : 'WARN'}
                </b>

              </div>


              {/* SAFE MARGINS */}

              <div>

                <span className="check">
                  ✓
                </span>

                <span>
                  Safe margins
                </span>

                <b>
                  PASS
                </b>

              </div>

            </div>

          </div>


          {/* ADAPTIVE PARAMETERS */}

          <div className="inspector-section">

            <div className="section-title">

              <span>
                ADAPTIVE PARAMETERS
              </span>

              <span>
                LIVE
              </span>

            </div>


            <div className="parameter-grid">


              <div className="parameter-card">

                <span>
                  TEXT SCALE
                </span>

                <strong>
                  {Math.round(
                    decision.parameters
                      .textScale * 100
                  )}%
                </strong>

              </div>


              <div className="parameter-card">

                <span>
                  CONTENT WIDTH
                </span>

                <strong>
                  {Math.round(
                    decision.parameters
                      .contentWidth * 100
                  )}%
                </strong>

              </div>


              <div className="parameter-card">

                <span>
                  SPACING
                </span>

                <strong>
                  {decision.parameters
                    .spacing.toFixed(2)}×
                </strong>

              </div>


              <div className="parameter-card">

                <span>
                  CTA SCALE
                </span>

                <strong>
                  {Math.round(
                    decision.parameters
                      .ctaScale * 100
                  )}%
                </strong>

              </div>


              <div className="parameter-card parameter-wide">

                <span>
                  VISUAL EMPHASIS
                </span>


                <div className="parameter-bar">

                  <div
                    style={{
                      width:
                        `${decision.parameters.visualEmphasis * 100}%`,
                    }}
                  />

                </div>


                <strong>
                  {Math.round(
                    decision.parameters
                      .visualEmphasis * 100
                  )}%
                </strong>

              </div>

            </div>

          </div>


          {/* CONTENT ANALYSIS */}

          <div className="inspector-section">

            <div className="section-title">

              <span>
                CONTENT ANALYSIS
              </span>

            </div>


            <div className="analysis-grid">


              <div>

                <span>
                  Density
                </span>

                <strong>
                  {decision.contentDensity}
                </strong>

              </div>


              <div>

                <span>
                  Components
                </span>

                <strong>
                  05
                </strong>

              </div>


              <div>

                <span>
                  Conflicts
                </span>

                <strong className="success-text">

                  {decision.score >= 90
                    ? '0'
                    : '1'}

                </strong>

              </div>


              <div>

                <span>
                  Adaptations
                </span>

                <strong>

                  {decision.adaptations
                    .toString()
                    .padStart(2, '0')}

                </strong>

              </div>

            </div>

          </div>


          {/* ADAPTATION HISTORY */}

          <div className="inspector-section history-section">

            <div className="section-title">

              <span>
                ADAPTATION HISTORY
              </span>

              <span>
                {history.length
                  .toString()
                  .padStart(2, '0')}
              </span>

            </div>


            <div className="history-list">

              {history.length === 0 ? (

                <div className="history-empty">
                  Waiting for engine evaluations...
                </div>

              ) : (

                history.map(
                  (entry, index) => (

                    <div
                      className={`history-item ${
                        index === 0
                          ? 'history-current'
                          : ''
                      }`}
                      key={entry.id}
                    >

                      <div className="history-marker">
                        <span />
                      </div>


                      <div className="history-content">

                        <div className="history-top">

                          <strong>
                            {SURFACES[
                              entry.surface
                            ].label}
                          </strong>

                          <span>
                            {entry.score}%
                          </span>

                        </div>


                        <div className="history-layout">
                          {entry.layout}
                        </div>


                        <div className="history-meta">

                          <span>
                            {entry.density} density
                          </span>

                          <span>
                            {entry.adaptations}{' '}
                            adaptations
                          </span>

                        </div>

                      </div>

                    </div>

                  )
                )

              )}

            </div>

          </div>


          {/* ENGINE FOOTER */}

          <div className="right-footer">

            <div className="engine-pulse">
              <span />
            </div>

            <div>

              <strong>
                Adaptive engine ready
              </strong>

              <span>
                Evaluated just now
              </span>

            </div>

          </div>

        </aside>

      </main>


      {/* =========================================================
          FULL SCREEN PREVIEW
          ========================================================= */}

      {isPreview && (

        <div className="preview-overlay">

          <button
            className="preview-close"
            type="button"
            onClick={() =>
              setIsPreview(false)
            }
            aria-label="Exit preview"
          >
            ×
          </button>


          <div className="preview-content">

            <div
              className={`ad-card preview-ad ${surface} ${decision.mode}`}
              style={{
                width: preview.width,
                minHeight: preview.height,
                ...engineStyle,
              }}
            >

              {/* VISUAL */}

              <div className="ad-visual">

                {!assetRemoved &&
                assetImage ? (

                  <img
                    className="uploaded-ad-visual"
                    src={assetImage}
                    alt="Product visual"
                  />

                ) : (

                  <>
                    <div className="visual-glow" />

                    <div className="visual-grid" />

                    <div className="visual-object">

                      <div className="object-ring" />

                      <div className="object-core" />

                    </div>
                  </>

                )}

                <span className="visual-label">
                  PRODUCT VISUAL
                </span>

              </div>


              {/* COPY */}

              <div className="ad-copy">

                <span className="ad-brand">
                  {brand || 'BRAND'}
                </span>


                <h1>
                  {headline ||
                    'Your headline goes here.'}
                </h1>


                <p>
                  {description ||
                    'Add a supporting message for your audience.'}
                </p>


                {cta.trim() ? (

                  <button
                    className="ad-cta"
                    type="button"
                    onClick={
                      handleCtaClick
                    }
                  >

                    {cta}

                    <span>
                      ↗
                    </span>

                  </button>

                ) : (

                  <div className="ad-cta-missing">
                    CTA not configured
                  </div>

                )}


                <div className="ad-footer">

                  <span>
                    NEW COLLECTION
                  </span>

                  <span>
                    01 / 03
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* =========================================================
          ASSET DETAILS
          ========================================================= */}

      {isAssetDetailsOpen && (

        <div
          className="preview-overlay"
          onClick={() =>
            setIsAssetDetailsOpen(false)
          }
        >

          <div
            className="asset-details-card"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="asset-details-header">

              <div>

                <span className="eyebrow">
                  ASSET
                </span>

                <h2>
                  Product visual
                </h2>

              </div>

              <button
                className="preview-close"
                type="button"
                onClick={() =>
                  setIsAssetDetailsOpen(false)
                }
                aria-label="Close asset details"
              >
                ×
              </button>

            </div>


            <div className="asset-details-preview">

  {assetRemoved ? (

    <span>
      VISUAL REMOVED
    </span>

  ) : assetImage ? (

    <img
      src={assetImage}
      alt="Product visual"
    />

  ) : (

    <div className="asset-details-generated">

      <div className="visual-glow" />

      <div className="visual-grid" />

      <div className="visual-object">

        <div className="object-ring" />

        <div className="object-core" />

      </div>

      <span className="visual-label">
        PRODUCT VISUAL
      </span>

    </div>

  )}

</div>


            <div className="asset-details-list">

              <div>

                <span>
                  Status
                </span>

                <strong>
                  {assetRemoved
                    ? 'Removed'
                    : 'Active'}
                </strong>

              </div>


              <div>

                <span>
                  Source
                </span>

                <strong>
                  {assetImage
                    ? assetName
                    : 'Generated visual'}
                </strong>

              </div>


              <div>

                <span>
                  Format
                </span>

                <strong>
                  {assetImage
                    ? 'Image'
                    : 'CSS visual'}
                </strong>

              </div>


              <div>

                <span>
                  Placement
                </span>

                <strong>
                  Adaptive
                </strong>

              </div>

            </div>

          </div>

        </div>

      )}


      {/* =========================================================
          INTERACTION FEEDBACK
          ========================================================= */}

      {interactionMessage && (

        <div className="interaction-toast">
          <span>✓</span>
          {interactionMessage}
        </div>

      )}

    </div>
  )
}

export default App