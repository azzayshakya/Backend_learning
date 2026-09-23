const dns = require("dns");

dns.resolveSrv("_mongodb._tcp.cluster0.agfg3rb.mongodb.net", (err, records) => {
  console.log("Error:", err);
  console.log("Records:", records);
});
