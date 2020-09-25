import { disableChat, enableChat } from "./chat";
import { disableCanvas, enableCanvas, hideCanvasControls, resetCanvas, showCanvasControls } from "./paint";

const board = document.getElementById("jsPBoard");
const notifs = document.getElementById("jsNotifs");
const timer = document.getElementById("jsTimer");

const addPlayers = (players) => {
    board.innerHTML = "";
    players.forEach(player => {
        const PlayerElement = document.createElement("span");
        PlayerElement.innerText = `${player.nickname}: ${player.points}`;
        board.appendChild(PlayerElement);
    });
}

const setNotifs = (text) => {
    notifs.innerText = "";
    notifs.innerText = text;
};

const setTimer = (rTime) => {
    timer.innerText = "";
    timer.innerText = `Timer: ${rTime}`;
};

export const handlePlayerUpdate = ({ sockets }) => addPlayers(sockets);
export const handleGameStarted = () => {
    setNotifs("");
    disableCanvas();
    hideCanvasControls();
    enableChat();
};
export const handleLeaderNotif = ({ word }) => {
    enableCanvas();
    showCanvasControls();
    disableChat();
    setNotifs(`You are the leader, paint: ${word}`);
};
export const handleGameEnded = () => {
    setNotifs("Game ended.");
    disableCanvas();
    hideCanvasControls();
    resetCanvas();
};
export const handleGameStarting = () => {
    setNotifs("Game will start soon");
};
export const handleGameRemaining = ({ rTime }) => {
    setTimer(rTime);
}
export const handleTimerReset = () => {
    timer.innerText = "";
}