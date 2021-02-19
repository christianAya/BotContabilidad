const express = require("express");
const router = express.Router();
const { WebhookClient, Suggestion } = require("dialogflow-fulfillment");

router.get("/", (req, res) => {
  res.json({ ok: true, msg: "Funcionando Weebhook" });
});

router.post("/", express.json(), function (req, res) {
  const agent = new WebhookClient({ request: req, response: res });
  //console.log("Dialogflow Request headers: " + JSON.stringify(req.headers));
  console.log("Dialogflow Request body: " + JSON.stringify(req.body));

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

    let movimiento;
    let producto;
    let cantidad;
    let valor;
    let proveedor;

    if (
      (movimiento =
        agent.parameters.movimiento || contexto.parameters.movimiento)
    ) {
      if (
        (producto = agent.parameters.producto || contexto.parameters.producto)
      ) {
        if (
          (cantidad = agent.parameters.cantidad || contexto.parameters.cantidad)
        ) {
          console.log("Parameters found: " + movimiento + " " + producto);

          agent.context.set({
            name: "compra",
            lifespan: 0,
            parameters: { movimiento, producto, cantidad, valor, proveedor },
          });
          //suggestion indica un cantidad de botones que permiten continuar con la conversación
          //Esta función está de ejemplo, muestra una serie de botones que permiten identificar
          //que todos los parámetros han sido introducidos
          adicion(agent, movimiento);
        }
      } else {
        if (producto == "") {
          console.log("Producto perdido, movimiento: " + movimiento);
        }
        agent.add("Que producto se " + movimiento + "?");
        agent.context.set({
          name: "compra",
          lifespan: 1,
          parameters: { movimiento, producto, cantidad, valor, proveedor },
        });
      }
    } else {
      if (movimiento == "") {
        producto = agent.parameters.producto || contexto.parameters.producto;
        console.log("Movimiento perdido, producto: " + producto);
      }
      agent.add("Que movimiento se hace sobre el/los " + producto + "?");
      agent.context.set({
        name: "compra",
        lifespan: 0,
        parameters: { movimiento, producto, cantidad, valor, proveedor },
      });
    }
  }

  function Producto(agent) {
    let contexto = agent.context.get("compra");
    console.log(contexto.parameters);
    console.log(contexto.lifespan);
    agent.add(
      `Respuesta del ingreso ` +
        contexto.parameters.movimiento +
        " " +
        contexto.parameters.producto +
        " " +
        contexto.parameters.cantidad
    );
  }

  function Cantidad(agent) {}

  function Valor(agent) {}

  function Proveedor(agent) {}

  // Run the proper function handler based on the matched Dialogflow intent name
  let intentMap = new Map();
  intentMap.set("Default Welcome Intent", welcome);
  intentMap.set("Default Fallback Intent", fallback);
  intentMap.set("Compra", Compra);
  intentMap.set("Producto", Producto);

  agent.handleRequest(intentMap);
});

function adicion(agent, movimiento) {
  agent.add("Tamaño" + movimiento);
  agent.add(new Suggestion("1"));
  agent.add(new Suggestion("2"));
  agent.add(new Suggestion("5"));
}

module.exports = router;
