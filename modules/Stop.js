export default class Stop {
  default = {
    id: null,
    lat: null,
    lng: null,
    lineIds: null,
    name: null,
    schedules: null,
    maxItems: 8,
    nextStopId: null,
    previousStopId: null,
  };

  constructor(settings) {
    //apply personnal settings in property of this object unless personnal settings is not defined
    for (const [key, value] of Object.entries(this.default)) {
      if (settings && Object.hasOwnProperty.call(settings, key)) {
        this[key] = settings[key];
      } else {
        this[key] = value;
      }
    }
  }

  init() {
    return new Promise(async (resolve, reject) => {
      try {
        //get all schedules times
        let schedules = await this.getSchedulesFromApi(this.id, this.maxItems);

        let hours = [];

        //sort all schedules and get only schedule regarding the lines given in lineIds
        this.lineIds.forEach((lineId) => {
          schedules["Data"]["Hours"].forEach((hour) => {
            if (hour.LineId === lineId) {
              //find the direction of this VehicleJourneys
              const vehicleJourneyId = hour.VehicleJourneyId;
              const vehicleJourney = schedules["Data"]["VehicleJourneys"].find(
                (e) => e.Id === vehicleJourneyId
              );

              //create hour object
              let obj = {
                ...hour,
                Direction: vehicleJourney.JourneyDirection,
              };

              hours.push(obj);
            }
          });
        });

        this.schedules = hours;
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  async getSchedulesFromApi(stopId, maxItems) {
    const response = await fetch(
      `https://sleepy-crag-45946.herokuapp.com/https://api.lignesdazur.com/api/transport/v3/timetable/GetNextStopHours/json?LogicalStopIds=${stopId}&MaxItemsByStop=${maxItems}`
    );
    const json = await response.json();
    //log
    console.debug("Reveided data from RLA API :");
    console.debug(json["Data"]);

    return json;
  }

  checkHours(vehicleJourneyId) {
    let obj = {
      time: false,
      realTime: true,
    };
    let element;
    if (
      (element = this.schedules.find(
        (e) => e.VehicleJourneyId === vehicleJourneyId
      ))
    ) {
      //get the time
      let time = element.PredictedArrivalTime ?? element.PredictedDepartureTime;
      //if there is not predicted time, pass theorical time
      if (!time) {
        obj.realTime = false;
        time = element.TheoricArrivalTime ?? element.TheoricDepartureTime;
      }
      obj.time = this.convertM2DT(time);
    }
    return obj;
  }

  //this method convert minutes to dateTime object with minutes converted to hours
  convertM2DT(mins) {
    let h = Math.floor(mins / 60);
    let m = mins % 60;
    h = h < 10 ? "0" + h : h;
    m = m < 10 ? "0" + m : m;
    return new Date(new Date().setHours(h, m, 0, 0));
  }
}
