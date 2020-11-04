
require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')

const app = express()
const port = process.env.SERVER_PORT || 4501

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended:true , limit:'50mb'}))
app.use(bodyParser.json({limit:'50mb'}))

app.use('/torrent', require('./routes/torrents.js'))

app.listen(port, ()=>console.log(`Server listening on port ${port}`))

