'use strict'

/**
 * Returns random integer from 0 to max non-inclusive.
 * @param {Number} max Non-inclusive max in range
 */
export function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

/**
 * Returns random HEX number for color.
 */
export function getRandomColor() {
    const chars = "0123456789ABCDEF";
    let res = "#";
    for (let i = 0; i < 6; ++i) {
        res += chars[getRandomInt(16)];
    }
    return res;
}

/**
 * Checks if number is in between range.
 * @param {Number} x    Number to check
 * @param {Number} min  Lower bound
 * @param {Number} max  Upper bound
 */
export function between(x, min, max) {
    return x >= min && x <= max;
}

/**
 * Sleeps async function for set amount of time.
 * @param {Number} ms   Time in ms to sleep for
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Adds flickering '_' at end of string.
 * @param {Element} ele     Element to write to
 * @param {Number}  time    Interval between flickers (ms)
 */
export async function flicker(ele, time=500) {
    let content = ele.innerHTML;
    if (content[content.length - 1] === '_')
        content = content.substr(0 , content.length - 1);
    while (true) {
        ele.innerHTML = content + "&#10240;";
        await sleep(time);
        ele.innerHTML = content + "_";
        await sleep(time);
    }
}

/**
 * Writes text one character at a time in a set time inteval.
 * @param {Element} ele    Element to write text
 * @param {Number}  time   Interval between writing text (ms)
 */
export async function writeText(ele, time=100) {
    const content = ele.innerHTML;
    ele.innerHTML = "";
    let temp = "&#10240;"; // Blank space same size as underscore
    for (let char of content) {
        temp += char;
        ele.innerHTML = temp + '_';
        await sleep(time);
    }
    await flicker(ele);
}
// export async function writeText(ele, time=100) {
//     const content = ele.innerHTML;
//     ele.innerHTML = "&#10240;".repeat(content.length);
//     let temp = "";
//     for (let [i, char] of [...content].entries()) {
//         temp += char;
//         ele.innerHTML = temp + "&#10240;".repeat(content.length - i - 1) + '_';
//         await sleep(time);
//     }
//     await flicker(ele);
// }
/**
 * Waits a bit for smooth scroll to finish then writes text.
 * @param {Element} ele    Element to write text
 */
export async function ssWriteText(ele, time=500) {
    await sleep(time);
    writeText(ele);
}

