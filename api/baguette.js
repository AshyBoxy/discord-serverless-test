import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(req, res) {
    console.log(req);
    return res.status(204);
}
