export const getRecommendations = async (data) => {
  try {

    const response = await fetch("/api/recommendations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    return result.recommendation;

  } catch (error) {

    console.error("Error obteniendo recomendaciones", error);
    return "No se pudo generar la recomendación.";

  }
};