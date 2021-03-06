if (/barnesandnoble\.com$/.test(document.domain)) {
  console.log = function () {}
  getPrefsBN();
}

function getPrefsBN () {
  chrome.storage.sync.get(['bookMedia', 'ebookMedia', 'audioMedia'], function (items) {
    checkBN(items['audioMedia'], items['ebookMedia'], items['bookMedia']);
  });
}

function checkBN (showAudio, showEbook, showBook) {
  var on_page = bnMakeBox(showAudio, showEbook, showBook);

  if (on_page === true){
    var page_info = bnPageInfo();
    searchGuide(page_info['author'], page_info['title'], page_info['isbn']);
    initiateSearch(page_info, showAudio, showEbook, showBook);
  }
}

// Create the div on the Amazon resource page to modify and initialize message
function bnMakeBox (showAudio, showEbook, showBook) {
  var container;

  if ($('#availableFormats').length) {
    console.log('Initialize: Creating Barnes and Noble page box');
    container = $('#availableFormats');
    container.after(
      "<div id = 'dcpl_bn'>\
        <div id = 'booksfordc_icon'>  <a href = 'http://booksfordc.org' > <img id = 'booksfordc_icon_img' src = '" + chrome.extension.getURL('assets/icon16white.png') + "'> </a> </div>\
        <div id = 'booksfordc_availability'> \
          <div id = 'dcpl_title'> DCPL Search </div> \
        </div> \
      </div> ");

    finishBox(showAudio, showEbook, showBook);

    return true;
  } else {
    console.log('Initialize: Could not create Barnes and Noble page box');
    return false;
  }
}

// Determine whether on book page
function bnPageInfo () {
  var title, isbn, isbn13, author;

  if ($('#prodSummary').length) {
    console.log('Initialize: On Barnes and Noble book or e-book page')
    title = $('#prodSummary h1').text();
    isbn13 = $('#ProductDetailsTab dd:first').text();
    isbn = isbn13.replace(/\D/g, '');
    if ($('.contributors a:eq(0)').length) {
      author = $('.contributors a:eq(0)').text();
    } else {
      author = $('.contributors a').text();
    }
  }

  var result = {
    'author': cleanAuthor(author),
    'title': cleanTitle(title),
    'isbn': isbn
  };

  console.log(result);
  return result;
}
