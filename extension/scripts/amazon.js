if (/amazon\.com$/.test(document.domain)) {
  console.log = function () {}
  getPrefsAmazon();
}

function getPrefsAmazon () {
  chrome.storage.sync.get(['bookMedia', 'ebookMedia', 'audioMedia'], function (items) {
    checkAmazon(items['audioMedia'], items['ebookMedia'], items['bookMedia']);
  });
}

function checkAmazon (showAudio, showEbook, showBook) {
  var page_info = pageInfo();

  searchGuide(page_info['author'], page_info['title'], page_info['isbn']);

  if (page_info['page_type'].length){
    makeBox(showAudio, showEbook, showBook);
    initiateSearch(page_info, showAudio, showEbook, showBook);
  }
}

// Create the div on the Amazon resource page to modify and initialize message
function makeBox (showAudio, showEbook, showBook) {
  var container;

  if ($('div.a-box-inner').length) {
    console.log('Initialize: Creating Amazon page box');
    container = $('div.a-box-inner:first');
    container.before(
      "<div id='dcpl' class='a-box'>\
        <div id = 'booksfordc_icon' class = 'amazon'> <a href = 'http://booksfordc.org' > <img id = 'booksfordc_icon_img' src = '" + chrome.extension.getURL('assets/icon16white.png') + "'> </a> </div>\
        <div id = 'booksfordc_availability'> \
          <div id = 'dcpl_title'> DCPL Search </div> \
        </div> \
      </div> ");
  } else {
    console.log('Initialize: Could not create Amazon page box');
    return false;
  }

  finishBox(showAudio, showEbook, showBook);

  return true;
}

// Determine whether on book page
function pageInfo () {
  var page_type, title, isbn, isbn10, isbn13, author;

  if ($('#btAsinTitle').length) {
    console.log('Initialize: On Amazon e-book page')
    page_type = 'ebook_page';
    title = $('#btAsinTitle').text();
    console.log(title);
    if ($('#pageCountAvailable').length) {
      try {
        isbn10 = $('#hardcover_meta_binding_winner').find('.bucketBorderTop').attr('id').split('_')[1].replace(/\D/g, '');
        isbn = convertISBN(isbn10);
      } catch (e) {
        isbn = '';
      }
    } else {
      isbn = '';
    }

    if ($('.contributorNameTrigger a:eq(0)').length) {
      author = $('.contributorNameTrigger a:eq(0)').text();
    } else if ($('.contributorNameTrigger a').length) {
      author = $('.contributorNameTrigger a').text();
    } else if ($('div.buying span a:eq(0)').length){
      author = $('div.buying span a:eq(0)').text();
    } else {
      author = $('div.buying span a').text();
    }
  } else if ($("#productDetailsTable .content li:contains('ASIN:')").length) {
    console.log('Initialize: On Amazon e-book page');
    page_type = 'ebook_page';
    title = $('#productTitle').text();
    if ($('#aboutEbooksSection').length) {
      try {
        isbn = $('#aboutEbooksSection').find('.a-declarative:first').attr('data-a-popover').split('ISBN ')[1].replace(/\D/g, '');
        if (isbn.length === 10) {
          isbn = convertISBN(isbn);
        } else if (isbn.length !== 13) {
          isbn = '';
        }
      } catch (e) {
        isbn = '';
      }
    } else {
      isbn = '';
    }

    if ($('.a-link-normal.contributorNameID:first').length) {
      author = $('.a-link-normal.contributorNameID:first').text();
    } else {
      author = $('.author .a-link-normal:eq(0)').text();
    }
  } else if ($("#productDetailsTable .content li:contains('ISBN')").length) {
    console.log('Initialize: On Amazon book page');
    page_type = 'book_page';
    title = $('#productTitle').text();
    isbn10 = $("#productDetailsTable .content li:contains('ISBN-10:')").text();
    isbn13 = $("#productDetailsTable .content li:contains('ISBN-13:')").text();
    if (isbn13.length) {
      isbn = isbn13.split(':')[1].replace(/\D/g, '');
    } else {
      isbn10 = isbn10.split(':')[1].replace(/\D/g, '');
      isbn = convertISBN(isbn10);
    }

    if ($('.a-link-normal.contributorNameID:first').length) {
      author = $('.a-link-normal.contributorNameID:first').text();
    } else {
      author = $('.author .a-link-normal:eq(0)').text();
    }
  } else {
    console.log('Initialize: Not on Amazon book or e-book page');
    page_type = '';
    author = '';
    title = '';
    isbn = '';
  }

  var result = {
    'page_type': page_type,
    'author': cleanAuthor(author),
    'title': cleanTitle(title),
    'isbn': isbn
  };

  console.log(result);
  return result;
}
