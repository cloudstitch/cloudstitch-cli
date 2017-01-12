
import { instance, Package } from "../package";

export default function buildHtml(pkg?: Package) {
  let config = pkg || instance;
  return `<!DOCTYPE html>
  <html lang="">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link rel="import" href="https://components.cloudstitch.com/cloudstitch-${config.get("variant")}.html">
      <script src="https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/0.7.23/webcomponents.min.js"></script>
    </head>
    <body>
      <cloudstitch-${config.get("variant")} user="${config.get("user")}" app="${config.get("app")}" templateUrl="/widget.html" styleUrl="/style.css" scriptUrl="/script.js"></cloudstitch-${config.get("variant")}>
    </body>
  </html>`;
};