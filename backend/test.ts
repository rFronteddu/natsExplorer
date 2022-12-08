import { Timestamp } from "google-protobuf/google/protobuf/timestamp_pb";
import { connect, StringCodec, NatsConnection } from "nats";
import { load } from "protobufjs";

async function runPublisher() {
    const natsConnection = await connect({ servers: `127.0.0.1:4222` });
    if (natsConnection === null || natsConnection === undefined) {
        console.log('Not connected to the server.');
        return;
    }

    load("measure.proto", async function (err, root) {
        if (err) {
            throw err;
        }

        if (root === undefined) {
            throw 'root is undefined';
        }

        var Measure = root.lookupType("us.ihmc.proto.sensei.measure.Measure");
        var Subject = root.lookupEnum("us.ihmc.proto.sensei.measure.Subject");
        if (Measure === undefined || Subject === undefined) { 
            throw 'Measure or Subject is undefined';
        }
        const sc = StringCodec();
        for (var i = 0; i < 10; i++) {
            //TODO: get real data
            const opt = Math.round(getRandomWithinRange(0,42))
            var payload = { 
                subject: opt,
                strings: {"string1": "hello string", "string2": "hello string2"}, 
                integers: {"int1": 1, "int2": 2}, 
                doubles: {"double1": 1.0, "double2": getRandomWithinRange(0,100)}, 
                timestamp: new Timestamp().fromDate(new Date()), 
                requestID: 'uuid'
            };

            var message = Measure.create(payload); 
            var buffer = Measure.encode(message).finish();
            var message = Measure.decode(buffer);
            
            natsConnection.publish("hello", sc.encode(JSON.stringify(message)));
        }
        await natsConnection.drain();
    });
}

async function runListener() {
    const natsConnection = await connect({ servers: `127.0.0.1:4222` });
    if (natsConnection === null || natsConnection === undefined) {
        console.log('Not connected to the server.');
        return;
    }
    const sc = StringCodec();
    const sub = natsConnection.subscribe("hello");
    (async () => {
        for await (const m of sub) {
            console.log(`[${sub.getSubject()}]: ${sc.decode(m.data)}`);
        }
        console.log("subscription closed");
    })();

    //await natsConnection.drain();
}

function getRandomWithinRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

runListener();

runPublisher();