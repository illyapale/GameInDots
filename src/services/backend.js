import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import {settings} from './db/settings';
import {winners} from "./db/winners";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.get('/game-settings', (req, res) => {
    res.status(200).send(settings)
});

app.get('/winners', (req, res) => {
    res.status(200).send(winners)
});

app.post('/winners', (req, res) => {
  
    if(!req.body.winner) {
        return res.status(400).send({
            message: 'winner is required'
        });
    } 
    
    if(!req.body.date) {
        return res.status(400).send({
            message: 'date is required'
        });
    }

    const newWinner = {
        id: !req.body.id ? Math.random() : req.body.id,
        winner: req.body.winner,
        date: req.body.date
    };

    winners.push(newWinner);
    
    return res.status(201).send(winners);

});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`)
});