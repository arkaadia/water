import React from 'react';
import { useApp } from '../context/AppContext';
import { STORE_THEMES, StoreThemeId } from '../types/theme';
import {
  Palette,
  CheckCircle2,
  Sparkles,
  Store,
  Layers,
  ArrowRight,
  Eye
} from 'lucide-react';

export const AdminThemeSelector: React.FC = () => {
  const { currentTheme, setCurrentTheme, activeTheme } = useApp();

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Palette className="w-5 h-5 text-rose-600" />
            <span>مدیریت قالب و پوسته‌های فروشگاه (Store Themes)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            انتخاب تم بصری متناسب با ماهیت و نوع فروشگاه (آب معدنی، هایپرمارکت FMCG، رستوران و هتل لوکس، ورزشی یا سازمانی)
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
          <span className="text-slate-500 font-bold">تم فعال فعلی:</span>
          <span className="font-bold text-slate-900 flex items-center gap-1 font-mono">
            <span
              className="w-3 h-3 rounded-full inline-block"
              style={{ backgroundColor: activeTheme.previewColors[0] }}
            />
            <span>{activeTheme.name}</span>
          </span>
        </div>
      </div>

      {/* Grid of Store Themes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {(Object.keys(STORE_THEMES) as StoreThemeId[]).map(themeId => {
          const theme = STORE_THEMES[themeId];
          const isActive = currentTheme === themeId;

          return (
            <div
              key={themeId}
              onClick={() => setCurrentTheme(themeId)}
              className={`rounded-2xl border-2 p-5 transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-4 hover:shadow-md ${
                isActive
                  ? 'border-indigo-600 bg-indigo-50/20 shadow-md ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                {/* Theme Header with Swatches */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1.5 space-x-reverse">
                      {theme.previewColors.map((color, idx) => (
                        <div
                          key={idx}
                          className="w-5 h-5 rounded-full border-2 border-white shadow-xs"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">
                      {theme.name}
                    </span>
                  </div>

                  {isActive ? (
                    <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>فعال</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px] font-medium hover:text-indigo-600">
                      کلیک برای فعال‌سازی
                    </span>
                  )}
                </div>

                {/* Target Store Type Badge */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 text-[11px]">
                    <Store className="w-3.5 h-3.5 text-indigo-500" />
                    <span>مناسب برای:</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    {theme.storeTypeTitle}
                  </p>
                </div>

                {/* Description & Marketing Tagline */}
                <p className="text-xs text-slate-500 leading-relaxed">
                  {theme.description}
                </p>

                <div className="text-[10px] text-slate-400 italic bg-white p-2 rounded-lg border border-slate-100">
                  شعار: «{theme.tagline}»
                </div>
              </div>

              {/* Theme Live Mini Preview Card */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div
                  className={`rounded-xl p-3 text-white text-[11px] bg-gradient-to-r ${theme.bannerGradient} space-y-1.5 shadow-xs`}
                >
                  <div className="text-[9px] font-bold opacity-80 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    <span>پیش‌نمایش بنر فروشگاه</span>
                  </div>
                  <div className="font-black text-xs truncate">{theme.heroTitle}</div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[9px] opacity-75">تحویل با فاکتور رسمی</span>
                    <button
                      type="button"
                      className={`text-[9px] px-2 py-0.5 rounded-md font-bold ${theme.buttonClass}`}
                    >
                      خرید عمده
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    setCurrentTheme(themeId);
                  }}
                  className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {isActive ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>این تم روی فروشگاه فعال است</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      <span>انتخاب این تم برای فروشگاه</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
