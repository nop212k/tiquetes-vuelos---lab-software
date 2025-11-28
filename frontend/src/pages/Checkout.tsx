// frontend/src/pages/Checkout.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import NavbarCliente from "../components/cliente/NavbarCliente";
import Footer from "../components/Footer";
import CheckoutForm from "../components/CheckoutForm";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || "");

interface CheckoutData {
  vueloId: number;
  numeroPasajeros: number;
  tipo: "reserva" | "compra";
  vuelo: {
    origen: string;
    destino: string;
    codigo: string;
    precio: number;
  };
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const checkoutData = location.state as CheckoutData;

  const [clientSecret, setClientSecret] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!checkoutData) {
      navigate("/cliente");
      return;
    }

    const crearPaymentIntent = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await axios.post(
          `${API_BASE}/api/stripe/create-payment-intent`,
          {
            vueloId: checkoutData.vueloId,
            numeroPasajeros: checkoutData.numeroPasajeros,
            tipo: checkoutData.tipo,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setClientSecret(res.data.clientSecret);
      } catch (err: any) {
        console.error("Error creando PaymentIntent:", err);
        setError(err.response?.data?.message || "Error al iniciar el proceso de pago");
      } finally {
        setLoading(false);
      }
    };

    crearPaymentIntent();
  }, [checkoutData, navigate]);

  if (!checkoutData) {
    return null;
  }

  const precioTotal = checkoutData.vuelo.precio * checkoutData.numeroPasajeros;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavbarCliente />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-700 flex items-center gap-2"
          >
            ← Volver
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Resumen del vuelo */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {checkoutData.tipo === "reserva" ? "📌 Resumen de Reserva" : "💳 Resumen de Compra"}
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Vuelo</p>
                <p className="text-lg font-semibold text-gray-900">
                  {checkoutData.vuelo.origen} → {checkoutData.vuelo.destino}
                </p>
                <p className="text-sm text-gray-600">{checkoutData.vuelo.codigo}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Pasajeros</p>
                <p className="text-lg font-semibold text-gray-900">
                  {checkoutData.numeroPasajeros}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Precio por pasajero</p>
                <p className="text-lg font-semibold text-gray-900">
                  ${checkoutData.vuelo.precio.toLocaleString("es-CO")} COP
                </p>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-500">Total a pagar</p>
                <p className="text-3xl font-bold text-blue-600">
                  ${precioTotal.toLocaleString("es-CO")} COP
                </p>
              </div>
            </div>
          </div>

          {/* Formulario de pago */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              💳 Método de Pago
            </h2>

            {loading && (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Preparando pago...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {!loading && !error && clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm
                  clientSecret={clientSecret}
                  checkoutData={checkoutData}
                />
              </Elements>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;