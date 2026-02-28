function timeAgo(date) {
  var seconds = Math.floor((new Date() - date) / 1000);
  var rtf = new Intl.RelativeTimeFormat('en', {numeric: 'auto'});
  var intervals = [
    {unit: 'year', seconds: 31536000},
    {unit: 'month', seconds: 2592000},
    {unit: 'day', seconds: 86400},
    {unit: 'hour', seconds: 3600},
    {unit: 'minute', seconds: 60},
    {unit: 'second', seconds: 1}
  ];
  for (var i = 0; i < intervals.length; i++) {
    var count = Math.floor(seconds / intervals[i].seconds);
    if (count >= 1) return rtf.format(-count, intervals[i].unit);
  }
  return rtf.format(0, 'second');
}

function getLogin(){
  return normaliseLogin(window.location.hash.slice(1));
}

// normalize user input so we accept either a bare login or a
// full github.com profile URL.  If the value looks like a URL we
// strip everything except the username part.
function normaliseLogin(input) {
  input = (input || '').trim();
  var m = input.match(/github\.com\/([^\/?#\s]+)/i);
  return m ? m[1] : input;
}

var missingTemplate = $('#missing-template').html();
var foundTemplate = $('#found-template').html();
var errorTemplate = $('#error-template').html();
var requestErrorTemplate = $('#request-error-template').html();
var main = $('#main');
Mustache.parse(foundTemplate);
Mustache.parse(errorTemplate);
Mustache.parse(requestErrorTemplate);
Mustache.parse(missingTemplate);

function render(template, params) {
  main.html(Mustache.render(template, params))
  emojify.run($('#title')[0])
}

function loadData(login, cb){
  if(login){
    ga('send', 'event', 'login', 'search', login);
    var searchURL = 'https://api.github.com/search/issues?q=type:pr+author:"'+login+'"+-user:"'+login+'"&sort=created&order=asc&per_page=1'
    $.getJSON(searchURL, function(data){
      if(data.items.length > 0){
        $.getJSON(data.items[0].pull_request.url, function(data){
          cb(data)
        }).error(function () {
          render(requestErrorTemplate)
          flappyBoard()
        })
      } else {
        cb(null)
      }
    }).error(function(){
      render(errorTemplate, {login: login})
      flappyBoard()
    })
  }
}

function renderData(pullRequestData){
  if(pullRequestData){
    render(foundTemplate, pullRequestData)
    if(typeof twttr !== 'undefined'){twttr.widgets.load()}
    $('.moment-date').each(function (index, dateElem) {
      var $dateElem = $(dateElem);
      var time = new Date($dateElem.attr('datetime'));
      var formatted = time.toLocaleString('en-US', {year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit'});
      $dateElem.attr('title', $dateElem.text() + " on " + formatted);
      if($dateElem.hasClass('sent')){
        $dateElem.attr('title', formatted);
        $dateElem.text(timeAgo(time))
      }
    });
  } else {
    render(missingTemplate, {login: getLogin()})
  }
  flappyBoard()
}

function flappyBoard(){
  $('#login').val(getLogin()).blur()
  imagesLoaded( '.result', function() {
    $('.result').removeClass('hidden').addClass('expanded')
    setTimeout(function(){
      $('.spinner').addClass('hide')
    }, 500)
  })
}

$(function() {
  $(window).on('hashchange',function(){
    loadData(getLogin(), renderData)
  });
  
  $('#user-form').submit(function(){
    $('.spinner').removeClass('hide')
    window.location.hash = ''
    // normalise in case the user pasted a full profile URL
    window.location.hash = normaliseLogin($('#login')[0].value)
    return false
  })

  loadData(getLogin(), renderData)
});
