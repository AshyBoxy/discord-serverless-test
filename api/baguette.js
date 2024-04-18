import nacl from "tweetnacl";

const defaultMessageResponse = {
    type: 4, // respond with message
    data: {
        content: "il s'agit d'une commande inconnue comment êtes-vous arrivé ici ?",
        allowed_mentions: {
            parse: []
        }
    }
};

const baguetteResponses = {
    "french": "Je ne suis qu'une baguette de pain, que voulez-vous que je fasse ?",
    "italian": "Sono solo una baguette, cosa ti aspetti che faccia?"
}

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

        const signature = req.headers["x-signature-ed25519"];
        const timestamp = req.headers["x-signature-timestamp"];


        if (!body.type) {
            console.log("no type");
            return res.status(400).end("Missing type on request");
        }

        /**
         * @type Record<string, any>
         */
        let response;
        let verify = true;

        switch (body.type) {
            case 1:
                console.log("Received ping");
                response = { type: 1 };
                // verify = false; // don't need to verify for ping?
                break;
            case 2: // application command
                response = defaultMessageResponse;
                switch (body.data.name) {
                    case "baguette":
                        response.data.content = baguetteResponses[(body.data.options?.find((x) => x.name === "language") || {value:"french"}).value] || baguetteResponses.french;
                        break;
                    default:
                        break;
                }
            // intentional fallthrough
            default:
                console.log({ body, type: body.type });
        }

        if (verify) {
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
        }

        console.log({ response });
        return res.json(response);
    } else {
        res.setHeader('Allow', 'POST');
        res.status(405).end('Method Not Allowed');
    }
}
