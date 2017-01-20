
import { instance, Package } from "../package";

export default function buildHtml(port: number, watch: boolean, pkg?: Package) {
  let config = pkg || instance,
      ELEM = '',
      script = '';
  if(watch) {
    script = `
    <script>
      (function() {
        document.addEventListener("DOMContentLoaded", function(event) { 
          var websocket = new WebSocket("ws://localhost:${port}/", "cloudstitch-livereload-protocol");
          websocket.onmessage = function() {
            websocket.close();
            window.location = "/";
          };
          websocket.onopen = function(event) {
            if(websocket.readyState === websocket.OPEN) {
              console.log("Socket Connection open");
              websocket.send("connected");
            } else {
              setTimeout(websocket.onopen, 250);
            }
          };
        });
      })();
    </script>
    `;
  }
  if(config.get("variant") === "polymer") {
    ELEM = `
      <cloudstitch-${config.get("variant")}
        user="${config.get("user")}"
        app="${config.get("app")}"
        componentUrl="/component"> <!-- TODO Implement this in the polmyer element -->
      </cloudstitch-${config.get("variant")}>
    `;
  } else {
    ELEM = `
      <cloudstitch-${config.get("variant")}
        user="${config.get("user")}"
        app="${config.get("app")}"
        file-domain="localhost:${port}">
      </cloudstitch-${config.get("variant")}>
    `;
  }
  return `<!DOCTYPE html>
  <html lang="">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link rel="import" href="https://components.cloudstitch.com/cloudstitch-${config.get("variant")}.html">
      <script src="https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/0.7.23/webcomponents.min.js"></script>
    </head>
    <body>
      ${ELEM}
    </body>
    ${script}
  </html>`;
};