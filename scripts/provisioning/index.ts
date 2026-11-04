import { pathToFileURL } from "node:url";
import { runProvisioning } from "./batch-provisioner";

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runProvisioning()
    .then(() => {
      console.log("✨ Processus de provisionnement global terminé avec succès.");
      process.exit(0);
    })
    .catch((error) => {
      console.error(`❌ Erreur critique de provisionnement : ${error.message}`);
      process.exitCode = 1;
    });
}