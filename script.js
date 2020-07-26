const quoteContainer = document.getElementById("quote-container");
const quoteText = document.getElementById("quote");
const authorText = document.getElementById("author");
const twitterBtn = document.getElementById("twitter");
const newQuoteBtn = document.getElementById("new-quote");
const loader = document.getElementById("loader");

function showLoadingSpinner() {
  loader.hidden = false; // loader is showing
  quoteContainer.hidden = true; // quote container is hidden
}
function removeLoadingSpinner() {
  if (!loader.hidden) {
    quoteContainer.hidden = false; //show the quote container
    loader.hidden = true; //hide the loader
  }
}

// Get Quote From API
async function getQuote() {
  showLoadingSpinner();
  const proxyUrl = "https://secure-reef-60452.herokuapp.com/";
  const apiUrl =
    "http://www.ourmanna.com/verses/api/get?format=json&order=random";

  try {
    const response = await fetch(proxyUrl + apiUrl);
    const data = await response.json();
    //Get verse reference; if author is blank add "The Bible"
    if (data.verse["details"].reference === "") {
      authorText.innerText = "The Bible";
    } else {
      authorText.innerText = data.verse["details"].reference;
    }

    //Get verse text; & reduce font size for long quotes >120 character

    if (data.verse["details"].text.length > 120) {
      quoteText.classList.add("long-quote");
    } else {
      quoteText.classList.remove("long-quote");
    }
    quoteText.innerText = data.verse["details"].text;
    removeLoadingSpinner();
  } catch (error) {
    getQuote();
  }
}

// Tweet quote
function tweetQuote() {
  const quote = quoteText.innerText;
  const author = authorText.innerText;
  const twitterUrl = `https://twitter.com/intent/tweet?text="${quote}" - ${author}`;
  window.open(twitterUrl, "_blank");
}

// Event Listeners
newQuoteBtn.addEventListener("click", getQuote);
twitterBtn.addEventListener("click", tweetQuote);

// On Load
getQuote();

// quotes API link:
// "http://api.forismatic.com/api/1.0/?method=getQuote&lang=en&format=json"
