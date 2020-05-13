import * as Utils from '../utils.js';

const $ = e => { return document.getElementById(e); }

const addMoney = $("addMoney");
const removeMoney = $("removeMoney");

const totalEle = $("total");

const singles = $("singles");
const fives = $("fives");
const tens = $("tens");
const twenties = $("twenties");
const fifties = $("fifties");
const hundreds = $("hundreds");

addMoney.onclick = e => {
    let curTotal = parseInt(totalEle.innerHTML);
    let total = 0;
    total += parseInt(singles.value);
    total += parseInt(fives.value) * 5;
    total += parseInt(tens.value) * 10;
    total += parseInt(twenties.value) * 20;
    total += parseInt(fifties.value) * 50;
    total += parseInt(hundreds.value) * 100;
    totalEle.innerHTML = curTotal + total;
}

removeMoney.onclick = e => {
    let curTotal = parseInt(totalEle.innerHTML);
    let total = 0;
    total += parseInt(singles.value);
    total += parseInt(fives.value) * 5;
    total += parseInt(tens.value) * 10;
    total += parseInt(twenties.value) * 20;
    total += parseInt(fifties.value) * 50;
    total += parseInt(hundreds.value) * 100;
    
    totalEle.innerHTML = total > curTotal ? 0 : curTotal - total;
}

$("save").onclick = e => {
    window.localStorage.setItem("test", "It worked!")
}