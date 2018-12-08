function now(str = true) {
  const t = new Date();

  if (str) return t.toLocaleString();

  return { s: t.toLocaleString(), t: t.getTime() };
}

module.exports = { now };
