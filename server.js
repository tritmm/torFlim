var express = require('express')
var app = express()
var path = require('path')

app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use('/play', express.static(path.join(__dirname, 'play')));

app.get('/', function (req, res) {
  res.redirect('/play')
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
