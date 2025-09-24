import { Router } from "express";
import axios from "axios";

const router = Router();

/**
 * GET /api/ciudades?nombre=xxx&pais=XX
 * Devuelve hasta 100 ciudades que coincidan con el nombrePrefix
 */
router.get("/", async (req, res) => {
  try {
    const { nombre, pais, offset } = req.query;

    const response = await axios.get("https://wft-geo-db.p.rapidapi.com/v1/geo/cities", {
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY!,
        "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com"
      },
      params: {
        namePrefix: nombre || "",        // lo que el usuario escribe
        countryIds: pais || undefined,   // opcional, si quieres filtrar por país
        limit: 10,                      // máximo por llamada
        offset: Number(offset) || 0
      }
    });

    const ciudades = response.data.data.map((c: any) => ({
      id: c.id,
      nombre: c.city,
      region: c.region,
      pais: c.country
    }));

    res.json(ciudades);
  } catch (error) {
    console.error("Error cargando ciudades:", error);
    res.status(500).json({ message: "Error consultando ciudades" });
  }
});

export default router;
