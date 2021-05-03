import { exportToCsv } from './exportToCsv.js'
import { headerRowsArray } from './headerRows.js'
import { createBookHtml } from './createBookHtml.js'
import { addDataForExport } from './addDataForExport.js'

const page = document.querySelector("#page-container");
const isbnInput = document.querySelector("#isbn-input");
const defaultCategoryFromList = document.querySelector("#default-category-in-list");
const customDefaultCategory = document.querySelector("#custom-default-category");
const defaultCondition = document.querySelector("#default-condition");
const defaultSourceFromList = document.querySelector("#default-source-in-list");
const customDefaultSource = document.querySelector("#custom-default-source");
const form = document.querySelector("#form");
const exportBtn = document.querySelector("#export-btn");
const resetBtn = document.querySelector("#reset-btn");


const defaultConditionInput = defaultCondition.value
let defaultSourceInput = null
let defaultCategoryInput = null
let someGoogleDataReturned = false
let booksRowsArray = []

isbnInput.addEventListener("keydown", e => {
  const code = (e.keyCode ? e.keyCode : e.which);
    if (code == 13) { onFormSubmit(e) }
});

form.addEventListener("submit", onFormSubmit);

exportBtn.addEventListener("click", () => {
  if (someGoogleDataReturned) {
    // map new default data if any:
    const newDefaultCategoryInput = customDefaultCategory.value ? customDefaultCategory.value : defaultCategoryFromList.value
    const newDefaultSourceInput = customDefaultSource.value ? customDefaultSource.value : defaultSourceFromList.value
    const newDefaultConditionInput = defaultCondition.value
    if (newDefaultCategoryInput !== defaultCategoryInput || newDefaultSourceInput !== defaultSourceInput || newDefaultConditionInput !== defaultConditionInput) {
      booksRowsArray.map(book => {
        book[6] = newDefaultSourceInput
        book[7] = newDefaultConditionInput
        book[8] = newDefaultCategoryInput
      })
    }
    const date = new Date().toJSON().slice(0,10).replace(/-/g,'-');
    const fileName = date + '_' + newDefaultSourceInput + '_' + newDefaultCategoryInput
    // sort alphabetically by book name:
    booksRowsArray.sort((a, b) => a[2].localeCompare(b[2]))
    exportToCsv(fileName, [
      headerRowsArray,
      ...booksRowsArray
    ])  }
});

resetBtn.addEventListener("click", () => {
  defaultCategoryFromList.value = ""
  customDefaultCategory.value = ""
  defaultCondition.value = 'New'
  defaultSourceFromList.value = ""
  customDefaultSource.value = ""
  document.getElementById("content").innerHTML = ""
  booksRowsArray = []
});

function onFormSubmit(e) {
  e.preventDefault();
  const isbnInputValue = isbnInput.value;
  const isbnsArray = isbnInputValue.replace(' ', '').replace(/\r?\n|\r/g, '').split(',')

  // needs await to be removed, otherwise doesn\'t work
  // page.classList.add('loading')

  isbnsArray.forEach((isbn) => {
    isbn = isbn.replace(/\s/g, '')
    fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.items?.length) {
          someGoogleDataReturned = true
          for (let i = 0; i < data.items.length; i++) {
            const item = data.items[i];

            console.log(`Google data for ${item.volumeInfo?.title}: `);
            console.log(item);

            // check if openlibrary has cover
            // (solution to check cover data with fetch found here: https://github.com/internetarchive/openlibrary/issues/329)
            item.volumeInfo.hasOpenlibraryCover = true
            const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=data&format=json`
            fetch(url)
              // if openlibrary image check fetch succeeded:
              .then(response => response.json())
              .then(data => {
                console.log('openlibrary image check fetch succeeded, data:');
                console.log(data)

                // check if openlibrary has cover:
                if (!data[`ISBN:${isbn}`]?.cover?.large) {
                  item.volumeInfo.hasOpenlibraryCover = false
                }

                const itemHasMissingData =
                  !item.volumeInfo.hasOpenlibraryCover ||
                  !item.volumeInfo?.title ||
                  !item.volumeInfo?.authors.length ||
                  !item.volumeInfo?.description ||
                  !item.volumeInfo?.pageCount

                const image = {
                  src: `http://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`,
                  errorMsg: item.volumeInfo.hasOpenlibraryCover ? '' : 'No image found, image link won\'t be exported',
                }
                console.log(image.src)

                // display retrieved data
                createBookHtml(isbn, item, itemHasMissingData, image)

                // construct data for exporting to csv
                defaultCategoryInput = customDefaultCategory.value ? customDefaultCategory.value : defaultCategoryFromList.value
                defaultSourceInput = customDefaultSource.value ? customDefaultSource.value : defaultSourceFromList.value

                addDataForExport(booksRowsArray, isbn, item, defaultConditionInput, defaultSourceInput, defaultCategoryInput, image)

              })
              .catch((error) => {
                // if openlibrary image check fetch failed:
                console.error('Openlibrary image check fetch error:', error);
                const itemHasMissingData = true
                const image = {
                  src: `http://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`,
                  errorMsg: 'No image found, image link won\'t be exported'
                }
                createBookHtml(isbn, item, itemHasMissingData, image)
                addDataForExport(booksRowsArray, isbn, item, defaultConditionInput, defaultSourceInput, defaultCategoryInput, image)
              });
          }
        } else {
          document.getElementById("content").innerHTML +=
          '<div class="book-container error-true">'
          + '<p><b>ISBN: </b>' + isbn + '. ' + 'Google data not found, only ISBN will be exported</p>'
          + '</div>'
          const image = { src: '' }
          const item = {}
          addDataForExport(booksRowsArray, isbn, item, defaultConditionInput, defaultSourceInput, defaultCategoryInput, image)
        }
      })
  })
}

