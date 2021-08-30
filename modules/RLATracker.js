export default class RLATracker {
  default = {
    map: null,
    pathPlanCoordinatesD1: null,
    pathPlanCoordinatesD2: null,
    trams: null,
    timeToStop: 30,
    timeToShow: 30,
    timeToHide: 420,
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
    //draw the road
    const path = new google.maps.Polyline({
      path: this.pathPlanCoordinatesD1,
      geodesic: true,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 2,
    });
    path.setMap(this.map);

    this.trams.forEach((tram) => {
      if (tram.direction === 1) {
        this.makeMission(tram, this.pathPlanCoordinatesD1);
      } else {
        this.makeMission(tram, this.pathPlanCoordinatesD2);
      }
    });
  }

  async makeMission(tram, pathPlanCoordinates) {
    let marker = null;
    for (const [index, el] of tram.roadMap.entries()) {
      console.debug(
        `Tram ${tram.id} : Current aimed schedule is passing for direction ${tram.direction} : `
      );
      console.debug(el);
      //if this roadmap element is now or in future
      if (el.time >= new Date()) {
        console.debug(
          `Tram ${tram.id} : Time control passed, this schedule is now or in future`
        );
        if (
          el.time >
          new Date().setTime(new Date().getTime() + this.timeToHide * 1000)
        ) {
          const waitingTime = el.time - new Date() - this.timeToShow * 1000;
          console.debug(
            `Tram ${tram.id} : This tramway is planned in more than ${
              this.timeToHide
            } seconds, waiting ${waitingTime / 1000} seconds before showing`
          );
          //show the marker after the timeToShow delay
          await this.sleep(waitingTime);
        }
        const currentStop = pathPlanCoordinates.find(
          (plan) => plan.stop && plan.stop.id === el.id
        );

        if (!marker) {
          marker = new google.maps.Marker({
            position: currentStop,
            map: this.map,
            title: `Tramway ${tram.id} Position`,
          });
        }

        // get the index of the current stop in the map polyline plan
        const currentStopIndex = pathPlanCoordinates.indexOf(currentStop);

        const nextRoadMap = tram.roadMap[index + 1];

        console.debug(
          `Tram ${tram.id} : The next stop on the roadmap mission is : `
        );
        console.debug(nextRoadMap);

        if (nextRoadMap) {
          //get the index of the next stop on the map polyline plan
          const nextStopIndex = pathPlanCoordinates.findIndex(
            (plan) => plan.stop && plan.stop.id === nextRoadMap.id
          );

          //calculate the number of jumps to go to the next stop
          const polylineNumberOfJumps = nextStopIndex - currentStopIndex;
          console.debug(
            `Tram ${tram.id} : There is ${polylineNumberOfJumps} jumps before to go to the next stop`
          );

          //calculate the time diff between two stop in seconds
          let timeDiffBetweenTwoStop =
            (nextRoadMap.time - new Date() - this.timeToStop * 1000) / 1000;
          console.debug(
            `Tram ${tram.id} : The tram needs to be on its next stop in : ${timeDiffBetweenTwoStop} minutes with ${this.timeToStop} seconds of stop time subtracted`
          );

          //calculate the duration of travel
          const travelTime = Math.round(
            timeDiffBetweenTwoStop / polylineNumberOfJumps
          );
          console.debug(
            `Tram ${tram.id} : The travel time by jumps (ROUNDED) need to be ${travelTime} seconds by jump`
          );

          await this.goToNextStopFrom(
            currentStopIndex,
            pathPlanCoordinates,
            marker,
            travelTime
          );

          console.debug(
            `Tram ${tram.id} : Waiting ${this.timeToStop} on stop...`
          );

          await this.sleep(this.timeToStop * 1000);
        } else {
          console.log(`Tram ${tram.id} : Mission finised !`);
        }
      }
    }
  }

  async goToNextStopFrom(
    currentStopIndex,
    pathPlanCoordinates,
    marker,
    travelTime
  ) {
    for (const polylinePoint of pathPlanCoordinates) {
      //go to the next polyline point
      if (pathPlanCoordinates.indexOf(polylinePoint) > currentStopIndex) {
        //if the next jump is a stop
        if (polylinePoint.stop) {
          await this.animateMarker(marker, polylinePoint, travelTime);
          console.debug("The tram is on station : " + polylinePoint.stop.name);
          break;
        }
        await this.animateMarker(marker, polylinePoint, travelTime);
      }
    }
  }

  animateMarker(marker, dest, speed) {
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

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
