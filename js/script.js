const icon_width = 79;
const icon_height = 79;
const numIcons = 9;
const timePerIcon = 40;
const indexes = [0, 0, 0];
iconMap = ["banana", "seven", "cherry", "plum", "orange", "bell", "bar", "lemon", "melon"];
var money = document.getElementById("money");
const multipliers = {
    "banana": { "2": 1, "3": 5 },
    "seven": { "2": 3.5, "3": 20 },
    "cherry": { "2": 1, "3": 10 },
    "plum": { "2": 1.5, "3": 8 },
    "orange": { "2": 2, "3": 8 },
    "bell": { "2": 1.5, "3": 12 },
    "bar": { "2": 2, "3": 20 },
    "lemon": { "2": 1.2, "3": 6 },
    "melon": { "2": 1, "3": 10 }
};

function askForMoney() {
    var userInput = prompt("How much money would you like to add?");
    
    if (userInput !== null && !isNaN(userInput) && Number(userInput) > 0) {
        var amount = parseFloat(userInput);
        var moneyElement = document.getElementById("money");
        moneyElement.textContent = "$" + amount.toFixed(2);
    } else {
        alert("Please enter a valid number greater than 0.");
    }
}
let moneyAmount = 0;
let betAmount = 0;

function askForMoney() {
    var userInput = prompt("How much money would you like to add?");
    
    if (userInput !== null && !isNaN(userInput) && Number(userInput) > 0) {
        moneyAmount += parseFloat(userInput);
        var moneyElement = document.getElementById("money");
        moneyElement.textContent = "$" + moneyAmount.toFixed(2);
    } else {
        alert("Please enter a valid number greater than 0.");
    }
}

function askForBet() {
    var userInput = prompt("How much would you like to bet?");
    
    if (userInput !== null && !isNaN(userInput) && Number(userInput) > 0) {
        betAmount = parseFloat(userInput);
        if (betAmount > moneyAmount) {
            alert("Insufficient funds. Please add more money.");
            betAmount = 0;
        } else {
            var betElement = document.getElementById("bet");
            betElement.textContent = "$" + betAmount.toFixed(2);
        }
    } else {
        alert("Please enter a valid number greater than 0.");
    }
}

function getMultiplier(symbol, count) {
    if (count < 2 || count > 3) {
        return 0;
    }
    return multipliers[symbol] ? multipliers[symbol][count] || 0 : 0;
}

function playSound() {
    const audio = new Audio('media/spinsoundeffect.wav');
    const overlapDelays = [300, 650, 800]; 

    function playAtIntervals() {
        let totalDelay = 0;

        overlapDelays.forEach((delay, index) => {
            setTimeout(() => {
                audio.currentTime = 0; 
                audio.play();
            }, totalDelay);

            totalDelay += delay; 
        });
    }

    playAtIntervals();
}
function calculatePayout() {
    const symbolsOnPayline = indexes.map(index => iconMap[index]);
    const symbolCounts = symbolsOnPayline.reduce((acc, symbol) => {
        acc[symbol] = (acc[symbol] || 0) + 1;
        return acc;
    }, {});

    let totalPayout = 0;
    for (const [symbol, count] of Object.entries(symbolCounts)) {
        const multiplier = getMultiplier(symbol, count);
        totalPayout += multiplier;
    }

    const finalPayout = totalPayout * betAmount;
    moneyAmount += finalPayout;

    document.getElementById("money").textContent = "You got $" + moneyAmount.toFixed(2);
    document.getElementById("payout").textContent = "$" + finalPayout.toFixed(2);
}

const roll = (reel, offset = 0) => {
    playSound();
    const positionChange = (offset + 2) * numIcons + 
    Math.round(Math.random() * numIcons);
    const style = getComputedStyle(reel);
    const backgroundPositionY = parseFloat(style["background-position-y"]);
    const targetPositionY = backgroundPositionY + positionChange * icon_height;
    const normalisedPositionY = targetPositionY % (numIcons * icon_height);

    return new Promise((resolve, reject) => {
        reel.style.transition = `background-position-y ${8 + positionChange * timePerIcon}ms cubic-bezier(.45,.05,.58,1.10)`;
        reel.style.backgroundPositionY = `${targetPositionY}px`;

        setTimeout(() => {
            reel.style.transition = 'none';
            reel.style.backgroundPositionY = `${normalisedPositionY}px`;
            resolve(positionChange % numIcons);
        }, 8 + positionChange * timePerIcon);
    });
};

var isRolling = false; 
function rollAll() {
    if (isRolling) return;

    if (betAmount <= 0) {
        alert("Please place a bet before spinning.");
        return;
    }

    if (betAmount > moneyAmount) {
        alert("You have no balance.");
        return;
    }

    isRolling = true;
    moneyAmount -= betAmount; 
    var betElement = document.getElementById("bet");
    betElement.textContent = "$" + betAmount.toFixed(2); 

    const reelsList = document.querySelectorAll('.slots > .reel');
    const button = document.querySelector('.button button');
    button.disabled = true;

    Promise
        .all([...reelsList].map((reel, i) => roll(reel, i)))
        .then((deltas) => {
            deltas.forEach((delta, i) => indexes[i] = (indexes[i] + delta) % numIcons);
            calculatePayout();
        })
        .finally(() => {
            isRolling = false; 
            button.disabled = false; 
        });
}