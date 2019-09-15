/**
 * Begins a stream with rev.ai using the AudioContext from the browser. Stream will continue until the websocket 
 * connection is closed. Follows the protocol specficied in our documentation:
 * https://www.rev.ai/docs/streaming
 */

const socket = io();

const colors = ['purple', 'blue'];
const EXACT_RHYME_BONUS = 10;
const NEAR_RHYME_BONUS = 5;
var clientPoints = 0;
var rapperName = null;
var barCount = 0;
var textColor = null;
var currentColor = null;
var playerCount = 0;
var roomName = null;
var finalsReceived = 1;
var firstWord = null;
var secondWord = null;
var currentCell = null;

var lives = 1;


var comboMultiplier = 1;
var comboCount = 0;
var missCount = 0;

var currentRound = 0;

var nameInputArea = document.getElementById('name-input');
var roomInputEnterButton = document.getElementById('room-input-button');
var roomInputArea = document.getElementById('room-input');
var introContainer = document.getElementById('intro');
var gameContainer = document.getElementById('game');
var messageTable = document.getElementById('messages');
var roundWinnerElement = document.getElementById('round-winner');
var lifeCountElement = document.getElementById('lives');

var button = document.getElementById('streamButton');

var statusElement = document.getElementById('status');
var tableElement = document.getElementById('messages');
var scoreElement = document.getElementById('score');

socket.on('display game', (players) => {
    if (textColor == null) {
        textColor = colors[players-1];
        messageTable.style.color = textColor;
    }
    playerCount = players;
    initGame();
});

socket.on('print line', (line) => {
    statusElement.innerHTML = 'Wait your turn!';
    button.disabled = true;
    var row = tableElement.insertRow(finalsReceived);
    finalsReceived++;
    row.style.color = oppositeColor();
    currentCell = row.insertCell(0);
    currentCell.innerHTML = line;
    if (finalsReceived % 4 == 0) {
        var row = tableElement.insertRow(finalsReceived);
        finalsReceived++;
        currentCell = row.insertCell(0);
    }
});

socket.on('start turn', ({opponent, score, round}) => {
    if (round == currentRound-1 && score != clientPoints) {
        var winner;
        console.log('comparing own ' + clientPoints + ' with opponents ' + score);
        if (clientPoints > score) {
            winner = rapperName;
        }
        else if (score > clientPoints) {
            winner = opponent;
        }
        else {
            winner = 'tie';
        }
        socket.emit('calc winner', {room: roomName, winner: winner});
    }
    else {
        if (round == currentRound-1 && score == clientPoints) {
            winner = 'tie';
            socket.emit('calc winner', {room: roomName, winner: winner});
        }
        doStream();
    }
});

socket.on('render winner', (winner) => {
    var renderText;
    console.log('render... ' + winner);
    if (winner === rapperName) {
        renderText = 'You won this round!';
    }
    else if (winner == 'tie') {
        renderText = 'It was a tie!';
        console.log('tie');
    }
    else {
        renderText = 'You lost this round so -1 life. ):';
        lives--;
        lifeCountElement.innerHTML = lives;
        if (lives == 0) {
            endGame(winner);
        }
    }
    roundWinnerElement.innerHTML = renderText;
    roundWinnerElement.style.opacity = 1;

    setTimeout(() => {
        roundWinnerElement.style.opacity = 0;
    }, 3000);
});

socket.on('end game', (winner) => {
    endStream();
    console.log('winner: ' + winner);
    if (winner === rapperName) {
        endGameSelf('win');
    }
    else {
        endGameSelf('lose');
    }
});

roomInputEnterButton.addEventListener('click', () => {
    var name = nameInputArea.value;
    var room = roomInputArea.value;
    if (name != '' && room != '') {
        enterRoom(name, room);
    }
});

function endGame(winner) {
    socket.emit('end game', {room: roomName, winner: winner});
}

function endGameSelf(status) {
    if (status === 'win') {
        statusElement.style.color = 'green';
        statusElement.innerHTML = 'Game over! You won!';
    }
    else {
        statusElement.style.color = 'red';
        statusElement.innerHTML = 'Game over! You lost.';
    }
}

