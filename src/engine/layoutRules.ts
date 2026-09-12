import type {
  AdContent,
  Surface,
  LayoutMode,
} from '../types/layout'

export const SURFACES = {
  desktop: {
    surface: 'desktop' as Surface,
    label: 'Desktop',
    width: 1440,
    height: 900,
  },

  tablet: {
    surface: 'tablet' as Surface,
    label: 'Tablet',
    width: 1024,
    height: 768,
  },

  mobile: {
    surface: 'mobile' as Surface,
    label: 'Mobile',
    width: 390,
    height: 844,
  },
}

export function getContentDensity(
  content: AdContent
): 'Low' | 'Medium' | 'High' {

  const headlineLength =
    content.headline.trim().length

  const descriptionLength =
    content.description.trim().length

  const ctaLength =
    content.cta.trim().length

  const totalCharacters =
    headlineLength +
    descriptionLength +
    ctaLength

  /*
   * Content density is intentionally weighted
   * toward the headline because it has the
   * strongest effect on visual composition.
   */

  if (
    headlineLength >= 60 ||
    totalCharacters >= 150
  ) {
    return 'High'
  }

  if (
    headlineLength >= 28 ||
    totalCharacters >= 75
  ) {
    return 'Medium'
  }

  return 'Low'
}


/*
 * Measures how much pressure the content
 * places on the available layout.
 *
 * Higher pressure means the engine should
 * allocate more space to the content region.
 */

function getContentPressure(
  content: AdContent
): number {

  const headline =
    content.headline.trim().length

  const description =
    content.description.trim().length

  const cta =
    content.cta.trim().length

  let pressure = 0

  if (headline >= 28) {
    pressure += 1
  }

  if (headline >= 60) {
    pressure += 2
  }

  if (description >= 70) {
    pressure += 1
  }

  if (description >= 120) {
    pressure += 2
  }

  if (cta > 18) {
    pressure += 1
  }

  return pressure
}


/*
 * Selects the composition based on both
 * surface constraints and content pressure.
 */

export function chooseLayout(
  surface: Surface,
  content: AdContent
): LayoutMode {

  const density =
    getContentDensity(content)

  const pressure =
    getContentPressure(content)


  /*
   * Mobile has the least horizontal space.
   *
   * A stacked composition protects readability
   * and gives the CTA a predictable position.
   */

  if (surface === 'mobile') {
    return 'stacked'
  }


  /*
   * Tablet is a transition surface.
   *
   * Very dense content moves to stacked,
   * while moderate pressure stays balanced.
   */

  if (surface === 'tablet') {

    if (
      density === 'High' ||
      pressure >= 4
    ) {
      return 'stacked'
    }

    return 'balanced'
  }


  /*
   * Desktop has enough room for parallel regions.
   *
   * Extremely dense content still benefits from
   * a balanced composition rather than an aggressive
   * split.
   */

  if (
    density === 'High' ||
    pressure >= 4
  ) {
    return 'balanced'
  }

  return 'split'
}