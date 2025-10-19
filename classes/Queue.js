
export class Queue {
  constructor() {
    this.queue = [];
  }
  add(fun) {
    this.queue.push(fun);
  }
  async run() {
    console.clear();
    for (const [i, f] of this.queue.entries()) {
      try {
        console.log("Zaczynamy...");
        const t = promisify(f);
        const res = await t();
        console.log(res);
      } catch (error) {
        console.log("Error: " + error);
      }
    }
    console.log("Konczymy...");
  }
}
/*function fun1(param, callback) {
  callback(null, "fun1 param: " + param);
}
function fun2(param, callback) {
  callback(null, "fun2 param: " + param);
}
const q = new Queue();
q.add(fun1.bind(null, "Pierwszy"));
q.add(fun2.bind(null, "Drugi"));

q.run();*/

/*function promisify(fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  };
}

function isPromise(obj) {
  return !!obj && typeof obj.then === "function" && typeof obj.catch === "function";
}

async function handleMaybePromise(fn) {
  const result = fn();
  if (isPromise(result)) return await result;
  return result;
}

class Queue {
  constructor() {
    this.queue = [];
  }
  add(fun) {
    this.queue.push(fun);
  }
  async run() {
    console.clear();
    for (const [i, f] of this.queue.entries()) {
      try {
        console.log(`▶️ Zadanie ${i + 1}...`);

        // jeśli funkcja ma 2 argumenty (param + callback), to używamy promisify
        const res =
          f.length >= 2
            ? await promisify(f.bind(null, "param"))()
            : await handleMaybePromise(f);

        console.log("✅", res);
      } catch (error) {
        console.log("❌ Error:", error);
      }
    }
    console.log("🏁 Koniec kolejki.");
  }
}
*/
