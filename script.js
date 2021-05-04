import { exportToCsv } from './scripts/exportToCsv.js'
import { headerRowsArray } from './scripts/headerRows.js'
import { createBookHtml } from './scripts/createBookHtml.js'
import { addDataForExport } from './scripts/addDataForExport.js'

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
let booksRowsArray = []

isbnInput.addEventListener("keydown", e => {
  const code = (e.keyCode ? e.keyCode : e.which);
    if (code == 13) { onFormSubmit(e) }
});

form.addEventListener("submit", onFormSubmit);

exportBtn.addEventListener("click", () => {
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
  ])
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

  isbnsArray.forEach((isbn) => {
    isbn = isbn.replace(/\s/g, '')
    fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
    )
      .then((response) => response.json())
      .then((data) => {
        let itemHasMissingData
        let item = {}
        if (data.items?.length) {
          for (let i = 0; i < data.items.length; i++) {
            item = data.items[i];

            console.log(`Google data for ${item.volumeInfo?.title}: `);
            console.log(item);

            itemHasMissingData =
              !item.volumeInfo?.title ||
              !item.volumeInfo?.authors.length ||
              !item.volumeInfo?.description ||
              !item.volumeInfo?.pageCount
            }
          }
          const part1 = isbn.slice(0, 4)
          const part2 = isbn.slice(4, 8)
          const image = { src: `https://d1w7fb2mkkr3kw.cloudfront.net/assets/images/book/lrg/${part1}/${part2}/${isbn}.jpg` }

          // display retrieved data
          createBookHtml(isbn, item, itemHasMissingData, image)

          // construct data for exporting to csv
          defaultCategoryInput = customDefaultCategory.value ? customDefaultCategory.value : defaultCategoryFromList.value
          defaultSourceInput = customDefaultSource.value ? customDefaultSource.value : defaultSourceFromList.value
          addDataForExport(booksRowsArray, isbn, item, defaultConditionInput, defaultSourceInput, defaultCategoryInput, image)
      })
  })
}

