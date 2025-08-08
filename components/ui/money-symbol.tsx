"use client";

import React from "react";
import { useFinance } from "@/hooks/use-finance";

export function MoneySymbol({ className = "" }: { className?: string }) {
  const { data, currencyRates } = useFinance();
  const code = data?.settings.defaultCurrency || "EUR";
  const symbol = currencyRates.find((r) => r.code === code)?.symbol || code;
  return <span className={className}>{symbol}</span>;
}


