import { checkAndSanitizeVolumeData } from './checkAndSanitizeVolumeData.js'

export function addDataForExport(
  booksRowsArray,
  isbn,
  item,
  defaultConditionInput,
  defaultSourceInput,
  defaultCategoryInput,
  image
) {
  booksRowsArray.push([
    isbn,
    !image.errorMsg ? image.src : '',
    checkAndSanitizeVolumeData(item).title ? checkAndSanitizeVolumeData(item).title : '',
    checkAndSanitizeVolumeData(item).authors ? checkAndSanitizeVolumeData(item).authors : '',
    item.volumeInfo?.pageCount ? item.volumeInfo?.pageCount : '',
    checkAndSanitizeVolumeData(item).publisher ? checkAndSanitizeVolumeData(item).publisher : '',
    defaultSourceInput,
    defaultConditionInput,
    defaultCategoryInput,
    "",
    "",
    "=ROUND(J2*1.15 + K2;1)",
    "",
    "=L2+4",
    "",
    "1",
    "simple",
    "0",
    "",
    new Date().toISOString().slice(0, 10),
    checkAndSanitizeVolumeData(item).description ? checkAndSanitizeVolumeData(item).description : ''
  ]);
}
