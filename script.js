'use strict'
import * as Utils from './utils.js';

const carouselName = document.getElementById('carousel-name');
const projectsButton = document.getElementById('view-projects-button');
const projectsHeader = document.getElementById('projects');

projectsButton.onclick = (event => {
    Utils.ssWriteText(projectsHeader)
});

Utils.writeText(carouselName);