class EventBus {
  constructor() {
    this.listeners = {};
    console.log("EwentBus started...")
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  async emit(eventName, data) {
    if (!this.listeners[eventName]) return;

    const callbacks = [...this.listeners[eventName]]; // pobiera wszytkie callbacki podpiete
    for (const callback of callbacks) {
      // bo foreach nie dziala z await. nie poczeka!
      try {
        const result = callback(data);
        if (result instanceof Promise) await result;
      } catch (err) {
        console.error(`[EventBus] Błąd w listenerze "${eventName}":`, err);
      }
    }
  }
  off(eventName, callback) {
    if (!this.listeners[eventName]) return;

    if (!callback) {
      // jeśli nie podano callbacka → usuń wszystkie dla tego eventu
      delete this.listeners[eventName];
    } else {
      // usuń tylko wskazany callback
      this.listeners[eventName] = this.listeners[eventName].filter((fn) => fn !== callback); //przefiltryj wszystkie oprocz tychz eventem

      // jeśli po filtracji tablica pusta — usuń klucz całkiem
      if (this.listeners[eventName].length === 0) {
        delete this.listeners[eventName];
      }
    }
  }
  once(eventName, callback) {
    const wrapper = (data) => {
      callback(data); // wykonaj właściwy callback
      this.off(eventName, wrapper); // usuń po pierwszym wywołaniu
    };
  }
}
export const eventBus = new EventBus();







/* class Player {
  constructor(x, y, height, width) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.status = "plaing";
    Bus.once("hello", () => console.log("Tylko raz!"));
    Bus.emit("hello");
    Bus.emit("hello");
  }

  move(x, y) {
    this.x = x;
    this.y = y;
    Bus.emit("player:changePosition", { x: this.x, y: this.y });
  }
  setStatus(newStatus) {
    const oldStatus = this.status;
    this.status = newStatus;
    Bus.emit("player:changeStatus", { oldStatus: oldStatus, newStatus: this.status });
  }
}
class Hud {
constructor(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.playerPosition = { x: 0, y: 0 };

  this.onPlayerPositionChange = function (args) {
    //throw new Error("Nie mogę zaktualizować zmiany pozycji!");
    this.playerPosition.x = args.x;
    this.playerPosition.y = args.y;
    this.draw();
  };

  this.onChangeStatus = function (args) {
    return new Promise((reslove, reject) => {
      setTimeout(() => {
        //reject("Nie mogę zaktualizować statusu!");
        reslove(console.log("Change Status: " + args.oldStatus + " zmieniono na " + args.newStatus));
      }, 2000);
    });
    //throw new Error("Nie mogę zaktualizować statusu!");
  };
}

draw() {
  console.log(`Wywołano zdarzenie: Player position x: ${this.playerPosition.x} position y: ${this.playerPosition.y}`);
}
}


const Gracz = new Player(10, 50, 50, 60);
const hud = new Hud(12, 12, 34, 56);
Bus.on("player:changeStatus", hud.onChangeStatus.bind(hud));
Bus.on("player:changePosition", hud.onPlayerPositionChange.bind(hud));

Gracz.move(33, 33);
Gracz.setStatus("die");*/
