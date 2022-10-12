let books = [];
const RENDER_EVENT = 'render-bookshelf';
const SAVED_EVENT = 'saved-bookshelf';
const STORAGE_KEY = 'BOOKSHELF_APPS';

function generateId() {
  return +new Date();
}
 
function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  }
}

function isStorageExist() /* boolean */ {
  if (typeof (Storage) === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
}

function findBookByTitle(title) {
  loadDataFromStorage();
  if(title === '') return books;

  let regex = new RegExp(title, 'i');
  let result = [];
  for (const bookItem of books) {
    if (bookItem.title.match(regex)) {
      result.push(bookItem);
    }
  }
  return result;
}

function findBookIndex(bookId) {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
 
  return -1;
}

function addBookToCompleted(bookId) {
  const bookTarget = findBook(bookId);
 
  if (bookTarget == null) return;
 
  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  window.alert(`Buku dengan judul ${bookTarget.title} berhasil dipindahkan ke daftar sudah selesai dibaca.`);
}
 
function undoBookFromCompleted(bookId) {
  const bookTarget = findBook(bookId);
 
  if (bookTarget == null) return;
 
  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  window.alert(`Buku dengan judul ${bookTarget.title} berhasil dipindahkan ke daftar belum selesai dibaca.`);
}

function removeBook(bookId) {
  const bookIndex = findBookIndex(bookId);
  bookData = {
    id: books[bookIndex].id,
    title: books[bookIndex].title,
  }
  
  // ask confirmation
  let confirm = window.confirm(`Apakah anda yakin ingin menghapus buku dengan id ${bookData.id} dan judul ${bookData.title}?`);
 
  if (bookIndex !== -1 && confirm) {
    books.splice(bookIndex, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
    window.alert(`Buku dengan judul ${bookData.title} berhasil dihapus!`);
  }
}

function searchBook() {
  const title = document.getElementById('searchBookTitle').value;
  books = findBookByTitle(title);
 
  document.dispatchEvent(new Event(RENDER_EVENT));
  if (books.length === 0)
    window.alert(`Buku dengan judul ${title} tidak ditemukan!`);
}

function addBook() {
  const title = document.getElementById('inputBookTitle').value;
  const author = document.getElementById('inputBookAuthor').value;
  const year = document.getElementById('inputBookYear').value;
  const isComplete = document.getElementById('inputBookIsComplete').checked;
 
  const generatedID = generateId();
  const bookObject = generateBookObject(generatedID, title, author, year, isComplete);
  books.push(bookObject);
 
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
  window.alert(`Buku dengan judul ${title} berhasil ditambahkan!`);
}

function makeBook(bookObject) {
  const textTitle = document.createElement('h3');
  textTitle.innerText = bookObject.title;

  const textAuthor = document.createElement('p');
  textAuthor.innerText = `Penulis: ${bookObject.author}`;
 
  const textYear = document.createElement('p');
  textYear.innerText = `Tahun: ${bookObject.year}`;
 
  const textContainer = document.createElement('div');
  textContainer.classList.add('inner');
  textContainer.append(textTitle, textAuthor, textYear);
 
  const container = document.createElement('div');
  container.classList.add('book_item');
  container.append(textContainer);
  container.setAttribute('id', `book-${bookObject.id}`);

  const actionContainer = document.createElement('div');
  actionContainer.classList.add('action');

  // add complete flagging button
  const undoButton = document.createElement('button');
  undoButton.classList.add('green');
  
  if (bookObject.isComplete) {
    undoButton.innerText = 'Belum Selesai Dibaca';
    undoButton.addEventListener('click', function (event) {
      undoBookFromCompleted(bookObject.id);
    });
  } else {
    undoButton.innerText = 'Selesai Dibaca';
    undoButton.addEventListener('click', function (event) {
      addBookToCompleted(bookObject.id);
    });
  }

  // add remove button
  const removeButton = document.createElement('button');
  removeButton.classList.add('red');
  removeButton.innerText = 'Hapus Buku';

  removeButton.addEventListener('click', function () {
    removeBook(bookObject.id);
  });

  actionContainer.append(undoButton, removeButton);
  container.append(actionContainer);
 
  return container;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);
  books = data;
 
  document.dispatchEvent(new Event(RENDER_EVENT));
}

document.addEventListener(RENDER_EVENT, function () {
  const uncompletedBookList = document.getElementById('incompleteBookshelfList');
  uncompletedBookList.innerHTML = '';

  const completedBookList = document.getElementById('completeBookshelfList');
  completedBookList.innerHTML = '';
 
  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if(!bookItem.isComplete)
      uncompletedBookList.append(bookElement);
    else
      completedBookList.append(bookElement);
  }
});

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

document.addEventListener('DOMContentLoaded', function () {
  const submitForm = document.getElementById('inputBook');
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });

  const searchForm = document.getElementById('searchBook');
  searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    searchBook();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});