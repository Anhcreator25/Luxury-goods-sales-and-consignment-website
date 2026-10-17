import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import ProductCard from '../../components/ProductCard';
import Footer from '../../components/Footer';
import axiosClient from '../../services/axiosClient';

// ---------------------------------------------------------------------------
// Category map: display name → API category_id (Khớp chuẩn Database MySQL)
// ---------------------------------------------------------------------------
const CATEGORIES = [
  { label: 'Tất Cả Sản Phẩm', id: null, desc: 'Toàn bộ các tác phẩm xa xỉ đã qua kiểm định nghiêm ngặt từ các thương hiệu hàng đầu thế giới.' },
  { label: 'Túi Xách Thượng Lưu', id: 1, desc: 'Những kiệt tác túi xách kinh điển từ Hermès Birkin, Chanel Classic Flap, Louis Vuitton, Dior.' },
  { label: 'Sneaker & Giày Hiệu', id: 2, desc: 'Bộ sưu tập giày hiếm, phiên bản giới hạn chính hãng Jordan, Dior, Nike x Travis Scott.' },
  { label: 'Đồng Hồ Xa Xỉ', id: 3, desc: 'Cỗ máy thời gian đỉnh cao của Rolex, Patek Philippe, Audemars Piguet, Cartier nguyên bản.' },
  { label: 'Thời Trang Đường Phố', id: 4, desc: 'Các thiết kế Streetwear xa xỉ, phong cách thời thượng từ Off-White, Supreme, Balenciaga.' },
  { label: 'Trang Sức & Phụ Kiện', id: 5, desc: 'Tinh hoa trang sức kim cương, vàng khối từ Cartier, Van Cleef & Arpels, Bvlgari.' },
];

