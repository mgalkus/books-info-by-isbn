import { checkAndSanitizeVolumeData } from './checkAndSanitizeVolumeData.js'

export function createBookHtml(isbn, item, itemHasMissingData, image) {
  document.getElementById("content").innerHTML +=
    `<div class="book-container error-${itemHasMissingData}">`
    + '<div class="book-text-info">'
    + '<p><b>ISBN:</b> ' + isbn + '</p><br>'
    + `<p class="error-${!checkAndSanitizeVolumeData(item).title}"><b>Full title: </b>` + checkAndSanitizeVolumeData(item).title + '</p><br>'
    + `<p class="error-${!checkAndSanitizeVolumeData(item).authors}"><b>Authors: </b>` + checkAndSanitizeVolumeData(item).authors + '</p><br>'
    + `<p class="error-${!checkAndSanitizeVolumeData(item).publisher}"><b>Publisher: </b>` + checkAndSanitizeVolumeData(item).publisher + '</p><br>'
    + `<p class="error-${!checkAndSanitizeVolumeData(item).description}"><b>Description: </b>` + checkAndSanitizeVolumeData(item).description + '</p><br>'
    + `<p class="error-${!item.volumeInfo?.pageCount}"><b>Pages: </b>` + item.volumeInfo?.pageCount + '</p>'
    + '</div>'
    + '<div class="book-img-container">'
    + '<p><b>Image: </b>' + '</p><br>'
    + '<p class="image-link">' + image.src
    + '</p><br>'
    + `<img class="book-img" src=${image.src}></img>`
    + "</div></div>"
}