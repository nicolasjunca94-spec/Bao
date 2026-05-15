const API_URL = "https://function-bao-ccb0avh5f0dnaka0.centralus-01.azurewebsites.net/api";

export const login = async (tipo, numero) => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      tipo_identificacion: tipo,
      numero_identificacion: numero
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.mensaje);
  }

  return data;
};