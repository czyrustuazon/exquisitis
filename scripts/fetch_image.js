let image = [];
let scrollToTop = false;
let globalimages = [];
let currentItem = 0; // The current place you are on the json
let htmlWrapper = document.querySelector('.image');
let htmlLoading = document.querySelector('.loading');
let htmlInfiniteLoading = document.querySelector('.infinte_loading');
let filtered;
let totalimages;
let perLoad = 8;     
let loadTheseimages = [];
let currentPos = 0;
let isSearch = false;
let winCached = $(window);
let docCached = $(document);
let showimages;

// Do the initial load
fetch(API_DOMAIN + '/api/inventory//search').then(response => {
    return response.json()
}).then(jsonFile => {
    image = jsonFile;
    Generate();
})

function Search () {
    let input = document.getElementById('searchbar').value
    input=input.toLowerCase();
    
    fetch(API_DOMAIN + '/api/inventory/'+input+'/search').then(response => {
        return response.json()
    }).then(jsonFile => {
        image = jsonFile;
        console.log(image.status);
        if (image.status == "Nothing Found") {
            htmlLoading.innerHTML = '<div class="text-center">No Results Found</div>';  
            htmlWrapper.innerHTML = "";
            return;
        }
        else {
            isSearch=true;
            Generate();
        }

    })
}

// if enter is hit, do a search
$("#searchbar").keypress(function(event) {
    if (event.keyCode === 13) {
        let input = document.getElementById('searchbar').value
        input=input.toLowerCase();
        fetch(API_DOMAIN + '/api/inventory/'+input+'/search').then(response => {
            return response.json()
        }).then(jsonFile => {
            image = jsonFile;
            console.log(image.status);
            if (image.status == "Nothing Found") {
                htmlLoading.innerHTML = '<div class="text-center">No Results Found</div>';  
                htmlWrapper.innerHTML = "";
                return;
            }
            else {
                isSearch=true;
                Generate();
            }
        })
    }
});

$(document).ready(function(){
    $(this).scrollTop(0); // <- scroll to the top
});

Cookies.remove('do_once', {sameSite: 'None', secure: true}); // FOR THE LOVE OF EVERYTHING, DON'T REMOVE THIS. WE'RE USING JS COOKIE IMPORT
totalimages = image.length;

function addContent() 
{
    if (currentPos < totalimages ) {
        dettachScrollEvent();
    }
    setTimeout(function() { //this timeout simulates the delay from the ajax post
        
    if (!isSearch) {
        showimages = image;
    } 
      
    // Clear everything once if it's a search so the current stuff won't get appended with the search stuff
    if (Cookies.get('do_once') == 1 && isSearch) {
        showimages = filtered;
        Cookies.set('do_once', '0', {sameSite: 'None', secure: true});
    }
    if (currentPos < totalimages ) {   
        Outpuimage(showimages);
    }
    attachScrollEvent();
  }, 1000);

}

function infiNLoader() {
  if (winCached.scrollTop() + winCached.height() > docCached.height() - 300) {
    addContent();
  }
}

function attachScrollEvent() {
  htmlInfiniteLoading.innerHTML = "";
  winCached.scroll(infiNLoader);
}

function dettachScrollEvent() {
    if (scrollToTop) {
        window.scrollTo(0, 0) // <- scroll to the top
    console.log("SCROLL TOP");

        scrollToTop = false;
    }
  winCached.unbind('scroll', infiNLoader);
  // ajax call get data from server and append to the div
    htmlInfiniteLoading.innerHTML = '<div class="sk-chase mx-auto">' +
        '<div class="sk-chase-dot"></div>' +
        '<div class="sk-chase-dot"></div>' +
        '<div class="sk-chase-dot"></div>' +
        '<div class="sk-chase-dot"></div>' +
        '<div class="sk-chase-dot"></div>' +
        '<div class="sk-chase-dot"></div>' +
    '</div>';
}


function Outpuimage (s) {
    for (let i = currentPos ; i < currentPos + perLoad ; i++) {

        console.log("currentPos: " + currentPos)

        if (s[i] == null)
        {
            break;
        }
        loadTheseimages.push(s[i]);
    }
                        
    currentPos = currentPos + perLoad
                 
    fetchimages(loadTheseimages, isSearch);
    loadTheseimages = [];
}


function Generate(customSearch)
{
    // scroll to top to prevent all at once load
    scrollToTop = true;

    // get user search
    filtered = [];
    currentPos = 0;

    let input = '';
    // If this is blank, that means the user didn't enter anything in the search bar
    if (customSearch != null || customSearch != undefined)
    {
        input=customSearch.toLowerCase(); 
        isSearch = true;
    }

    const random = (length = 8) => {
        return Math.random().toString(16).substr(2, length);
    };

    filtered = image.filter (image => image['tags'].toLowerCase().includes(input));

    Cookies.set('do_once', '1', {sameSite: 'None', secure: true});
    totalimages = filtered.length
    htmlWrapper.innerHTML = "";

    addContent(filtered);
    
}

// indexPage = false to clear current stuff on the screen

function fetchimages (images, indexPage = true) {
    let tags = "";
    let filteredTags = [];
    var imageCollection = '';
    var htmlTemplate;

    for (var c in images) {
        filteredTags = images[c].tags.split(',');
        for (var m in filteredTags) {
            tags += `<div class="badge rounded-pill bg-secondary" onclick="Generate('`+filteredTags[m]+`')">`+filteredTags[m]+`</div>`;
        }
        htmlTemplate = '<div class="col">' +
            '<div class="card shadow-sm">' +
                '<a href="'+decodeURIComponent(images[c].url) +'" target = "_blank">' +
                    '<img src='+ API_DOMAIN +'/api/image/'+ images[c].image +' class="bd-placeholder-img card-img-top">' +
                        '</a>' +
                        '<div class="card-body">' +
                            '<h5 class="card-title">' +
                                images[c].title +
                            '<span class="badge bg-light text-dark">'+ images[c].price +'</span></h5>' +
                            '<p class="card-text">'+tags+'</p>' +
                        '</div>' +
                '</div>' +
            '</div>';

        imageCollection += htmlTemplate;
        tags = '';
    } 

    htmlWrapper.innerHTML += imageCollection;

    if(indexPage)
    {
        if (imageCollection == "")
        {
            htmlLoading.innerHTML = '<div class="text-center">No Results Found</div>';    
            currentPos = 0;
        }
        else 
        {
            htmlLoading.innerHTML = '<h1 class="text-center">SEARCH RESULTS</h1>';
        }
    }
    else 
    {
        htmlLoading.innerHTML = '<h1 class="text-center">FEATURED</h1>';    
    }
    

    imageCollection = '';
    $(".image").hide().fadeIn(1000);
    $(".loading").hide().fadeIn(1000);
}

//addContent();
winCached.scroll(infiNLoader);