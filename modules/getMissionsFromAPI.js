function getSchedules(lineId, direction) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(
        `https://sleepy-crag-45946.herokuapp.com/https://api.lignesdazur.com/api/transport/v3/timetable/GetLineHours/json?LineId=${lineId}&Direction=${direction}`
      );
      const json = await response.json();
      console.debug("Reveided data from RLA API :");
      console.debug(json["Data"]);
      resolve(json);
    } catch (error) {
      reject(error);
    }
  });
}

function parseMissions(json, direction, missions = []) {
  json["Data"]["Hours"].forEach((element) => {
    //check if mission obj already exist
    let missionObj = missions.find((e) => e.id === element.VehicleJourneyId);
    if (missionObj) {
      //add the schedule to mission obj
      missionObj.roadMap.push({
        id: element.StopId,
        time: convertM2DT(
          element.TheoricArrivalTime ?? element.TheoricDepartureTime
        ),
      });
    } else {
      let obj = {
        id: element.VehicleJourneyId,
        direction,
        roadMap: [
          {
            id: element.StopId,
            time: convertM2DT(
              element.TheoricArrivalTime ?? element.TheoricDepartureTime
            ),
          },
        ],
      };
      missions.push(obj);
    }
  });
  return missions;
}

//this function convert minutes to dateTime object with minutes converted to hours
function convertM2DT(mins) {
  let h = Math.floor(mins / 60);
  let m = mins % 60;
  h = h < 10 ? "0" + h : h;
  m = m < 10 ? "0" + m : m;
  return new Date(new Date().setHours(h, m, 0, 0));
}

const PromiseMissionsD1 = getSchedules(1413, 1);
const PromiseMissionsD2 = getSchedules(1413, 2);

const [JSONmissionsD1, JSONmissionsD2] = await Promise.all([
  PromiseMissionsD1,
  PromiseMissionsD2,
]);

let missionsD1 = parseMissions(JSONmissionsD1, 1);
let missions = parseMissions(JSONmissionsD2, 2, missionsD1);

export default missions;
