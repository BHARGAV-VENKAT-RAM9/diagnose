import React from "react";

interface TestCardProps {
  test: {
    id: string;
    name: string;
    description?: string;
    sample_type?: string;
    price: number;
  };
  onViewDetails: (test: any) => void;
  onBook: (test: any) => void;
}

export const TestCard: React.FC<TestCardProps> = ({ test, onViewDetails, onBook }) => {
  return (
    <div className="glass-card hover-scale rounded-xl p-5 flex flex-col justify-between min-h-[255px] shadow-sm">
      <div className="space-y-2 flex flex-col justify-between h-full">
        <div>
          <span className="inline-block text-[9px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase">
            {test.sample_type || "Blood"} Test
          </span>
          <h3 className="font-display font-extrabold text-slate-800 text-sm line-clamp-2 leading-tight min-h-[40px] mt-1">
            {test.name}
          </h3>
          <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">
            {test.description || "No description available."}
          </p>
        </div>
        <button
          onClick={() => onViewDetails(test)}
          className="text-[10px] font-bold text-primary hover:text-primary-hover flex items-center gap-1 mt-2 focus:outline-none group/btn transition-colors cursor-pointer self-start"
        >
          <span>View More & Prep</span>
          <span className="transition-transform group-hover/btn:translate-x-0.5">&rarr;</span>
        </button>
      </div>
      <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
        <div>
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Price</span>
          <span className="font-mono text-sm font-extrabold text-slate-900">₹{test.price}</span>
        </div>
        <button
          onClick={() => onBook(test)}
          className="px-3 py-1.5 bg-accent hover:bg-accent-hover hover:scale-105 active:scale-95 text-white text-[10px] font-bold rounded-md shadow-sm transition-all duration-200 cursor-pointer"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};
