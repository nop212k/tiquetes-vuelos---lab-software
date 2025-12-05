// frontend/src/components/CheckoutForm.tsx
import type { FC, FormEvent } from "react";
import { useState } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

interface CheckoutFormProps {
  checkoutData: {
    vueloId: number;
    numeroPasajeros: number;
    tipo: "reserva" | "compra";
  };
}

const CheckoutForm: FC<CheckoutFormProps> = ({ checkoutData }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setErrorMessage(null);

    try {
      // Confirmar el pago con Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        setErrorMessage(error.message || "Error procesando el pago");
        toast.error(error.message || "Error procesando el pago");
        setProcessing(false);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        // Pago exitoso, crear la reserva/compra en el backend
        const token = localStorage.getItem("token");

        if (checkoutData.tipo === "compra") {
          // Crear compra
          await axios.post(
            `${API_BASE}/api/reservas`,
            {
              vueloId: checkoutData.vueloId,
              tipo: "compra",
              numeroPasajeros: checkoutData.numeroPasajeros,
              paymentIntentId: paymentIntent.id,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } else {
          // Crear reserva (ya pagada)
          await axios.post(
            `${API_BASE}/api/reservas`,
            {
              vueloId: checkoutData.vueloId,
              tipo: "reserva",
              numeroPasajeros: checkoutData.numeroPasajeros,
              paymentIntentId: paymentIntent.id,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }

        toast.success(
          checkoutData.tipo === "reserva"
            ? "✅ Reserva creada exitosamente"
            : "✅ Compra realizada exitosamente"
        );

        // Redirigir al historial
        navigate("/historial");
      }
    } catch (err: any) {
      console.error("Error:", err);
      setErrorMessage(err.response?.data?.message || "Error al procesar la transacción");
      toast.error(err.response?.data?.message || "Error al procesar la transacción");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {errorMessage && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700 text-sm">{errorMessage}</p>
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          🔒 Tu información está protegida con encriptación de nivel bancario
        </p>
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold text-lg"
      >
        {processing
          ? "⏳ Procesando..."
          : checkoutData.tipo === "reserva"
          ? "💳 Pagar y Reservar"
          : "💳 Pagar y Comprar"}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Al hacer clic en el botón, aceptas los términos y condiciones
      </p>
    </form>
  );
};

export default CheckoutForm;
