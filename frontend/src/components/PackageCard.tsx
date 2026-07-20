import React from "react";

interface PackageCardProps {
  pkg: {
    id: string;
    name: string;
    description?: string;
    price: number;
    discount_price?: number;
    slug: string;
  };
  onViewDetails: (pkg: any) => void;
  onBook: (pkg: any) => void;
}

export const PackageCard: React.FC<PackageCardProps> = ({ pkg, onViewDetails, onBook }) => {
  const savings = pkg.discount_price 
    ? Math.round(((pkg.price - pkg.discount_price) / pkg.price) * 100) 
    : 0;

  return (
    <div className="glass-card hover-scale rounded-xl p-5 flex flex-col justify-between min-h-[255px] shadow-sm relative overflow-hidden border-t-4 border-t-gold/75">
      <div className="space-y-2 flex flex-col justify-between h-full">
        <div>
          <div className="flex justify-between items-center gap-2">
            <span className="inline-block text-[9px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full uppercase">
              Popular Bundle
            </span>
            {savings > 0 && (
              <span className="text-[9px] text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded-full">
                Save {savings}%
              </span>
            )}
          </div>
          <h3 className="font-display font-extrabold text-slate-800 text-sm line-clamp-2 leading-tight min-h-[40px] mt-1">
            {pkg.name}
          </h3>
          <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">
            {pkg.description || "Comprehensive wellness checkup panel."}
          </p>
        </div>
        <button
          onClick={() => onViewDetails(pkg)}
          className="text-[10px] font-bold text-primary hover:text-primary-hover flex items-center gap-1 mt-2 focus:outline-none group/btn transition-colors cursor-pointer self-start"
        >
          <span>View More & Prep</span>
          <span className="transition-transform group-hover/btn:translate-x-0.5">&rarr;</span>
        </button>
      </div>
      <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
        <div>
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Offer Price</span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-sm font-extrabold text-slate-900">₹{pkg.discount_price || pkg.price}</span>
            {pkg.discount_price && (
              <span className="font-mono text-[10px] text-slate-400 line-through">₹{pkg.price}</span>
            )}
          </div>
        </div>
        <button
          onClick={() => onBook(pkg)}
          className="px-3 py-1.5 bg-accent hover:bg-accent-hover hover:scale-105 active:scale-95 text-white text-[10px] font-bold rounded-md shadow-sm transition-all duration-200 cursor-pointer"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};
