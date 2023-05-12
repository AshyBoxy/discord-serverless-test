import nacl from "tweetnacl";

/**
 *
 * @param {import("@vercel/node").VercelRequest} req
 * @param {import("@vercel/node").VercelResponse} res
 */
export default async function handler(req, res) {
    if (req.method === 'POST') {
        let data = "";
        const body = req.body;

        await new Promise((res) => {
            const dataHandler = (d) => {
                let ds = d?.toString();
                // console.log({ d, ds });
                if (ds) data += ds;
            };
            req.on("data", dataHandler);
            req.once("end", () => {
                req.off("data", dataHandler);
                res();
            });
        });


        // res.json({ data });
        // console.log({ body: req.body, data });

        const signature = req.headers["X-Signature-Ed25519"];
        const timestamp = req.headers["X-Signature-Timestamp"];
        if (!signature || !timestamp) {
            console.log("no signature");
            return res.status(400).end("Missing signature information");
        }
        if (!nacl.sign.detached.verify(
            Buffer.from(timestamp + data), Buffer.from(signature, "hex"), Buffer.from(process.env.PUBLIC_KEY, "hex")
        )) {
            console.log("bad signature");
            return res.status(401).end("Invalid signature");
        }


        if (!body.type) {
            console.log("no type");
            return res.status(400).end("Missing type on request");
        }

        switch (body.type) {
            case 1:
                return res.json({ type: 1 });
            default:
                console.log(req.body);
        }

        return res.status(200).end();
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}
