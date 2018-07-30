jQuery(document).ready(function( $ ) {

  /**
   * Video overlay
   */

  $('.playvideo').click(function () {
    $(".mask").show();
    $(".playbrdr").show();
    var iframeUrl=$("iframe").attr("src");
    $("iframe").attr("src","http://player.youku.com/embed/XMzc0NzIyMTMxNg==")
  });
  $('.videoclose').click(function () {
    $(".mask").hide();
    $(".playbrdr").hide();
    var iframeUrl=$("iframe").attr("src");
    $("iframe").attr("src","")
  });
$(".imgbrdr").hover(function () {
    $(this).find(".qrcode").toggleClass("dn");
});
  /**
   * Banner
   */

  var introCarousel = $(".carousel");
  var introCarouselIndicators = $(".carousel-indicators");
  introCarousel.find(".carousel-inner").children(".carousel-item").each(function(index) {
  (index === 0) ?
  introCarouselIndicators.append("<li data-target='#introCarousel' data-slide-to='" + index + "' class='active'></li>") :
  introCarouselIndicators.append("<li data-target='#introCarousel' data-slide-to='" + index + "'></li>");
  });
  $(".carousel").swipe({
  swipe: function(event, direction, distance, duration, fingerCount, fingerData) {
    if (direction == 'left') $(this).carousel('next');
    if (direction == 'right') $(this).carousel('prev');
  },
  allowPageScroll:"vertical"

  });

  /**
   * Community
   */
	//
  // $(".clients-carousel").owlCarousel({
  //   autoplay: true,
  //   dots: true,
  //   loop: true,
  //   autoHeight: true,
  //   responsive: { 0: { items: 2 }, 768: { items: 4 }, 900: { items: 6 }
  //   }
  // });
});

/**
 * Roadmap
 */

(function() {

  var throttle = function(type, name, obj) {
    obj = obj || window;
    var running = false;
    var func = function() {
      if (running) { return; }
      running = true;
      requestAnimationFrame(function() {
        obj.dispatchEvent(new CustomEvent(name));
        running = false;
      });
    };
    obj.addEventListener(type, func);
  };
  throttle("resize", "optimizedResize");

  var wrapper = document.querySelector('.js-roadmap-timeline');
  var timeframes = document.querySelectorAll('.js-roadmap-timeframe');
  var mediaQuery = window.matchMedia("(min-width: 1201px)");
  var topMaxHeight;
  var bottomMaxHeight;

  handleStyling();
  window.addEventListener("optimizedResize", handleStyling);

  function handleStyling() {
    if (mediaQuery.matches) {
      applyHeights();
      styleWrapper();
    } else {
      clearWrapperStyling();
    }
  }

  function applyHeights() {
    topMaxHeight = getMaxHeight(timeframes, 0);
    bottomMaxHeight = getMaxHeight(timeframes, 1);
  }

  function getMaxHeight(els, start) {
    var maxHeight = 0;
    var i = start;

    for (; i < els.length - 1; i = i + 2) {
      var elHeight = els[i].offsetHeight;
      maxHeight = maxHeight > elHeight ? maxHeight : elHeight;
    }

    return maxHeight;
  }

  function styleWrapper() {
    wrapper.style.paddingBottom = bottomMaxHeight + 'px';
    wrapper.style.paddingTop = topMaxHeight + 'px';
  }

  function clearWrapperStyling() {
    wrapper.style.paddingBottom = '';
    wrapper.style.paddingTop = '';
  }
})();

/**
 * Pool list functionality
 */
 
Array.prototype.shuffle = function() {
  const input = this;
  // for (let i = input.length-1; i >=0; i--) {
  //   const randomIndex = Math.floor(Math.random()*(i+1));
  //   let itemAtIndex = input[randomIndex];
  //   input[randomIndex] = input[i];
  //   input[i] = itemAtIndex;
  // }
  return input;
};

(function() {
  var poolList = document.querySelector('.plist');
  var pools = document.querySelectorAll('.plist > p');
  var toggle = document.querySelector('.js-pool-info-toggle');
  var shuffledPools = Array.prototype.slice.call(pools).shuffle();
  var fragment = document.createDocumentFragment();
  var proxy = 'https://powerful-sea-54885.herokuapp.com/';
  var proxyFallback = 'https://cors-anywhere.herokuapp.com/';
  var messages = [
    {
      text: 'Synchronized with the main network. Normal operation.'
    },
    {
      text: 'Connected to the main network. Synchronizing.'
    },
    {
      text: 'Loading blocks from the local storage.'
    },
    {
      text: 'Can\'t connect to unix domain socket errno:111',
      userFriendlyText: 'Offline.'
    }
  ];
  var messageFallback = '有问题待解决';



  for (pool of shuffledPools) {
    fragment.appendChild(pool);
  }

  poolList.innerHTML = "";
  poolList.appendChild(fragment);

  toggle.addEventListener('click', renderPoolStates);

  function renderPoolStates() {
    for (pool of shuffledPools) {
      let stateEl = pool.querySelector('.js-pool-state');
      let url = stateEl.dataset.url;

      if (url === '') {
        stateEl.textContent = messageFallback;
      } else {
        stateEl.textContent = '读取矿池状态中...';
        handleStateCheck(url, stateEl, true);
      }
    }

    toggle.removeEventListener('click', renderPoolStates);
  }

  function handleStateCheck(url, el, firstRun) {
    $.ajax({
      url: proxy + url,
      type: 'GET',
      success: function(res) {
        res = res.state ? res.state : res;
        
        var message = messages.find(function(message) {
          return res.indexOf(message.text) > -1;
        });

        if (message !== undefined) {
          var str="";
          switch(message.text){
            case "Synchronized with the main network. Normal operation.":
                str="已于主网同步，可正常使用";
              break;
            case "Connected to the main network. Synchronizing.":
                str="已连接到主网，正在同步中...";
              break;
            case "Loading blocks from the local storage.":
                str="读取本地块...";
              break;
            case "Can't connect to unix domain socket errno:111":
                str="不能连接到unix的接口，错误代码：111";
              break;
            default:
              break;
          }
          el.textContent = message.hasOwnProperty('userFriendlyText') ? message.userFriendlyText : str;
        } else {
          el.textContent = messageFallback;
        }
      },
      error: function(res) {
        if (firstRun) {
          proxy = proxyFallback;
          handleStateCheck(url, el, false);
        } else {
          el.textContent = messageFallback; 
        }
      }
    });
  }
})();