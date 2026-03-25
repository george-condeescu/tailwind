import NodeCache from 'node-cache';

const myCache = new NodeCache({
  stdTTL: 300, // Cache expiră după 5 minute (300 secunde)
  checkperiod: 120, // Verifică expirarea cache-ului la fiecare 2 minute (120 secunde)
  useClones: false, // Dezactivează clonarea obiectelor pentru performanță mai bună
});

const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    const key = '__cache__' + req.originalUrl;
    const cachedBody = myCache.get(key);

    if (cachedBody) {
      return res.json(cachedBody);
    }
    // Salvăm referința originală a metodei .json
    const originalJson = res.json;

    // Rescriem metoda .json pentru acest request specific
    res.json = function (body) {
      // Salvăm datele în cache înainte de a trimite răspunsul
      // (Opțional: verificăm dacă statusul e 200 pentru a nu cacha erori)
      if (res.statusCode === 200) {
        myCache.set(key, body, duration);
      }

      // Apelăm metoda originală pentru a trimite datele la client
      return originalJson.call(this, body);
    };

    next();
  };
};

export { cacheMiddleware, myCache };
