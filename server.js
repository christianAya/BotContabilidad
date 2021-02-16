const express = require("express");
const { WebhookClient, Suggestion } = require("dialogflow-fulfillment");
const app = express();
const port = process.env.PORT || 3000;

app.get("/", function (req, res) {
  res.send("Hello Webhook");
});

app.post("/webhook", express.json(), function (req, res) {
  const agent = new WebhookClient({ request: req, response: res });
  //console.log("Dialogflow Request headers: " + JSON.stringify(req.headers));
  //console.log("Dialogflow Request body: " + JSON.stringify(req.body));
  let parametros = JSON.stringify(req.body.queryResult.parameters);
  console.log(parametros);

  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }

  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }

  function Compra(agent) {
    console.log("Iniciando funcion de compra");
    let contexto = agent.context.get("compra");
    console.log(contexto.parameters);
    var movimiento;
    var producto;
    if (
      (movimiento = agent.parameters.movCompra || contexto.parameters.movCompra)
    ) {
      if (
        (producto = agent.parameters.producto || contexto.parameters.producto)
      ) {
        if (movimiento) {
          console.log("Parameters found: " + movimiento + producto);
        }
        agent.context.set({
          name: "compra",
          lifespan: 5,
          parameters: { movCompra: movimiento, producto: producto },
        });
        agent.add("Tamaño" + movimiento);
        agent.add(new Suggestion("1"));
        agent.add(new Suggestion("2"));
        agent.add(new Suggestion("5"));
      } else {
        if (producto == "") {
          console.log("Producto perdido, movimiento: " + movimiento);
        }
        agent.add("Que producto se " + movimiento + "?");
        agent.context.set({
          name: "compra",
          lifespan: 5,
          parameters: { movCompra: movimiento, producto: producto },
        });
      }
    } else {
      if (movimiento == "") {
        console.log("Movimiento perdido, producto: " + producto);
      }
      agent.add("Que movimiento se hace sobre el/los" + producto + "?");
      agent.context.set({
        name: "compra",
        lifespan: 5,
        parameters: { movCompra: movimiento, producto: producto },
      });
    }
  }

  function Producto(agent) {
    let contexto = agent.context.get("compra");
    console.log(contexto.parameters);
    agent.add(
      `Respuesta del ingreso ` +
        contexto.parameters.movCompra +
        " " +
        contexto.parameters.producto
    );
  }
  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set("Default Welcome Intent", welcome);
  intentMap.set("Default Fallback Intent", fallback);
  intentMap.set("Compra", Compra);
  intentMap.set("Producto", Producto);

  agent.handleRequest(intentMap);
});

app.listen(3000, () => {
  console.log(`Escuchando peticiones por el puerto ${port}`);
});
