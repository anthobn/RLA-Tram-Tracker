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
        this.schedules = await this.getHoursFromApi();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  async getSchedulesFromApi(stopId, maxItems) {
    const response = await fetch(
      `https://api.rla2.cityway.fr/api/transport/v3/timetable/GetNextStopHours/json?LogicalStopIds=${stopId}&MaxItemsByStop=${maxItems}`
    );
    const json = await response.json();
    //log
    console.debug(`Reveided data from RLA API for ${this.name} :`);
    console.debug(json["Data"]);

    return json;
  }

  async getHoursFromApi() {
    const schedules = await this.getSchedulesFromApi(this.id, this.maxItems);

    let hours = [];

    //sort all schedules and get only schedule regarding the lines given in lineIds
    this.lineIds.forEach((lineId) => {
      schedules["Data"]["Hours"].forEach((el) => {
        if (el.LineId === lineId) {
          //find the direction of this VehicleJourneys
          const vehicleJourneyId = el.VehicleJourneyId;
          const vehicleJourney = schedules["Data"]["VehicleJourneys"].find(
            (e) => e.Id === vehicleJourneyId
          );

          //add realTime and Time attribute to object for future treatments
          //by default, suggest hour in realTime traffic
          let hour = { ...el };
          hour.realTime = true;

          //get the time
          let time = el.PredictedArrivalTime ?? el.PredictedDepartureTime;

          //if there is not predicted time, pass theorical time
          if (!time) {
            hour.realTime = false;
            time = el.TheoricArrivalTime ?? el.TheoricDepartureTime;
          }

          //convert hour to DT
          hour.time = this.convertM2DT(time);

          //add tomorrow if date if less than current time
          /* if (hour.time && hour.time < new Date()) {
            hour.time = this.addDaysToDT(hour.time, 1);
          } */

          //create hour object
          let obj = {
            ...hour,
            VehicleJourneyId:
              vehicleJourneyId + "D" + vehicleJourney.JourneyDirection, //add destination to JourneyId
            Direction: vehicleJourney.JourneyDirection,
          };

          hours.push(obj);
        }
      });
    });

    return hours;
  }

  async checkHours(vehicleJourneyId, init = true) {
    //if this is not the first call of this function, call api to refresh data
    if (!init) {
      console.debug(
        `Stop ${this.name} : Tram ${vehicleJourneyId} init a refresh data on this stop. Call API...`
      );
      this.schedules = await this.getHoursFromApi();
    }

    let element = this.schedules.find(
      (e) => e.VehicleJourneyId === vehicleJourneyId
    );

    return element ?? false;
  }

  //this method convert minutes to dateTime object with minutes converted to hours
  convertM2DT(mins) {
    if (!mins) {
      return null;
    }

    let h = Math.floor(mins / 60);
    let m = mins % 60;
    h = h < 10 ? "0" + h : h;
    m = m < 10 ? "0" + m : m;
    return new Date(new Date().setHours(h, m, 0, 0));
  }

  addDaysToDT(date, days) {
    date.setDate(date.getDate() + days);
    return date;
  }
}
