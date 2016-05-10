blocks.query(new Player())

function Player() {
  this.isPlaying = blocks.observable(false)
  this.isFullScreen = blocks.observable(false)
  this.isShowControl = blocks.observable(true)
  this.playTime = blocks.observable(0)
  this.videoDuration = blocks.observable(0)
  this.subTop = blocks.observable('')
  this.subBottom = blocks.observable('')

  this.duration = blocks.observable(function () {
    return formatTime(this.videoDuration())
  }, this)
  this.currentTime = blocks.observable(function () {
    return formatTime(this.playTime())
  }, this)

  this.video
  this.subtitlesTop
  this.subcountTop = 0
  this.subtitlesBottom
  this.subcountBottom = 0

  this.updateSub = function (subtitles) {
    var subtitle = ''

    // check if the next subtitle is in the current time range
    if (this.video.currentTime.toFixed(1) > videosub_timecode_min(subtitles[this.subcountTop][1])
          && this.video.currentTime.toFixed(1) < videosub_timecode_max(subtitles[this.subcountTop][1])) {
      subtitle = subtitles[this.subcountTop][2]
    }

    // is there a next timecode?
    if (this.video.currentTime.toFixed(1) > videosub_timecode_max(subtitles[this.subcountTop][1])
          && this.subcountTop < (subtitles.length - 1)) {
      this.subcountTop++
    }

    return subtitle
  }

  this.seekSub = function (subtitles) {
    this.subcountTop = 0

    while (videosub_timecode_max(subtitles[this.subcountTop][1]) < this.video.currentTime.toFixed(1)) {
			this.subcountTop++
			if (this.subcountTop > subtitles.length - 1) {
        this.subcountTop = subtitles.length - 1
        break;
			}
    }
  }

  this.videoHandle = function (event) {
    switch (event.type) {
      case 'loadeddata':
        this.video = event.target
        this.videoDuration(this.video.duration)

        var that = this
        getData('media/WhatCouldIDo-sub-en.srt', function (data) {
          that.subtitlesTop = parseSub(data)
        })
        getData('media/WhatCouldIDo-sub-vi.srt', function (data) {
          that.subtitlesBottom = parseSub(data)
        })
        break;
      case 'timeupdate':
        this.playTime(this.video.currentTime)

        this.subTop(this.updateSub(this.subtitlesTop))
        this.subBottom(this.updateSub(this.subtitlesBottom))
        break
      case 'seeked':
        this.seekSub(this.subtitlesTop)
        this.seekSub(this.subtitlesBottom)
        break
      case 'ended':
        this.isPlaying(false)
        break
      case 'click':
        this.isPlaying() ? this.video.pause() : this.video.play()
        this.isPlaying(!this.isPlaying())
        break        
    }
  }

  this.clickControl = function (event) {
    switch (event.target.id) {
      case 'play':
        this.isPlaying() ? this.video.pause() : this.video.play()
        this.isPlaying(!this.isPlaying())
        this.hideControl()
        break

      case 'sound':
        break
      case 'calendar':
        break
      case 'sub':
        break
      case 'setting':
        break
      case 'full':
        this.isFullScreen() ? changeFullScreenState(player, true) : changeFullScreenState(player)
        this.isFullScreen(!this.isFullScreen())
        break
    }
  }
  
  this.mouseMove = function (event) {
    this.isShowControl(true)

    if (this.isPlaying()) {
      this.hideControl()
    }
  }
    
  this.clickProgress = function (event) {
    var padding = parseFloat(window.getComputedStyle(event.target).paddingLeft)
    this.video.currentTime = ((event.offsetX - padding) / (event.target.offsetWidth - padding * 2)) * event.target.max
  }
  
  this.hideControl = function () {
    var that = this
    var lastTimeMouseMoved = new Date().getTime();
    setTimeout(function () {
      var currentTime = new Date().getTime();
      if (currentTime - lastTimeMouseMoved >= 5000) {
        that.isShowControl(false)
      }
    }, 5000)
  }
}

function formatTime(seconds) {
  // multiply by 1000 because Date() requires miliseconds
  var date = new Date(seconds * 1000)
  var hh = date.getUTCHours()
  var mm = date.getUTCMinutes()
  var ss = date.getSeconds()

  // If you were building a timestamp instead of a duration, you would uncomment the following line to get 12-hour (not 24) time
  // if (hh > 12) {hh = hh % 12;}
  // These lines ensure you have two-digits
  if (hh < 10) { hh = '0' + hh }
  if (mm < 10) { mm = '0' + mm }
  if (ss < 10) { ss = '0' + ss }

  // This formats your string to HH:MM:SS
  return (hh == '00') ? mm + ':' + ss : hh + ':' + mm + ':' + ss
}

function changeFullScreenState(element, isExit) {
  var requestMethod

  if (isExit) {
    requestMethod = document.cancelFullScreen || document.webkitCancelFullScreen || document.mozCancelFullScreen || document.msCancelFullScreen
    requestMethod.call(document);
    return
  }

  // Supports most browsers and their versions.
  requestMethod = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen || element.msRequestFullscreen

  if (requestMethod) { // Native full screen.
    requestMethod.call(element);
  } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
    var wscript = new ActiveXObject("WScript.Shell");
    if (wscript !== null) {
      wscript.SendKeys("{F11}");
    }
  }
}

function videosub_timecode_min(tc) {
		tcpair = tc.split('-->');
		return videosub_tcsecs(tcpair[0]);
}

function videosub_timecode_max(tc) {
		tcpair = tc.split('-->');
		return videosub_tcsecs(tcpair[1]);
}

function videosub_tcsecs(tc) {
		tc1 = tc.split(',');
		tc2 = tc1[0].split(':');
		secs = Math.floor(tc2[0] * 60 * 60) + Math.floor(tc2[1] * 60) + Math.floor(tc2[2]);
		return secs;
}

function getData(url, callback) {
  var xhr = new XMLHttpRequest()
  xhr.open('GET', encodeURI(url))
  xhr.onload = function () {
    if (xhr.status === 200) {
      callback(xhr.responseText)
    }
    else {
    }
  }

  xhr.send()
}

function parseSub(sub) {
  subtitles = new Array()
  records = sub.split('\n\n')

  for (var r = 0; r < records.length; r++) {
    record = records[r]
    subtitles[r] = new Array()
    subtitles[r] = record.split('\n')
  }

  return subtitles
}
