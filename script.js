import RLATracker from "./modules/RLATracker.js";
import {
  pathPlanCoordinatesD1,
  pathPlanCoordinatesD2,
} from "./modules/pathPlanCoordinates.js";
import missions from "./modules/getMissionsFromAPI.js";
// import missions from "./modules/SEED_getMissionsFromAPI.js"

window.initApp = () => {
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 14,
    center: { lat: 43.71367037693727, lng: 7.273852351364134 },
  });

  new RLATracker({
    pathPlanCoordinatesD1,
    pathPlanCoordinatesD2,
    trams: missions,
    map,
  }).init();
};