const CONDITIONS = [
  'Brand New (100% - Fullbox)',
  'Like New (99%)',
  'Excellent (97%)',
  'Very Good (95%)',
  'Good (90%)'
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function sortProducts(products, sortKey) {
  const copy = [...products];
  if (sortKey === 'price_asc') {
    return copy.sort((a, b) => (a.selling_price || a.price || 0) - (b.selling_price || b.price || 0));
  }
  if (sortKey === 'price_desc') {
    return copy.sort((a, b) => (b.selling_price || b.price || 0) - (a.selling_price || a.price || 0));
  }
  return copy.sort((a, b) => (b.id || 0) - (a.id || 0));
}

function applyLocalFilters(products, { minPrice, maxPrice, conditions, brand }) {
  return products.filter((p) => {
    const itemPrice = Number(p.selling_price ?? p.price ?? 0);
    if (minPrice !== '' && itemPrice < Number(minPrice)) return false;
    if (maxPrice !== '' && itemPrice > Number(maxPrice)) return false;
    if (conditions.length > 0 && !conditions.includes(p.condition_grade)) return false;
    if (brand.trim() !== '') {
      const brandStr = (p.brand_name || p.brand || '').toLowerCase();
      if (!brandStr.includes(brand.trim().toLowerCase())) return false;
    }
    return true;
  });
}

function LoadingSkeleton({ isFullWidth }) {
  return (
    <div className={`grid gap-5 ${isFullWidth ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-2 lg:grid-cols-3'}`}>
      {Array.from({ length: isFullWidth ? 8 : 6 }).map((_, i) => (
        <div key={i} className="animate-pulse bg-[#F2F2F0] border border-[#E5E5E3] h-80 w-full" />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function ShopPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc category_id từ URL query string
  const categoryParam = searchParams.get('category_id');
  const selectedCategory = categoryParam ? Number(categoryParam) : null;

  // Lấy thông tin danh mục hiện hành
  const currentCategoryObj = CATEGORIES.find((c) => c.id === selectedCategory) || CATEGORIES[0];
  const isAllProducts = selectedCategory === null; // True = xem tất cả sản phẩm (Có bộ lọc)

  // Filter state (chỉ dùng cho chế độ Tất cả sản phẩm)
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [brandInput, setBrandInput] = useState('');

  const [pendingBrand, setPendingBrand] = useState('');
  const [pendingMinPrice, setPendingMinPrice] = useState('');
  const [pendingMaxPrice, setPendingMaxPrice] = useState('');
  const [pendingConditions, setPendingConditions] = useState([]);

  // Grid state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState('newest');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ---------------------------------------------------------------------------
  // Fetch products from API
  // ---------------------------------------------------------------------------
  const fetchProducts = async (catId, titleQuery) => {
    setLoading(true);
    try {
      const params = { status: 'active', limit: 30 };
      if (catId !== null) params.category_id = catId;
      if (titleQuery && titleQuery.trim() !== '') params.title = titleQuery.trim();

      const res = await axiosClient.get('/listings/get_listing', { params });
      const data = res.data?.data || res.data || [];
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Lỗi khi tải sản phẩm:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(selectedCategory, searchQuery);
  }, [selectedCategory, searchQuery]);

  // Derived / filtered products
  const filteredAndSorted = sortProducts(
    applyLocalFilters(products, {
      minPrice: isAllProducts ? minPrice : '',
      maxPrice: isAllProducts ? maxPrice : '',
      conditions: isAllProducts ? selectedConditions : [],
      brand: isAllProducts ? brandInput : '',
    }),
    sortKey
  );

  // Handlers
  function handleConditionToggle(cond) {
    setPendingConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    );
  }

  function handleApplyFilters() {
    setMinPrice(pendingMinPrice);
    setMaxPrice(pendingMaxPrice);
    setSelectedConditions(pendingConditions);
    setBrandInput(pendingBrand);
  }

  function handleClearFilters() {
    setMinPrice('');
    setMaxPrice('');
    setSelectedConditions([]);
    setBrandInput('');
    setPendingMinPrice('');
    setPendingMaxPrice('');
    setPendingConditions([]);
    setPendingBrand('');
    setSearchQuery('');
    setSortKey('newest');
  }

  function handleSelectCategory(catId) {
    handleClearFilters();
    if (catId === null) {
      setSearchParams({});
    } else {
      setSearchParams({ category_id: catId });
    }
  }

  function handleProductDetail(product) {
    navigate(`/product/${product.id}`);
  }

  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#111111]">
      <Navbar />

      {/* ── Page Header Banner ───────────────────────────────────────── */}
      <section className="border-b border-[#E5E5E3] bg-white px-6 sm:px-10 py-10">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#888888] mb-2">
              <span>Aura Vault</span>
              <span>/</span>
              {isAllProducts ? (
                <span className="text-[#111111] font-semibold">Tất Cả Sản Phẩm</span>
              ) : (
                <>
                  <button
                    onClick={() => handleSelectCategory(null)}
                    className="hover:text-[#111111] underline underline-offset-2"
                  >
                    Bộ Sưu Tập
                  </button>
                  <span>/</span>
                  <span className="text-[#111111] font-semibold">{currentCategoryObj.label}</span>
                </>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-[#111111] uppercase">
              {currentCategoryObj.label}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#666666] max-w-2xl leading-relaxed">
              {currentCategoryObj.desc}
            </p>
          </div>

          {/* Action nút quay lại tất cả sản phẩm khi đang ở trang danh mục con */}
          {!isAllProducts && (
            <button
              onClick={() => handleSelectCategory(null)}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#111111] bg-white text-[#111111] text-xs font-mono uppercase tracking-wider hover:bg-[#111111] hover:text-white transition-colors cursor-pointer self-start md:self-auto"
            >
              <span>←</span>
              <span>Xem Tất Cả & Dùng Bộ Lọc</span>
            </button>
          )}
        </div>
      </section>

      {/* ── Content Layout ───────────────────────────────────────────── */}
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 py-8">
        <div className={`flex gap-8 items-start ${isAllProducts ? '' : 'flex-col'}`}>

          {/* ════ LEFT SIDEBAR: CHỈ HIỂN THỊ KHI Ở 'TẤT CẢ SẢN PHẨM' ════ */}
          {isAllProducts && (
            <aside className="w-[280px] flex-shrink-0 bg-white border border-[#E5E5E3] p-6 sticky top-24 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              {/* Header sidebar */}
              <div className="flex items-center justify-between pb-4 border-b border-[#E5E5E3] mb-5">
                <span className="text-xs font-mono uppercase tracking-widest text-[#111111] font-bold">
                  BỘ LỌC ĐA TIÊU CHÍ
                </span>
                <button
                  onClick={handleClearFilters}
                  className="text-[11px] font-mono text-[#888888] hover:text-[#D93838] transition-colors cursor-pointer"
                >
                  Xóa lọc
                </button>
              </div>

              {/* Lọc Khoảng giá */}
              <div className="mb-6">
                <p className="text-xs font-mono uppercase tracking-wider text-[#444444] border-b border-[#F0F0EE] pb-2 mb-3 font-semibold">
                  Khoảng Giá (₫)
                </p>
                <div className="space-y-2">
                  <input
                    type="number"
                    placeholder="Giá từ..."
                    value={pendingMinPrice}
                    onChange={(e) => setPendingMinPrice(e.target.value)}
                    className="w-full border border-[#E5E5E3] bg-[#FAFAFA] px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                  <input
                    type="number"
                    placeholder="Giá đến..."
                    value={pendingMaxPrice}
                    onChange={(e) => setPendingMaxPrice(e.target.value)}
                    className="w-full border border-[#E5E5E3] bg-[#FAFAFA] px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111]"
                  />
                </div>
              </div>

              {/* Lọc Thương hiệu */}
              <div className="mb-6">
                <p className="text-xs font-mono uppercase tracking-wider text-[#444444] border-b border-[#F0F0EE] pb-2 mb-3 font-semibold">
                  Thương Hiệu
                </p>
                <input
                  type="text"
                  placeholder="Gucci, Rolex, Chanel…"
                  value={pendingBrand}
                  onChange={(e) => setPendingBrand(e.target.value)}
                  className="w-full border border-[#E5E5E3] bg-[#FAFAFA] px-3 py-2 text-xs text-[#111111] focus:outline-none focus:border-[#111111] placeholder:text-[#AAAAAA]"
                />
              </div>

              {/* Lọc Tình trạng */}
              <div className="mb-6">
                <p className="text-xs font-mono uppercase tracking-wider text-[#444444] border-b border-[#F0F0EE] pb-2 mb-3 font-semibold">
                  Tình Trạng
                </p>
                <div className="space-y-2.5">
                  {CONDITIONS.map((cond) => (
                    <label key={cond} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={pendingConditions.includes(cond)}
                        onChange={() => handleConditionToggle(cond)}
                        className="accent-[#111111]"
                      />
                      <span className="text-xs text-[#555555] group-hover:text-[#111111] transition-colors">
                        {cond}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Nút Áp dụng */}
              <button
                onClick={handleApplyFilters}
                className="w-full bg-[#111111] text-white text-xs font-mono uppercase tracking-widest py-3 hover:bg-[#2A2A2A] transition-colors cursor-pointer"
              >
                Áp Dụng Bộ Lọc
              </button>
            </aside>
          )}

          {/* ════ RIGHT/FULL GRID: HIỂN THỊ SẢN PHẨM ════ */}
          <div className="flex-1 w-full min-w-0">
            {/* Top Toolbar: Tìm kiếm & Sắp xếp */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center justify-between bg-white border border-[#E5E5E3] p-3.5">
              <div className="relative w-full sm:max-w-md">
                <input
                  type="text"
                  placeholder="Tìm kiếm trong danh sách này…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-[#E5E5E3] bg-[#FAFAFA] px-3.5 py-2 pl-9 text-xs text-[#111111] focus:outline-none focus:border-[#111111] placeholder:text-[#AAAAAA]"
                />
                <span className="absolute left-3 top-2.5 text-xs text-[#888888]">🔍</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                {!loading && (
                  <span className="text-xs font-mono text-[#777777] uppercase tracking-wider">
                    {filteredAndSorted.length} sản phẩm
                  </span>
                )}
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                  className="border border-[#E5E5E3] bg-[#FAFAFA] px-3 py-2 text-xs font-mono uppercase text-[#111111] focus:outline-none focus:border-[#111111] cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Grid hiển thị sản phẩm */}
            {loading ? (
              <LoadingSkeleton isFullWidth={!isAllProducts} />
            ) : filteredAndSorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white border border-dashed border-[#E5E5E3] p-8">
                <span className="text-3xl block mb-3">🏷️</span>
                <p className="text-lg font-serif font-bold text-[#111111] mb-1">
                  Chưa có sản phẩm nào
                </p>
                <p className="text-xs text-[#777777] max-w-sm">
                  {isAllProducts 
                    ? 'Không tìm thấy sản phẩm phù hợp với bộ lọc hiện tại của bạn.'
                    : `Hiện chưa có món đồ nào thuộc danh mục ${currentCategoryObj.label}.`}
                </p>
                {isAllProducts ? (
                  <button
                    onClick={handleClearFilters}
                    className="mt-5 bg-[#111111] text-white text-xs font-mono uppercase tracking-widest px-6 py-2.5 hover:bg-[#2A2A2A] transition-colors cursor-pointer"
                  >
                    Xóa Bộ Lọc
                  </button>
                ) : (
                  <button
                    onClick={() => handleSelectCategory(null)}
                    className="mt-5 bg-[#111111] text-white text-xs font-mono uppercase tracking-widest px-6 py-2.5 hover:bg-[#2A2A2A] transition-colors cursor-pointer"
                  >
                    Khám Phá Tất Cả Sản Phẩm
                  </button>
                )}
              </div>
            ) : (
              <div className={`grid gap-6 ${isAllProducts ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
                {filteredAndSorted.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onDetail={() => handleProductDetail(product)}
                  />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
      <Footer onCategorySelect={(id) => handleSelectCategory(id)} />
    </div>
  );
}
