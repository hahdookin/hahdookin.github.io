'use strict'
import * as utils from './utils.js';

const carouselName = document.getElementById('carousel-name');
const projectsButton = document.getElementById('view-projects-button');
const projectsHeader = document.getElementById('projects');

projectsButton.onclick = (event => {
    utils.ssWriteText(projectsHeader)
});

utils.writeText(carouselName);