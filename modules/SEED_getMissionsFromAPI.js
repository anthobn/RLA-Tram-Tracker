Date.prototype.addSeconds = function (s) {
  this.setSeconds(this.getSeconds() + s);
  return this;
};

const now1 = new Date();
const now2 = new Date();
const now3 = new Date();

const trams = [
  {
    id: 1,
    direction: 1,
    roadMap: [
      { id: 1, time: new Date(now1.addSeconds(15)) },
      { id: 2, time: new Date(now1.addSeconds(15)) },
      { id: 3, time: new Date(now1.addSeconds(15)) },
      { id: 4, time: new Date(now1.addSeconds(15)) },
      { id: 5, time: new Date(now1.addSeconds(15)) },
      { id: 6, time: new Date(now1.addSeconds(15)) },
      { id: 7, time: new Date(now1.addSeconds(15)) },
      { id: 8, time: new Date(now1.addSeconds(15)) },
      { id: 9, time: new Date(now1.addSeconds(15)) },
      { id: 10, time: new Date(now1.addSeconds(15)) },
      { id: 11, time: new Date(now1.addSeconds(15)) },
      { id: 12, time: new Date(now1.addSeconds(15)) },
      { id: 13, time: new Date(now1.addSeconds(15)) },
      { id: 14, time: new Date(now1.addSeconds(15)) },
      { id: 15, time: new Date(now1.addSeconds(15)) },
      { id: 16, time: new Date(now1.addSeconds(15)) },
      { id: 17, time: new Date(now1.addSeconds(15)) },
      { id: 18, time: new Date(now1.addSeconds(15)) },
      { id: 19, time: new Date(now1.addSeconds(15)) },
      { id: 20, time: new Date(now1.addSeconds(15)) },
      { id: 21, time: new Date(now1.addSeconds(15)) },
      { id: 22, time: new Date(now1.addSeconds(15)) },
    ],
  },
  {
    id: 2,
    direction: 1,
    roadMap: [
      { id: 1, time: new Date(now2.addSeconds(30)) },
      { id: 2, time: new Date(now2.addSeconds(30)) },
      { id: 3, time: new Date(now2.addSeconds(30)) },
      { id: 4, time: new Date(now2.addSeconds(30)) },
      { id: 5, time: new Date(now2.addSeconds(30)) },
      { id: 6, time: new Date(now2.addSeconds(30)) },
      { id: 7, time: new Date(now2.addSeconds(30)) },
      { id: 8, time: new Date(now2.addSeconds(30)) },
      { id: 9, time: new Date(now2.addSeconds(30)) },
      { id: 10, time: new Date(now2.addSeconds(30)) },
      { id: 11, time: new Date(now2.addSeconds(30)) },
      { id: 12, time: new Date(now2.addSeconds(30)) },
      { id: 13, time: new Date(now2.addSeconds(30)) },
      { id: 14, time: new Date(now2.addSeconds(30)) },
      { id: 15, time: new Date(now2.addSeconds(30)) },
      { id: 16, time: new Date(now2.addSeconds(30)) },
      { id: 17, time: new Date(now2.addSeconds(30)) },
      { id: 18, time: new Date(now2.addSeconds(30)) },
      { id: 19, time: new Date(now2.addSeconds(30)) },
      { id: 20, time: new Date(now2.addSeconds(30)) },
      { id: 21, time: new Date(now2.addSeconds(30)) },
      { id: 22, time: new Date(now2.addSeconds(30)) },
    ],
  },
  {
    id: 3,
    direction: 2,
    roadMap: [
      { id: 22, time: new Date(now3.addSeconds(30)) },
      { id: 21, time: new Date(now3.addSeconds(30)) },
      { id: 20, time: new Date(now3.addSeconds(30)) },
      { id: 19, time: new Date(now3.addSeconds(30)) },
      { id: 18, time: new Date(now3.addSeconds(30)) },
      { id: 17, time: new Date(now3.addSeconds(30)) },
      { id: 16, time: new Date(now3.addSeconds(30)) },
      { id: 15, time: new Date(now3.addSeconds(30)) },
      { id: 14, time: new Date(now3.addSeconds(30)) },
      { id: 13, time: new Date(now3.addSeconds(30)) },
      { id: 12, time: new Date(now3.addSeconds(30)) },
      { id: 11, time: new Date(now3.addSeconds(30)) },
      { id: 10, time: new Date(now3.addSeconds(30)) },
      { id: 9, time: new Date(now3.addSeconds(30)) },
      { id: 8, time: new Date(now3.addSeconds(30)) },
      { id: 7, time: new Date(now3.addSeconds(30)) },
      { id: 6, time: new Date(now3.addSeconds(30)) },
      { id: 5, time: new Date(now3.addSeconds(30)) },
      { id: 4, time: new Date(now3.addSeconds(30)) },
      { id: 3, time: new Date(now3.addSeconds(30)) },
      { id: 2, time: new Date(now3.addSeconds(30)) },
      { id: 1, time: new Date(now3.addSeconds(30)) },
    ],
  },
  {
    id: 3,
    direction: 2,
    roadMap: [
      { id: 22, time: new Date(now3.addSeconds(15)) },
      { id: 21, time: new Date(now3.addSeconds(15)) },
      { id: 20, time: new Date(now3.addSeconds(15)) },
      { id: 19, time: new Date(now3.addSeconds(15)) },
      { id: 18, time: new Date(now3.addSeconds(15)) },
      { id: 17, time: new Date(now3.addSeconds(15)) },
      { id: 16, time: new Date(now3.addSeconds(15)) },
      { id: 15, time: new Date(now3.addSeconds(15)) },
      { id: 14, time: new Date(now3.addSeconds(15)) },
      { id: 13, time: new Date(now3.addSeconds(15)) },
      { id: 12, time: new Date(now3.addSeconds(15)) },
      { id: 11, time: new Date(now3.addSeconds(15)) },
      { id: 10, time: new Date(now3.addSeconds(15)) },
      { id: 9, time: new Date(now3.addSeconds(15)) },
      { id: 8, time: new Date(now3.addSeconds(15)) },
      { id: 7, time: new Date(now3.addSeconds(15)) },
      { id: 6, time: new Date(now3.addSeconds(15)) },
      { id: 5, time: new Date(now3.addSeconds(15)) },
      { id: 4, time: new Date(now3.addSeconds(15)) },
      { id: 3, time: new Date(now3.addSeconds(15)) },
      { id: 2, time: new Date(now3.addSeconds(15)) },
      { id: 1, time: new Date(now3.addSeconds(15)) },
    ],
  },
];

export default trams;