export default function handler(req, res) {
    console.log(req);
    return res.json({
        foo: "bar"
    });
}
