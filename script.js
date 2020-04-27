'use strict'
import * as Utils from './utils.js';

const carouselName = document.getElementById('carousel-name');
const projectsButton = document.getElementById('view-projects-button');
const projectsHeader = document.getElementById('projects');

let scrollComplete = {
    "projectsHeader": false
};

projectsButton.onclick = (event => {
    if (scrollComplete["projectsHeader"]) return;
    Utils.ssWriteText(projectsHeader);
    scrollComplete["projectsHeader"] = true;
});

Utils.writeText(carouselName);