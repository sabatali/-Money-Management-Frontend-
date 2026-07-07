/**
 * Lightweight client-side preview of the capitalization the backend applies
 * to custom account/category names. The backend remains the source of truth
 * (it also matches names against the master catalogue for canonical casing
 * like "MCB Bank"), this is just so the UI doesn't flash raw lowercase text.
 */
export const toTitleCasePreview = (value) =>
  value
    .split(' ')
    .map((word) => {
      if (!word) return word
      if (word.length > 1 && word === word.toUpperCase() && /[A-Z]/.test(word)) {
        return word
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')

export const collapseSpaces = (value) => value.replace(/\s+/g, ' ').trim()

export const isOnlyNumbers = (value) => /^[0-9]+$/.test(value.replace(/\s+/g, ''))
