
import { instance, Package } from "../package";

export default function buildComponent(style: string, script: string, template: string, pkg?: Package) {
  let config = pkg || instance;
  const ELEM = `cloudstitch-${config.get("user")}-${config.get("app")}`;
  return `<dom-module id="${ELEM}">
  <style is="custom-style">
  :host {
    display: block;
  }
  ${style}
  </style>
  <template>${template}</template>
  <script>
    var module = {};
    var opts = ${script};
    opts.is = "${ELEM}";
    Polymer(opts);
  </script>
</dom-module>`;
};