function enterRoom(name, room) {
    socket.emit('enter room', {name: name, room: room});
    rapperName = name;
    roomName = room;
}

function initGame() {
    console.log('initializing game');
    lifeCountElement.innerHTML = lives;
    var title = document.getElementById('title');
    title.innerHTML = rapperName + ", you are in room " + roomName;
    introContainer.style.display = 'none';
    gameContainer.style.display = 'inline-block';
    var row = tableElement.insertRow(0);
    currentCell = row.insertCell(0);
}

function doStream() {
    audioContext = new (window.AudioContext || window.WebkitAudioContext)();
    const access_token = '02_93zrT-hS055hgDOUgFJA833ixTMSt8njca-nDdfqudyLbOm_4KHdvayppkY-K1XSPIIeEmLtBrrqbPG1a4zPn1KH6w';
    const content_type = `audio/x-raw;layout=interleaved;rate=${audioContext.sampleRate};format=S16LE;channels=1`;
    const baseUrl = 'wss://api.rev.ai/speechtotext/v1alpha/stream';
    const query = `access_token=${access_token}&content_type=${content_type}`;
    websocket = new WebSocket(`${baseUrl}?${query}`);

    websocket.onopen = onOpen;
    websocket.onclose = onClose;
    websocket.onmessage = onMessage;
    websocket.onerror = console.error;

    button.onclick = endStream;
    button.disabled = true;
    //button.innerHTML = 'Stop';
}

/**
 * Gracefully ends the streaming connection with rev.ai. Signals and end of stream before closing and closes the 
 * browser's AudioContext
 */
function endStream() {
    if (websocket) {
        websocket.send('EOS');
        websocket.close();
    }
    if (audioContext) {
        audioContext.close();
    }

    var button = document.getElementById('streamButton');
    //utton.onclick = doStream;
    button.innerHTML = 'Start Game';
}

/**
 * Updates the display and creates the link from the AudioContext and the websocket connection to rev.ai
 * @param {Event} event 
 */
function onOpen(event) {
    resetDisplay();
    // statusElement.innerHTML = 'Your turn to rap!';
    navigator.mediaDevices.getUserMedia({ audio: true }).then((micStream) => {
        audioContext.suspend();
        var scriptNode = audioContext.createScriptProcessor(4096, 1, 1 );
        var input = input = audioContext.createMediaStreamSource(micStream);
        scriptNode.addEventListener('audioprocess', (event) => processAudioEvent(event));
        input.connect(scriptNode);
        scriptNode.connect(audioContext.destination);
        audioContext.resume();
    });
}

/**
 * Displays the close reason and code on the webpage
 * @param {CloseEvent} event
 */
function onClose(event) {
    //statusElement.innerHTML = `Closed with ${event.code}: ${event.reason}`;
    //statusElement.innerHTML = 'Wait your turn!';
}

/**
 * Handles messages received from the API according to our protocol
 * https://www.rev.ai/docs/streaming#section/Rev.ai-to-Client-Response
 * @param {MessageEvent} event
 */
