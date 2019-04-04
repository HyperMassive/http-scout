import morganBody from 'morgan-body';
import express from 'express';
import bodyParser from 'body-parser';

const app = express();

app.use(bodyParser.json());
morganBody(app);
const port = 3000;

app.get('/', (req, res) => res.status(200).send('Hello World!'));
app.post('/', (req, res) => res.status(201).send({ postBody: req.body }));
app.put('/', (req, res) => res.status(200).send({ putBody: req.body }));
app.delete('/', (req, res) => res.status(200).send({ deleteBody: req.body }));

app.listen(port, () => console.log(`repeater app listening on port ${port}!`));
