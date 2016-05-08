var player, video

window.onload = function () {
  player = document.getElementById('player');
  video = document.getElementById('video-player');
}

blocks.query(new Player())

function Player() {
  this.isPlaying = false
  this.playClass = blocks.observable('glyphicon-play')

  this.isFullScreen = false;
  this.fullScreenClass = blocks.observable('glyphicon-resize-full')

  this.clickControl = function (event) {
    switch (event.target.id) {
      case 'play':
        if (this.isPlaying) {
          video.pause()
          this.playClass('glyphicon-play')
        } else {
          video.play()
          this.playClass('glyphicon-pause')
        }

        this.isPlaying = !this.isPlaying
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
        if (this.isFullScreen) {
          requestFullScreen(player, true)
          this.fullScreenClass('glyphicon-resize-full')
        } else {
          requestFullScreen(player)
          this.fullScreenClass('glyphicon-resize-small')
        }

        this.isFullScreen = !this.isFullScreen
        break
    }
  }
}

function requestFullScreen(element, isExit) {
  var requestMethod
  
  if (isExit) {
    requestMethod = document.cancelFullScreen || document.webkitCancelFullScreen || document.mozCancelFullScreen || document.msCancelFullScreen
    console.log(requestMethod)
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