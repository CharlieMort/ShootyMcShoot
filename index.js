const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.static("public"));

let server = http.createServer(app);
const io = socketIO(server);

let game = {
    players: [],
    timeSignature: 0
}

const pingSpeed = 10;
setInterval(() => {
    game.timeSignature = Date.now();
    io.to("game").emit("ping", game);
}, pingSpeed);

function JoinGame(socket) {
    socket.join("game");
    if (game.players.length < 2) {
        game.players.push({
            id: socket.id,
            health: 100,
            pos: [500,500]
        })
        console.log(game.players);
        return true;
    }
    else return false;
}

function Disconnect(socket) {
    game.players.map((player, idx) => {
        if (player.id === socket.id) {
            game.players.splice(idx, 1);
            return;
        }
    })
}

io.on("connection", (socket) => {
    console.log(`${socket.id} Just Connected :)`);
    console.log(`${io.engine.clientsCount} Clients Connected`);
    if (!JoinGame(socket)) {
        socket.emit("spectate");
    }
    else socket.emit("setPos", game.players[game.players.length-1].pos);
    socket.on("update", (pos) => {
        game.players.map((player) => {
            if (player.id === socket.id) {
                player.pos = [...pos];
            }
        })
    })
    socket.on("dealDamage", (dmg) => {
        game.players.map((player) => {
            if (player.id !== socket.id) {
                player.health -= dmg;
            }
        })
    })
    socket.on("shoot", (direction) => {
        socket.to("game").emit("shootYoShot", direction);
    })
    socket.on("disconnect", () => {
        Disconnect(socket);
    })
})

server.listen(PORT, () => console.log(`Server Listening On Port:${PORT}`));