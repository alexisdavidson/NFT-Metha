import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import bodyParser from 'body-parser'

const app = express()

dotenv.config()

app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/api/get_current_winner', (req, res) => {
    res.send({winner: 3})
})

app.listen(process.env.PORT, () => {
    console.log('Running on port ' + process.env.PORT)
})