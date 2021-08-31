export default class Tram {
  default = {
    id: null,
    lineId: null,
    direction: null,
    map: null,
    marker: null,
    stops: null,
    timeToStop: 30,
    timeToHide: 420,
    timeToShow: 30,
    currentStop: null,
    pathPlanCoordinates: null,
    realTime: null,
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

  async init() {
    if (this.direction === 2) {
      this.pathPlanCoordinates = this.pathPlanCoordinates.slice().reverse();
    }
    let start;

    //loop each stop and ask stop to know how tram needs to start
    for (const element of this.pathPlanCoordinates) {
      if (element.stop) {
        const stop = this.stops.find((e) => e.id === element.stop.id);
        let cross = stop.checkHours(this.id);
        this.realTime = cross.realTime;
        let hour = cross.time;
        if (hour) {
          start = {
            lat: element.lat,
            lng: element.lng,
            time: hour,
          };
          this.currentStop = stop;
          break;
        }
      }
    }

    if (start.time > new Date()) {
      //if tramway is planned in more than X second, wait before show this tram on the map
      if (
        start.time > new Date(new Date().getTime() + this.timeToHide * 1000)
      ) {
        const waitingTime = start.time - new Date() - this.timeToShow * 1000;
        console.debug(
          `Tram ${this.id} D ${this.direction} : Tram planned in more than ${
            this.timeToHide
          } seconds, waiting ${waitingTime / 1000} seconds before showing... `
        );
        await this.sleep(waitingTime);
      }

      //display the marker
      this.marker = new google.maps.Marker({
        position: start,
        map: this.map,
        title: `Tramway ${this.id} Position. RT : ${this.realTime}`,
      });

      this.go();
    } else {
      console.debug(
        `Tram ${this.id} D ${this.direction} : Tram planned in past. Didn't show ! `
      );
    }
  }

  async go() {
    //search the next stop depending direction of this tramway
    while (true) {
      let nextStopId;
      if (this.direction === 1) {
        nextStopId = this.currentStop.nextStopId;
      } else {
        nextStopId = this.currentStop.previousStopId;
      }
      if (nextStopId) {
        let nextStop = this.stops.find((e) => e.id === nextStopId);
        let cross = nextStop.checkHours(this.id);
        this.realTime = cross.realTime;
        let hour = cross.time;
        if (hour && hour > new Date()) {
          console.debug(
            `Tram ${this.id} D ${this.direction} : Aimed target time to next stop ${nextStop.name} : ` +
              hour
          );
          await this.moove(nextStop, hour);
          console.debug(
            `Tram ${this.id} D ${this.direction} : Tram on stop ${nextStop.name}... Waiting time ${this.timeToStop} seconds `
          );
          this.currentStop = nextStop;
          await this.sleep(this.timeToStop * 1000);
          console.debug(
            `Tram ${this.id} D ${this.direction} : Tram go to the next stop `
          );
        } else {
          //temporary terminus (degraded service)
          //TODO : check data received by api when degraded service
          console.debug(
            `Tram ${this.id} D ${this.direction} : Degraded terminus or next stop of this tram is less than actuel time... `
          );
          break;
        }
      } else {
        //terminus, no next stop available
        //TODO : remove marker and object
        console.debug(`Tram ${this.id} D ${this.direction} : End of line ! `);
        break;
      }
    }
  }

  async moove(dest, arrivalTime) {
    function calculateTravel(pathPlanCoordinates, currentStop, timeToStop) {
      const currentStopPlan = pathPlanCoordinates.find(
        (e) => e.stop && e.stop.id === currentStop.id
      );
      const currentStopPlanIndex = pathPlanCoordinates.indexOf(currentStopPlan);

      const nextStopPlan = pathPlanCoordinates.find(
        (e) => e.stop && e.stop.id === dest.id
      );
      const nextStopPlanIndex = pathPlanCoordinates.indexOf(nextStopPlan);

      //calculate the number of jumps to go to the next stop
      const polylineNumberOfJumps = nextStopPlanIndex - currentStopPlanIndex;

      //calculate the time diff between two stop in seconds
      const timeDiffBetweenTwoStop =
        (arrivalTime - new Date() - timeToStop * 1000) / 1000;

      //calculate the duration of travel
      const travelTime = Math.round(
        timeDiffBetweenTwoStop / polylineNumberOfJumps
      );

      return { currentStopPlanIndex, travelTime };
    }

    function goTo(dest, speed, marker) {
      return new Promise((resolve) => {
        //calculate the delta from the current position to the destination
        let deltaLat = (dest.lat - marker.position.lat()) / speed;
        let deltaLng = (dest.lng - marker.position.lng()) / speed;

        //moove the marker
        for (let i = 0; i < speed; i++) {
          setTimeout(() => {
            let lat = marker.position.lat();
            let lng = marker.position.lng();

            lat += deltaLat;
            lng += deltaLng;

            let latlng = new google.maps.LatLng(lat, lng);
            marker.setPosition(latlng);

            //if this is the last loop (destination), resolve request
            if (i === speed - 1) {
              resolve();
            }
          }, 1000 * i);
        }
      });
    }

    const travel = calculateTravel(
      this.pathPlanCoordinates,
      this.currentStop,
      this.timeToStop
    );

    console.debug(
      `Tram ${this.id} D ${this.direction} : Time travel : ${travel.travelTime} seconds`
    );

    for (const element of this.pathPlanCoordinates.slice(
      travel.currentStopPlanIndex + 1
    )) {
      await goTo(element, travel.travelTime, this.marker);
      if (element.stop) {
        break;
      }
    }

    return true;
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
