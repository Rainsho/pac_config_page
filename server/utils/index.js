const { db } = require('../constants');

function now(str = true) {
  const t = new Date();

  if (str) return t.toLocaleString();

  return { s: t.toLocaleString(), t: t.getTime() };
}

function syncQueue(id, info = {}, purge = false) {
  if (!id) return (db.queue = []);

  if (!db.queue) db.queue = [];

  if (purge) {
    db.queue = db.queue.filter(x => x.id !== id);
  } else {
    const old = db.queue.find(x => x.id === id);

    if (!old) {
      db.queue.push(Object.assign({ id }, info));
    } else {
      db.queue = db.queue.map(x => (x.id !== id ? x : Object.assign(old, info)));
    }
  }

  return db.queue;
}

module.exports = { now, syncQueue };
