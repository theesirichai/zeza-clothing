import React from 'react';
import { Sparkles, Shirt, Flower2, Sparkle, Scissors, Check } from 'lucide-react';

const iconMap = {
  Sparkles: Sparkles,
  Shirt: Shirt,
  Flower2: Flower2,
  Sparkle: Sparkle,
  Scissors: Scissors,
};

export default function CategoryBar({ categories, activeCategory, onSelectCategory, getCategoryCount }) {
  return (
    <div className="w-full pb-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold tracking-wide text-[#86868B] uppercase">
            หมวดหมู่สินค้า
          </h2>
          <span className="text-xs text-[#86868B]">
            เลื่อนซ้าย-ขวาเพื่อดูหมวดหมู่อื่นๆ
          </span>
        </div>

        {/* Horizontal scrollable Apple-style category bar */}
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map((cat) => {
            const IconComponent = iconMap[cat.icon] || Sparkles;
            const isActive = activeCategory === cat.id;
            const count = getCategoryCount(cat.id);

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex-shrink-0 group relative flex items-center gap-3 px-4 py-2.5 rounded-2xl sm:rounded-full transition-all duration-300 select-none ${
                  isActive
                    ? 'bg-[#1D1D1F] text-white shadow-md scale-[1.02]'
                    : 'bg-white text-[#1D1D1F] hover:bg-stone-100 border border-black/[0.05] shadow-2xs hover:scale-[1.01]'
                }`}
              >
                {/* Icon round background */}
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-stone-100 group-hover:bg-white text-stone-700'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                </span>

                {/* Category label */}
                <span className="text-sm font-semibold whitespace-nowrap">
                  {cat.name}
                </span>

                {/* Count badge */}
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full transition-colors ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-stone-100 text-[#86868B] group-hover:bg-stone-200'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
