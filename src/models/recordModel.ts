export class RecordNode {
    constructor(public records: RecordModel[], public nodes: RecordNode[]) { }
}

export class RecordModel {
    constructor(
        public subject: string, 
        public strings: Map<string,string>, 
        public integers: Map<string,number>, 
        public doubles: Map<string,number>, 
        public requestID: string
        ) { }
}