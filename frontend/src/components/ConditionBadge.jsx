import React from "react";
import { CONDITION_MAP } from "../utils/formatters";

export default function ConditionBadge({ grade, className = "" }) {
  if (!grade) return null;
  const item = CONDITION_MAP[grade] || {
    label: grade,
    color: "bg-gray-50 text-gray-600 border-gray-200"
  };

  return (
    <span
      className={`inline-block px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider border rounded-none ${item.color} ${className}`}
    >
      {item.label}
    </span>
  );
}

