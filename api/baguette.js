import * as nacl from "tweetnacl";

export default function handler(req, res) {
    if (req.method === 'POST') {
        const buf = await buffer(req);
        const rawBody = buf.toString('utf8');

        console.log(rawBody);

        // Can do something here...
        res.json({ rawBody });
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}

async function buffer(readable: Readable) {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}

export const config = {
    api: {
        bodyParser: false,
    }
};
