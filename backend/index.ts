import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { load } from 'protobufjs';
import { connect, StringCodec, NatsConnection, Subscription } from "nats";
import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';
import uuid from 'react-uuid';
const app: Express = express();
const port = 8081;

var natsConnection: NatsConnection;
var lastSubscription: Subscription;
const sc = StringCodec();
var subject = '*';
var messagesToBeCollected: string[] = [];

setInterval(() => {
    if (!natsConnection) {
        return;
    }
    if (!lastSubscription) {
        lastSubscription = natsConnection.subscribe(subject);
    }
    else {
        if (lastSubscription.getSubject() !== subject) {
            lastSubscription.unsubscribe();
            lastSubscription = natsConnection.subscribe(subject);
        }
    } 
    (async () => {
        for await (const m of lastSubscription) {
            console.log(`[${lastSubscription.getProcessed()}]: ${sc.decode(m.data)}`);
            messagesToBeCollected.push(sc.decode(m.data));
        }
    })();
}, 1000);

app.use(express.json())
app.use(cors({
    origin: 'http://localhost:3000'
}));

app.post('/connect', async function (req: Request, res: Response) {
    console.log(`Connecting to NATS server: ${req.body.ip}:${req.body.port}...`);
    //natsConnection = await connect({ servers: "demo.nats.io:4222" });    
    try {
        natsConnection = await connect({ servers: `${req.body.ip}:${req.body.port}` });
    } catch (error) {
        const err = processError(error)
        console.log(err);
        res.status(500).setHeader('Content-Type', 'text/plain').send(processError(err));
        return;
    }

    //connect to the server with provided credentials
    const success = natsConnection !== undefined && natsConnection !== null;
    if (success) {
        res.status(200).setHeader('Content-Type', 'text/plain').send(`Connected to NATS server ${req.body.ip}:${req.body.port}!`);
    } else {
        res.status(500).send('Could not connect to the server.');
    }
})

app.get('/disconnect', async function (req: Request, res: Response) {
    if (natsConnection === undefined || natsConnection === null) {
        res.status(500).send('Not connected to the server.');
        return;
    }
    natsConnection.close();
    res.status(200).setHeader('Content-Type', 'text/plain').send('Disconnected!');
})

app.get('/nats', async function (req: Request, res: Response) {
    if (natsConnection === null || natsConnection === undefined) {
        res.status(500).send('Not connected to the server.');
        return;
    }

    const search = req.query.search;

    if (search === undefined || search === null || search === '') {
        res.status(500).send('Search query is empty.');
        return;
    }

    subject = search.toString();
    res.status(200).send(messagesToBeCollected);
    messagesToBeCollected = [];
})

app.get('/protobuf', function (req: Request, res: Response) {
    load("measure.proto", function (err, root) {
        if (err) {
            res.status(500).setHeader('Content-Type', 'text/plain').send(err);
            throw err;
        }

        if (root === undefined) {
            res.status(500).setHeader('Content-Type', 'text/plain').send('root is undefined');
            throw 'root is undefined';
        }

        const messages: any[] = [];
        var Measure = root.lookupType("us.ihmc.proto.sensei.measure.Measure");
        var Subject = root.lookupEnum("us.ihmc.proto.sensei.measure.Subject");
        if (Measure === undefined || Subject === undefined) { 
            res.status(500).setHeader('Content-Type', 'text/plain').send('Measure or Subject is undefined');
            throw 'Measure or Subject is undefined';
        }
        for (var i = 0; i < 10; i++) {
            //TODO: get real data
            const opt = Math.round(getRandomWithinRange(0,42))
            var payload = { 
                subject: opt,
                strings: {"string1": "hello string", "string2": "hello string2"}, 
                integers: {"int1": 1, "int2": 2}, 
                doubles: {"double1": 1.0, "double2": getRandomWithinRange(0,100)}, 
                timestamp: new Timestamp().fromDate(new Date()), 
                requestID: uuid()
            };

            var message = Measure.create(payload); 
            var buffer = Measure.encode(message).finish();
            var message = Measure.decode(buffer);

            messages.push(message);

        var object = Measure.toObject(message, {
            longs: String,
            enums: String,
            bytes: String,
        });
        }

        res.status(200).setHeader('Content-Type', 'text/json').send(messages);
        
    });
})

function processError(e: any): string {
    if (typeof e === "string") {
        return e.toUpperCase() 
    } else if (e instanceof Error) {
        return e.message 
    }
    return "unknown error";
}

function getRandomWithinRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

app.listen(port, function () {
    console.log("App listening on port: %s", port)
})