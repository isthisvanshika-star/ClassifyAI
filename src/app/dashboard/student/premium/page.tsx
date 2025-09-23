"use client";

import { monthlyPlans, showErrorMessage } from "@/lib/helper";
import { Plan } from "@/lib/types";
import { Check, ChevronLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const yearlyPlans = monthlyPlans.map((plan) => ({
  ...plan,
  price: plan.price === 0 ? 0 : plan.price * 10,
}));

const Page = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchedPlan, setFetchedPlan] = useState<Plan[]>([]);

  const router = useRouter();

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/assistant/settings/plans");
      const data = await res.json();
      if (res.ok) {
        setFetchedPlan(data.plans);
      } else {
        showErrorMessage(data.message || "Failed to fetch plans.");
      }
    } catch {
      showErrorMessage("Something went wrong while fetching plans.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (
    planName: string,
    price: number,
    billingCycle: string
  ) => {
    if (price === 0) {
      showErrorMessage("Price Problem Occurs!");
      router.push("/dashboard/student");
      return;
    }

    const userId = localStorage.getItem("studentId");
    if (!userId) {
      showErrorMessage("Please login again.");
      router.push("/auth/login");
      return;
    }

    const res = await fetch(`/api/student/payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        amount: price,
        planName,
        billingCycle,
      }),
    });

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url; // redirect to Stripe Checkout
    } else {
      showErrorMessage("Failed to create payment session");
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const mergedPlans = (isYearly ? yearlyPlans : monthlyPlans).map((plan) => {
    const key = `${
      isYearly ? "YEARLY" : "MONTHLY"
    }_${plan.title.toUpperCase()}`;
    const dbPlan = fetchedPlan.find((p) => p.name === key);

    return {
      ...plan,
      price: dbPlan ? dbPlan.price : plan.price, // fallback to default price, not 0
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen animate-pulse text-2xl  text-white">
        Loading plans...
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full px-4 py-10 text-white">
      <h1 className="text-4xl md:text-6xl font-bold uppercase mb-4">
        Classify<span className="text-cyan-500">AI</span> Plans
      </h1>
      <p className="text-center max-w-xl text-white/80 mb-6">
        Choose a plan that fits your academic journey. Upgrade anytime as you
        grow.
      </p>

      {/* Toggle Switch */}
      <div className="mb-20 flex items-center gap-4">
        <span
          className={`text-sm ${
            !isYearly ? "text-cyan-400 font-semibold" : "text-white/60"
          }`}
        >
          Monthly
        </span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isYearly}
            onChange={() => setIsYearly(!isYearly)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
        </label>
        <span
          className={`text-sm ${
            isYearly ? "text-cyan-400 font-semibold" : "text-white/60"
          }`}
        >
          Yearly
        </span>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {mergedPlans.map((plan, index) => (
          <div
            key={index}
            className="relative flex flex-col items-center transition transform hover:-translate-y-2 hover:scale-[1.02]"
          >
            {/* Floating Header */}
            <div
              className={`absolute -top-10 z-10 w-[90%] rounded-4xl bg-gradient-to-r ${plan.bg} text-white text-center py-4 shadow-xl`}
            >
              <h2 className="text-sm font-semibold tracking-wider uppercase">
                {plan.title}
              </h2>
              <p className="text-3xl font-bold mt-1">
                ₹{plan.price}
                <span className="text-sm font-normal">
                  /{isYearly ? "year" : "month"}
                </span>
              </p>
              {plan.popular && (
                <span className="absolute top-2 right-3 bg-yellow-400 text-black text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shadow">
                  Most Popular
                </span>
              )}
            </div>

            {/* Pricing Card */}
            <div className="relative w-full bg-white/10 text-white backdrop-blur-lg rounded-4xl shadow-lg pt-20 px-6 pb-6 flex flex-col justify-between min-h-[30rem]">
              <ul className="space-y-3 text-sm mb-6">
                {monthlyPlans[0].features
                  .concat(monthlyPlans[0].extra)
                  .map((featureText, i) => {
                    const included = plan.features.includes(featureText);
                    return (
                      <li
                        key={i}
                        className={`flex items-center text-base gap-2 ${
                          included ? "text-cyan-300" : "text-red-400"
                        }`}
                      >
                        {included ? <Check size={16} /> : <X size={16} />}
                        {featureText}
                      </li>
                    );
                  })}
              </ul>
              <button
                className="w-full py-6 text-xl bg-cyan-500 hover:bg-cyan-600 text-white rounded-4xl shadow transition"
                onClick={() =>
                  handlePayment(
                    plan.title,
                    plan.price,
                    isYearly ? "yearly" : "monthly"
                  )
                }
              >
                {plan.price === 0 ? "Get Started" : `Choose Plan`}
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => router.push("/dashboard/student")}
          className="flex items-center justify-center gap-2 rounded-full  text-white hover:text-cyan-300 transition-colors"
        >
          <ChevronLeft size={40} />
        </button>
      </div>
    </div>
  );
};

export default Page;