async function onMessage(event) {
    var data = JSON.parse(event.data);
    switch (data.type){
        case 'connected':
            // statusElement.innerHTML =`Connected, job id is ${data.id}`;
            statusElement.innerHTML = 'Your turn to rap!';
            break;
        case 'partial':
            currentCell.innerHTML = parseResponse(data);
            break;
        case 'final':
            var cellData = parseResponse(data);
            if (data.type == 'final' && data.elements.length > 0 && cellData !== ""){
                currentCell.innerHTML = cellData;
                console.log('line: ' + finalsReceived);
                barCount++;
                finalsReceived++;
                var row = tableElement.insertRow(finalsReceived);
                row.style.color = textColor;
                currentCell = row.insertCell(0);
                console.log('dropping line');
                socket.emit('line drop', {room: roomName, line: cellData});
                if (firstWord == null) {
                    firstWord = cellData.split(' ').splice(-1)[0].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,'').toLowerCase();
                    console.log(firstWord);
                }
                else if (firstWord != null && secondWord == null) {
                    secondWord = cellData.split(' ').splice(-1)[0].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,'').toLowerCase();
                    console.log('Comparing ' + firstWord + ' with ' + secondWord);
                    let prevScore = clientPoints;
                    await Promise.all([getExactRhymeScore(firstWord, secondWord), getNearRhymeScore(firstWord, secondWord)]);
                    let newScore = clientPoints;
                    if (newScore == prevScore) {
                        comboCount = 0;
                        comboMultiplier = 1;
                    }
                    score.innerHTML = clientPoints;
                    resetSelfRound();
                }
                if (barCount != 0 && barCount%4 == 0) {
                    console.log('Next person goes.');
                    endStream();
                    socket.emit('turn finished', {room: roomName, name: rapperName, score: clientPoints, round: currentRound});
                    currentRound++;
                }
            }
            break;
        default:
            // We expect all messages from the API to be one of these types
            console.error('Received unexpected message');
            break;
    }
}

function resetSelfRound() {
    firstWord = null;
    secondWord = null;
}

function oppositeColor() {
    if (textColor == colors[0]) {
        return colors[1];
    }
    else {
        return colors[0];
    }
}

function calculateMultipliedPoints(pointValue) {
    comboMultiplier += Math.floor(comboCount / 2) * .1;
    return pointValue * comboMultiplier;
}

/**
 * Transform an audio processing event into a form suitable to be sent to the API. (S16LE or Signed 16 bit Little Edian).
 * Then send.
 * @param {AudioProcessingEvent} e 
 */
function processAudioEvent(e) {
    if (audioContext.state === 'suspended' || audioContext.state === 'closed' || !websocket) {
        return;
    }

    let inputData = e.inputBuffer.getChannelData(0);

    // The samples are floats in range [-1, 1]. Convert to PCM16le.
    let output = new DataView(new ArrayBuffer(inputData.length * 2));
    for (let i = 0; i < inputData.length; i++) {
        let multiplier = inputData[i] < 0 ? 0x8000 : 0x7fff; // 16-bit signed range is -32768 to 32767
        output.setInt16(i * 2, inputData[i] * multiplier | 0, true); // index, value, little edian
    }

    let intData = new Int16Array(output.buffer);
    let index = intData.length;
    while (index-- && intData[index] === 0 && index > 0) { }
    websocket.send(intData.slice(0, index + 1));
}

function parseResponse(response) {
    var message = '';
    for (var i = 0; i < response.elements.length; i++){
        message += response.type == 'final' ?  response.elements[i].value : `${response.elements[i].value} `;
    }
    return message;
}

function resetDisplay() {
    var row = tableElement.insertRow(finalsReceived);
    row.style.color = textColor;
    currentCell = row.insertCell(0);
}

async function getExactRhymeScore(word1, word2) {
    await fetch(`https://api.datamuse.com/words?rel_rhy=${word1}&sp=${word2[0]}*`).then(async (response)=> {
        let data = await response.json()
        var exactResult = new Map(data.map(i => [i.word, i.score])); // map word -> score
        if (exactResult.has(word2)) {
            comboCount++;
            comboMultiplier += Math.floor(comboCount / 2) * .1;
            console.log(comboMultiplier);
            clientPoints += EXACT_RHYME_BONUS * comboMultiplier;
        }
    });
}

async function getNearRhymeScore(word1, word2) {
    await fetch(`https://api.datamuse.com/words?rel_nry=${word1}&sp=${word2[0]}*`).then(async (response)=> {
        let data = await response.json()
        var nearResult = new Map(data.map(i => [i.word, i.score])); // map word -> score
        if (nearResult.has(word2)) {
            comboCount++;
            comboMultiplier += Math.floor(comboCount / 2) * .1;
            console.log(comboMultiplier);
            clientPoints += NEAR_RHYME_BONUS * comboMultiplier;
        }
    });
}