import pathPlanCoordinates from "./modules/pathPlanCoordinates.js";
import Stop from "./modules/Stop.js";
import Tram from "./modules/Tram.js";

window.initApp = async () => {
  //create map + roads
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 14,
    center: { lat: 43.71367037693727, lng: 7.273852351364134 },
  });

  const path = new google.maps.Polyline({
    path: pathPlanCoordinates,
    geodesic: true,
    strokeColor: "#FF0000",
    strokeOpacity: 1.0,
    strokeWeight: 2,
  });
  path.setMap(map);

  //functions
  function createStopsObjs() {
    return new Promise(async (resolve, reject) => {
      try {
        //create stop objects
        let stopsObjs = [];
        let promises = [];

        pathPlanCoordinates.forEach(async (element, index) => {
          if (element.stop) {
            let nextStopId = getNextStop(pathPlanCoordinates, index);
            let previousStopId = getPreviousStop(
              pathPlanCoordinates,
              element.stop.id
            );

            let stopObj = new Stop({
              id: element.stop.id,
              lat: element.lat,
              lng: element.lng,
              lineIds: element.lineIds,
              name: element.stop.name,
              nextStopId,
              previousStopId,
            });
            //store promise to get datas
            promises.push(stopObj.init());

            stopsObjs.push(stopObj);
          }
        });
        //get datas from backend and resolve
        await Promise.all(promises);
        resolve(stopsObjs);
      } catch (error) {
        reject(error);
      }
    });
  }

  function getNextStop(pathPlanCoordinates, index) {
    //browse the pathPlanCoordinates from given index
    for (const element of pathPlanCoordinates.slice(index + 1)) {
      if (element.stop) {
        return element.stop.id;
      }
    }
    return null;
  }

  function getPreviousStop(pathPlanCoordinates, fromStopId) {
    let reversed = pathPlanCoordinates.slice().reverse();

    let fromStop = reversed.find((e) => e.stop && e.stop.id === fromStopId);
    let index = reversed.indexOf(fromStop);

    //browse the reversed pathPlanCoordinates from given index
    for (const element of reversed.slice(index + 1)) {
      if (element.stop) {
        return element.stop.id;
      }
    }
    return null;
  }

  function createTramsObjs(stopsObjs, pathPlanCoordinates) {
    return new Promise((resolve, reject) => {
      try {
        //create tram objects
        let vehicleJourneyId = [];

        stopsObjs.forEach(async (stopObj) => {
          //get the vehicleJourneyId from stops obj and add to the array if not already exist
          stopObj.schedules.forEach((hour) => {
            if (!vehicleJourneyId.some((e) => e.id === hour.VehicleJourneyId)) {
              //create tram object
              let obj = new Tram({
                id: hour.VehicleJourneyId,
                lineId: hour.LineId,
                direction: hour.Direction,
                map,
                stops: stopsObjs,
                pathPlanCoordinates,
              });
              //lets go on the map !
              obj.init();
              vehicleJourneyId.push(obj);
            }
          });
        });
        resolve(vehicleJourneyId);
      } catch (error) {
        reject(error);
      }
    });
  }

  const stopsObjs = await createStopsObjs();
  createTramsObjs(stopsObjs, pathPlanCoordinates);
};
