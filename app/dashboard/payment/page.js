'use client';

export default function PaymentPage() {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-neutral-200/60 shadow-[0_4px_20px_rgba(0,0,0,0.04)] p-6 transition-all duration-300 hover:-translate-y-[1px] hover:shadow-[0_8px_28px_rgba(0,0,0,0.06)]">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Payment</h1>
      <p className="text-neutral-500 mt-2">Manage payments and transactions</p>
    </div>
  );
}
