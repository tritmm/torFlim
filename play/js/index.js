var App = blocks.Application()

var isPlaying = blocks.observable(false)
App.View('Player', new Player(isPlaying))
App.View('Play', {
  isPlaying: isPlaying,
  playerClass: blocks.observable(function () {
    return isPlaying() ? 'col-md-12' : 'col-md-10'
  }, this)
})