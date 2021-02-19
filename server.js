const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.get("/", function (req, res) {
  return res.send("Chatbot Funcionando 🤖🤖🤖");
});

app.use("/webhook", require("./contabilidad/weebhook"));

app.listen(3000, () => {
  console.log(`Escuchando peticiones por el puerto ${port}`);
});
