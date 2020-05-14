'use strict'
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
    $("save").disabled = false;
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
    $("save").disabled = false;
}

$("save").onclick = e => {
    window.localStorage.setItem("singles", singles.value);
    window.localStorage.setItem("fives", fives.value);
    window.localStorage.setItem("tens", tens.value);
    window.localStorage.setItem("twenties", twenties.value);
    window.localStorage.setItem("fifties", fifties.value);
    window.localStorage.setItem("hundreds", hundreds.value);
    window.localStorage.setItem("total", totalEle.innerHTML);
    console.log(localStorage);
}

$("load").onclick = e => {
    $("save").disabled = false;
    singles.value = window.localStorage.getItem("singles");
    fives.value = window.localStorage.getItem("fives");
    tens.value = window.localStorage.getItem("tens");
    twenties.value = window.localStorage.getItem("twenties");
    fifties.value = window.localStorage.getItem("fifties");
    hundreds.value = window.localStorage.getItem("hundreds");
    totalEle.innerHTML = window.localStorage.getItem("total");
    console.log(localStorage);
}

singles.onchange =  e => { $("save").disabled = true; }
fives.onchange =    e => { $("save").disabled = true; }
tens.onchange =     e => { $("save").disabled = true; }
twenties.onchange = e => { $("save").disabled = true; }
fifties.onchange =  e => { $("save").disabled = true; }
hundreds.onchange = e => { $("save").disabled = true; }