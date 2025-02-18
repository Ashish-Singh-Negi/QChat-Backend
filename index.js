// index.js

const express = require('express')
const http = require("http")
const webSocket = require("ws")

const app = express();

// Create an HTTP Server
const server = http.createServer(app)


// Create a WebSocket Server 
const wss = new webSocket.Server({ server, path: "/ws" })

app.get("/", (req, res) => {
    res.send("Hare Krishna")
})

// WebSocket connection Handling
wss.on("connection", (ws) => {
    console.log("New Websocket connection");

    // Send a welcome message to a client
    ws.send(
        JSON.stringify({
            type: "welcome",
            message: "Connected to Websocket API"
        })
    )

    // Handle messages from client 
    ws.on("message", (message) => {
        console.log("Received : ", message)

        // Broadcast the message to all connected clients
        wss.clients.forEach(client => {
            if (client.readyState === webSocket.OPEN) {
                client.send(
                    JSON.stringify({
                        type: "broadcast",
                        data: message
                    })
                )
            }
        })
    })

    // Handle disconnect
    ws.on("close", () => {
        console.log("Websocket connection closed")
    })
})

// Start the HTTP Server 

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`API Server listening at http://localhost:${3000}`)
    console.log(`Websocket endpoint available at ws://localhost:${3000}/ws`)
})