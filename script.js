'use strict'

/**
 * Sleeps function for set amount of time.
 * @param {number} ms   Time in ms to sleep for
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Adds flickering '_' at end of string.
 * @param {Element} ele     Element to write to
 * @param {number}  time    Interval between flickers (ms)
 */
async function flicker(ele, time=500) {
    let content = ele.innerHTML;
    if (content[content.length - 1] === '_') content = content.substr(0 , content.length - 1);
    while (true) {
        ele.innerHTML = content + "&#8199;";
        await sleep(time);
        ele.innerHTML = content + "_";
        await sleep(time);
    }
}

/**
 * Writes text one character at a time in a set time inteval.
 * @param {Element} ele    Element to write text
 * @param {number}  time   Interval between writing text (ms)
 */
async function writeText(ele, time=100) {
    let content = ele.innerHTML;
    ele.innerHTML = "";
    let temp = "";
    for (let i = 0; i < content.length; i++) {
        temp += content[i];
        ele.innerHTML = temp + '_';
        await sleep(time);
    }
    await flicker(ele);
}

/**
 * Waits a bit for smooth scroll to finish then writes text.
 * @param {Element} ele    Element to write text
 */
async function ssWriteText(ele) {
    if (scrollComplete) return;
    scrollComplete = true;
    await sleep(500);
    writeText(ele);
}

// GLOBALS
let scrollComplete = false;

// Name on carousel
const carouselName = document.getElementById('carousel-name');
const projectsHeader = document.getElementById('projects');

writeText(carouselName);