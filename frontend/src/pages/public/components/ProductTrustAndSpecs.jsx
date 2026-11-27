import React from "react";
import { formatCategoryName } from "../../../utils/formatters";

export default function ProductTrustAndSpecs({ product, badgeLabel }) {
  const specs = [
    {
      label: "Thương hiệu",
      value: product?.brand_name || product?.brand || "Chính hãng",
    },
    {
      label: "Danh mục",
      value: formatCategoryName(product?.category_name || product?.category),
    },
    { label: "Tình trạng", value: badgeLabel },
    { label: "Đóng gói", value: "Fullbox / Niêm phong Aura" },
    { label: "Kiểm định", value: "Hội đồng Aura Vault" },
  ];

  return (
    <>
      {/* Thông Số Sản Phẩm */}
      <div className="border-t border-[#EAEAE8] pt-5 space-y-3">
        <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#111111] font-semibold">
          Thông Số Sản Phẩm
        </h3>

        <div className="divide-y divide-[#F0F0EE] text-xs">
          {specs.map(({ label, value }) => (
            <div
              key={label}
              className="py-2 flex justify-between items-center font-mono"
            >
              <span className="text-[#888888] uppercase tracking-wider text-[11px]">
                {label}
              </span>
              <span className="text-[#111111] font-medium text-right">
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mô Tả Chi Tiết */}
      {product?.description && (
        <div className="border-t border-[#EAEAE8] pt-6 space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#111111] font-semibold">
            Mô Tả Hiện Trạng Bảo Vật
          </h3>
          <p className="text-xs sm:text-sm text-[#666666] leading-relaxed font-light whitespace-pre-line">
            {product.description}
          </p>
        </div>
      )}
    </>
  );
}
