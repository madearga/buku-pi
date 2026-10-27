import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
  pi.registerCommand("bluebook-tools", {
    description: "Menampilkan nama Tool yang langsung diberikan ke model",
    handler: async (_args, ctx) => {
      ctx.ui.notify(pi.getActiveTools().sort().join(", "), "info");
    },
  });
}
