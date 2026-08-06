import { $ } from "./utils.js";

/**
 * Collega login e logout all'interfaccia.
 *
 * Le decisioni su cosa mostrare dopo l'accesso
 * rimangono in app.js e vengono ricevute come funzioni.
 */
export function setupAuth({
  getClients,
  onCoachLogin,
  onClientLogin,
  onLogout
}){
  $("loginBtn").onclick = () => {
    const role = $("loginRole").value;
    const code = $("loginCode").value.trim();

    if(role === "coach" && code === "coach123"){
      onCoachLogin();
      return;
    }

    if(role === "client"){
      const clients = getClients();

      const found = clients.find(client =>
        (client.code || "").toLowerCase() === code.toLowerCase()
      );

      if(found){
        onClientLogin(found);
        return;
      }
    }

    alert("Codice non valido");
  };

  $("logoutBtn").onclick = onLogout;
  $("sideLogout").onclick = onLogout;
  $("clientLogoutBtn").onclick = onLogout;
}