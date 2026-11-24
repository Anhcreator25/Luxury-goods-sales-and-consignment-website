import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import ProductCard from '../../components/ProductCard';
import Footer from '../../components/Footer';
import ShopSidebar from '../../components/shop/ShopSidebar';
import ShopToolbar from '../../components/shop/ShopToolbar';
import ShopSkeleton from '../../components/shop/ShopSkeleton';
import ShopEmptyState from '../../components/shop/ShopEmptyState';
import { listingServices } from '../../services';
import { CATEGORIES, CONDITIONS } from '../../constants/shopConstants';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function sortProducts(products, sortKey) {
  const copy = [...products];
  if (sortKey === 'price_asc') {
    return copy.sort((a, b) => (Number(a.selling_price ?? a.price ?? 0)) - (Number(b.selling_price ?? b.price ?? 0)));
  }
  if (sortKey === 'price_desc') {
    return copy.sort((a, b) => (Number(b.selling_price ?? b.price ?? 0)) - (Number(a.selling_price ?? a.price ?? 0)));
  }
  return copy.sort((a, b) => (b.id || 0) - (a.id || 0));
}

function applyLocalFilters(products, { minPrice, maxPrice, conditions, brand }) {
  return products.filter((p) => {
    const itemPrice = Number(p.selling_price ?? p.price ?? 0);
    if (minPrice !== '' && itemPrice < Number(minPrice)) return false;
    if (maxPrice !== '' && itemPrice > Number(maxPrice)) return false;
    if (conditions.length > 0) {
      const pCond = String(p.condition_grade || '').toLowerCase();
      const matched = conditions.some((cVal) => {
        const condObj = CONDITIONS.find((c) => c.value === cVal);
        if (condObj) {
          return condObj.keywords.some((kw) => pCond.includes(kw));
        }
        return pCond.includes(cVal.toLowerCase());
      });
      if (!matched) return false;
    }
    if (brand.trim() !== '') {
      const brandStr = (p.brand_name || p.brand || '').toLowerCase();
      if (!brandStr.includes(brand.trim().toLowerCase())) return false;
    }
    return true;
  });
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
export default function ShopPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Đọc params từ URL
  const categoryParam = searchParams.get('category_id');
  const selectedCategory = categoryParam ? Number(categoryParam) : null;
  const currentCategoryObj = CATEGORIES.find((c) => c.id === selectedCategory) || CATEGORIES[0];
  const isAllProducts = selectedCategory === null;

  // URL state defaults
  const urlMinPrice = searchParams.get('min_price') || '';
  const urlMaxPrice = searchParams.get('max_price') || '';
  const urlBrand = searchParams.get('brand') || '';
  const urlConditions = searchParams.get('conditions') ? searchParams.get('conditions').split(',').filter(Boolean) : [];
  const urlSort = searchParams.get('sort') || 'newest';
  const urlSearch = searchParams.get('q') || '';

  // Filter state (Applied)
  const [minPrice, setMinPrice] = useState(urlMinPrice);
  const [maxPrice, setMaxPrice] = useState(urlMaxPrice);
  const [selectedConditions, setSelectedConditions] = useState(urlConditions);
  const [brandInput, setBrandInput] = useState(urlBrand);

  // Filter state (Pending trong Sidebar)
  const [pendingMinPrice, setPendingMinPrice] = useState(urlMinPrice);
  const [pendingMaxPrice, setPendingMaxPrice] = useState(urlMaxPrice);
  const [pendingConditions, setPendingConditions] = useState(urlConditions);
  const [pendingBrand, setPendingBrand] = useState(urlBrand);

  // Search, Sort & Products state
  const [searchInput, setSearchInput] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);
  const [sortKey, setSortKey] = useState(urlSort);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Debounce search input (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Cập nhật URLSearchParams mỗi khi Applied Filters hoặc Sort, Category, Search thay đổi
  useEffect(() => {
    const nextParams = {};
    if (selectedCategory !== null) nextParams.category_id = selectedCategory;
    if (minPrice) nextParams.min_price = minPrice;
    if (maxPrice) nextParams.max_price = maxPrice;
    if (brandInput) nextParams.brand = brandInput;
    if (selectedConditions.length > 0) nextParams.conditions = selectedConditions.join(',');
    if (sortKey !== 'newest') nextParams.sort = sortKey;
    if (debouncedSearch.trim()) nextParams.q = debouncedSearch.trim();

    setSearchParams(nextParams, { replace: true });
  }, [selectedCategory, minPrice, maxPrice, brandInput, selectedConditions, sortKey, debouncedSearch, setSearchParams]);

  // Fetch products from API khi Category hoặc Debounced Search thay đổi
  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = { status: 'active', limit: 50 };
        if (selectedCategory !== null) params.category_id = selectedCategory;
        if (debouncedSearch && debouncedSearch.trim() !== '') params.title = debouncedSearch.trim();

        const res = await listingServices.getListings(params);
        const data = res.data?.data || res.data || [];
        if (isMounted) {
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Lỗi khi tải sản phẩm:', err);
        if (isMounted) setProducts([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, [selectedCategory, debouncedSearch]);

  // Tối ưu hoá lọc & sắp xếp với useMemo
  const filteredAndSorted = useMemo(() => {
    const filtered = applyLocalFilters(products, {
      minPrice,
      maxPrice,
      conditions: selectedConditions,
      brand: brandInput,
    });
    return sortProducts(filtered, sortKey);
  }, [products, minPrice, maxPrice, selectedConditions, brandInput, sortKey]);

  // Handlers
  const handleConditionToggle = (cond) => {
    setPendingConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    );
  };

  const handleApplyFilters = () => {
    setMinPrice(pendingMinPrice);
    setMaxPrice(pendingMaxPrice);
    setSelectedConditions(pendingConditions);
    setBrandInput(pendingBrand);
  };

  const handleClearFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setSelectedConditions([]);
    setBrandInput('');
    setPendingMinPrice('');
    setPendingMaxPrice('');
    setPendingConditions([]);
    setPendingBrand('');
    setSearchInput('');
    setDebouncedSearch('');
    setSortKey('newest');
  };

  const handleSelectCategory = (catId) => {
    handleClearFilters();
    if (catId === null) {
      setSearchParams({});
    } else {
      setSearchParams({ category_id: catId });
    }
  };

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
                    type="button"
                    onClick={() => handleSelectCategory(null)}
                    className="hover:text-[#111111] underline underline-offset-2 cursor-pointer"
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

          {!isAllProducts && (
            <button
              type="button"
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
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* ════ LEFT SIDEBAR ════ */}
          <ShopSidebar
            pendingMinPrice={pendingMinPrice}
            setPendingMinPrice={setPendingMinPrice}
            pendingMaxPrice={pendingMaxPrice}
            setPendingMaxPrice={setPendingMaxPrice}
            pendingBrand={pendingBrand}
            setPendingBrand={setPendingBrand}
            pendingConditions={pendingConditions}
            onConditionToggle={handleConditionToggle}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
          />

          {/* ════ RIGHT GRID CONTENT ════ */}
          <div className="flex-1 w-full min-w-0">
            {/* Top Toolbar */}
            <ShopToolbar
              searchQuery={searchInput}
              onSearchChange={setSearchInput}
              sortKey={sortKey}
              onSortChange={setSortKey}
              totalResults={filteredAndSorted.length}
              loading={loading}
            />

            {/* Grid Sản phẩm */}
            {loading ? (
              <ShopSkeleton count={6} />
            ) : filteredAndSorted.length === 0 ? (
              <ShopEmptyState
                isAllProducts={isAllProducts}
                currentCategoryLabel={currentCategoryObj.label}
                onClearFilters={handleClearFilters}
                onShowAll={() => handleSelectCategory(null)}
              />
            ) : (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAndSorted.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onDetail={() => navigate(`/product/${product.id}`)}
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
