const http = require("http");
const { register, login, verify } = require("./controllers/authController");
require("dotenv").config();

const server = http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

    if (req.method === "OPTIONS") {
        res.writeHead(200);
        return res.end();
    }

    if (req.method === "POST" && req.url === "/api/v1/auth/register") {
        return register(req, res);
    }

    if (req.method === "POST" && req.url === "/api/v1/auth/login") {
        return login(req, res);
    }

    if (req.method === "GET" && req.url === "/api/v1/user/me") {
        return verify(req, res);
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: "Not found" }));

});

server.listen(process.env.PORT, () => {
    console.log(`Auth service running on port ${process.env.PORT}`);
});

console.log("Connecting to:", process.env.DB_HOST, process.env.DB_PORT);