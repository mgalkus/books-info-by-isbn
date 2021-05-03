import { capitalizeFirstLetters } from './capitalizeFirstLetters.js'

export function checkAndSanitizeVolumeData(item) {
  let fullTitle = item.volumeInfo?.title
  if (item.volumeInfo?.subtitle) {
    fullTitle += `. ${item.volumeInfo.subtitle}`
  }
  const title = fullTitle ? fullTitle.replace(/[^\x00-\x7F]/g, "") : ''
  const publisher = item.volumeInfo?.publisher ? item.volumeInfo.publisher.replace(/[^\x00-\x7F]/g, "") : ''
  const description = item.volumeInfo?.description ? item.volumeInfo.description.replace(/[^\x00-\x7F]/g, "") : ''
  const sanitizedAuthors = item.volumeInfo?.authors ? item.volumeInfo.authors.join(', ').replace(/[^\x00-\x7F]/g, "") : ''
  const authors = capitalizeFirstLetters(sanitizedAuthors)
  return { authors: authors, title: title, description: description, publisher: publisher }
}