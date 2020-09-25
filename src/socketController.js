import events from "./event";
import { chooseWord } from "./words";

let sockets = [];
let inProgress = false;
let word = null;
let leader = null;
let timeout = null;
let interval = null;

const GAME_TIME = 60000;

const chooseLeader = () => sockets[Math.floor(Math.random() * sockets.length)]

const socketController = (socket, io) => {
    const broadcast = (event, data) => socket.broadcast.emit(event, data);
    const superBroadcast = (event, data) => io.emit(event, data);
    const sendPlayerUpdate = () => superBroadcast(events.playerUpdate, { sockets });
    const startGame = () => {
        if (!inProgress && sockets.length > 1) {
            inProgress = true;
            leader = chooseLeader();
            word = chooseWord();
            superBroadcast(events.gameStarting);
            setTimeout(() => {
                superBroadcast(events.gameStarted);
                io.to(leader.id).emit(events.leaderNotif, { word });
                let rTime = GAME_TIME/1000;
                interval = setInterval(() => {
                    superBroadcast(events.gameRemaining, { rTime });
                    rTime = rTime -1;
                    if (rTime < 2) {
                        superBroadcast(events.timerReset);
                        clearInterval();
                        endGame();
                    }
                }, 1000);
            }, 5000);
        }
    };
    const endGame = () => {
        superBroadcast(events.timerReset);
        clearInterval(interval);
        inProgress = false;
        superBroadcast(events.gameEnded);
        setTimeout(() => {
            startGame();
        }, 2000);
        if (timeout) {
            clearTimeout(timeout);
        }
    };
    const addPoints = (id) => {
        sockets = sockets.map(socket => {
            if (socket.id === id) {
                socket.points += 10;
            }
            return socket;
        });
        sendPlayerUpdate();
        endGame();
    };
    
    socket.on(events.setNickname, ({ nickname })=> {
        socket.nickname = nickname;
        sockets.push({ id: socket.id, points: 0, nickname })
        broadcast(events.newUser, { nickname });
        sendPlayerUpdate();
        if (sockets.length === 2) {
            startGame();
        }
    });
    socket.on(events.disconnect, () => {
        sockets = sockets.filter(aSocket => aSocket.id !== socket.id);
        if (sockets.length < 2) {
            endGame();
        } else if (leader) {
            if (socket.id === leader.id) {
                endGame();
            }
        }
        broadcast(events.disconnected, { nickname: socket.nickname });
        sendPlayerUpdate();
    });
    socket.on(events.sendMsg, ({ message }) => {
        if (message === word) {
            superBroadcast(events.newMsg, {
                message: `Winner is ${socket.nickname}, word was: ${word}`,
                nickname: "Bot"
            });
            addPoints(socket.id);
        } else {
            broadcast(events.newMsg, {
                message,
                nickname: socket.nickname
            });
        }
    });
    socket.on(events.beginPath, ({ x, y }) => {
        broadcast(events.beganPath, { x, y });
    });
    socket.on(events.strokePath, ({ x, y }) => {
        broadcast(events.strokedPath, { x, y });
    });
    socket.on(events.pickColor, ({ color }) => {
        broadcast(events.pickedColor, { color });
    });
    socket.on(events.selectLineWidth, ({ size }) => {
        broadcast(events.selectedLineWidth, { size });
    });
    socket.on(events.fill, () => {
        broadcast(events.filled);
    });
};

export default socketController;