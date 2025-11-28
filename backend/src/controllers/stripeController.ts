// backend/src/controllers/stripeController.ts
import { Request, Response } from "express";
import Stripe from "stripe";
import { AppDataSource } from "../config/data-source";
import { Vuelo } from "../models/vuelos";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

// Crear PaymentIntent para procesar el pago
export const crearPaymentIntent = async (req: Request, res: Response) => {
  try {
    const { vueloId, numeroPasajeros, tipo } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ message: "No autorizado" });
    }

    // Validar vuelo
    const vueloRepo = AppDataSource.getRepository(Vuelo);
    const vuelo = await vueloRepo.findOne({ where: { id: vueloId } });

    if (!vuelo) {
      return res.status(404).json({ message: "Vuelo no encontrado" });
    }

    if (vuelo.estado === "cancelado") {
      return res.status(400).json({ message: "Este vuelo está cancelado" });
    }

    // Calcular monto total (Stripe usa centavos)
    const precioTotal = Number(vuelo.costoBase) * (numeroPasajeros || 1);
    const montoCentavos = Math.round(precioTotal * 100); // Convertir a centavos

    // Crear PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: montoCentavos,
      currency: "cop", // Pesos colombianos
      metadata: {
        userId: userId.toString(),
        vueloId: vueloId.toString(),
        numeroPasajeros: (numeroPasajeros || 1).toString(),
        tipo: tipo || "compra",
      },
      description: `${tipo === "reserva" ? "Reserva" : "Compra"} - Vuelo ${vuelo.origen} → ${vuelo.destino}`,
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      precioTotal,
      vuelo: {
        origen: vuelo.origen,
        destino: vuelo.destino,
        codigo: vuelo.codigoVuelo,
      },
    });
  } catch (error: any) {
    console.error("Error creando PaymentIntent:", error);
    res.status(500).json({ 
      message: "Error procesando el pago", 
      error: error.message 
    });
  }
};

// Verificar estado del pago
export const verificarPago = async (req: Request, res: Response) => {
  try {
    const { paymentIntentId } = req.params;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    res.json({
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      metadata: paymentIntent.metadata,
    });
  } catch (error: any) {
    console.error("Error verificando pago:", error);
    res.status(500).json({ 
      message: "Error verificando el pago", 
      error: error.message 
    });
  }
};