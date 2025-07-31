const quoteContainer = document.getElementById("quote-container");
const quoteText = document.getElementById("quote");
const authorText = document.getElementById("author");
const twitterBtn = document.getElementById("twitter");
const newQuoteBtn = document.getElementById("new-quote");
const loader = document.getElementById("loader");

// Fallback verses in case API fails (KJV)
const fallbackVerses = [
  {
    text: "For I know the thoughts that I think toward you, saith the Lord, thoughts of peace, and not of evil, to give you an expected end.",
    reference: "Jeremiah 29:11 (KJV)"
  },
  {
    text: "Trust in the Lord with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.",
    reference: "Proverbs 3:5-6 (KJV)"
  },
  {
    text: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the Lord thy God is with thee whithersoever thou goest.",
    reference: "Joshua 1:9 (KJV)"
  },
  {
    text: "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.",
    reference: "Romans 8:28 (KJV)"
  },
  {
    text: "I can do all things through Christ which strengtheneth me.",
    reference: "Philippians 4:13 (KJV)"
  },
  {
    text: "The Lord is my shepherd; I shall not want.",
    reference: "Psalm 23:1 (KJV)"
  },
  {
    text: "Casting all your care upon him; for he careth for you.",
    reference: "1 Peter 5:7 (KJV)"
  },
  {
    text: "But they that wait upon the Lord shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.",
    reference: "Isaiah 40:31 (KJV)"
  }
];

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

function displayVerse(text, reference) {
  // Adjust font size for long quotes
  if (text.length > 120) {
    quoteText.classList.add("long-quote");
  } else {
    quoteText.classList.remove("long-quote");
  }
  
  quoteText.innerText = text;
  authorText.innerText = reference;
  removeLoadingSpinner();
}

// Get a random fallback verse
function getRandomFallbackVerse() {
  const randomIndex = Math.floor(Math.random() * fallbackVerses.length);
  const verse = fallbackVerses[randomIndex];
  displayVerse(verse.text, verse.reference);
}

// Get Quote From API
async function getQuote() {
  showLoadingSpinner();
  
  const apiUrl = 'https://beta.ourmanna.com/verses/api/get?format=json&order=random';
  
  // Working proxies from the GitHub list and recent research
  const proxies = [
    // CORS.lol - Super easy, open source
    `https://api.cors.lol/?url=${encodeURIComponent(apiUrl)}`,
    
    // Corsfix - Reliable service
    `https://proxy.corsfix.com/?${apiUrl}`,
    
    // AllOrigins - Most popular
    `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`,
    
    // ThingProxy - Good for HTTPS
    `https://thingproxy.freeboard.io/fetch/${apiUrl}`,
    
    // Crossorigin.me (from GitHub list)
    `https://crossorigin.me/${apiUrl}`,
    
    // Your original Supabase (let's try it too)
    `https://udjuqgidzjzndpfwvlic.supabase.co${apiUrl}`
  ];
  
  for (let i = 0; i < proxies.length; i++) {
    const proxyUrl = proxies[i];
    const proxyName = proxyUrl.split('//')[1].split('/')[0]; // Extract domain name
    
    try {
      console.log(`🔄 Trying proxy ${i + 1}/${proxies.length}: ${proxyName}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Origin': window.location.origin
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      let data = await response.json();
      
      // Handle different proxy response formats
      if (data.contents) {
        // AllOrigins format
        data = JSON.parse(data.contents);
      }
      
      // Check if we got valid Bible verse data
      if (data && data.verse && data.verse.details && data.verse.details.text) {
        const text = data.verse.details.text;
        let reference = data.verse.details.reference || "The Bible";
        
        console.log(`✅ SUCCESS with ${proxyName}!`);
        displayVerse(text, reference);
        return;
      } else {
        throw new Error('Invalid response format - no verse data found');
      }
      
    } catch (error) {
      console.log(`❌ ${proxyName} failed: ${error.message}`);
      
      // Don't wait too long between attempts
      if (i < proxies.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }
  
  // If all proxies fail, use KJV fallback verses
  console.log('🔄 All proxies failed - using KJV fallback verses');
  getRandomFallbackVerse();
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
