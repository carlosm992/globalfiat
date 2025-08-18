import Stripe from "stripe";

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "https://brantley-global.com",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, x-api-key",
          "Access-Control-Max-Age": "86400"
        }
      });
    }

    // Validate API key
    const apiKey = request.headers.get("x-api-key");
    if (apiKey !== env.NEXT_PUBLIC_STRIPE_KEY) {
      return new Response("Unauthorized", {
        status: 401,
        headers: {
          "Access-Control-Allow-Origin": "https://brantley-global.com",
          "Content-Type": "text/plain"
        }
      });
    }

    const stripe = new Stripe(env.NEXT_PUBLIC_STRIPE_KEY, {
      apiVersion: "2023-08-16"
    });

    try {
      const body = await request.json();
      const { method, params } = body;

      if (method === "createCheckoutSession") {
        const { amount, product, quantity } = params;

        const session = await stripe.checkout.sessions.create({
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: product,
                },
                unit_amount: amount,
              },
              quantity: quantity,
            },
          ],
          mode: "payment",
          success_url: "https://brantley-global.com/?session_id={CHECKOUT_SESSION_ID}",
          cancel_url: "https://brantley-global.com/?cancelled=true",
        });

        console.log("Creating Stripe session with:", amount, product, quantity);
        console.log("Session created:", session.id);

        return Response.json({ sessionId: session.id }, {
          headers: {
            "Access-Control-Allow-Origin": "https://brantley-global.com",
            "Content-Type": "application/json"
          }
        });
      }

      return new Response("Method not found", { status: 404 });
    } catch (err) {
      return Response.json({ error: err.message }, {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "https://brantley-global.com",
          "Content-Type": "application/json"
        }
      });
    }
  }
};
