import React from 'react';
import { ElementType } from '../types';

interface FilterBarProps {
  selectedElement: ElementType | 'All';
  onSelectElement: (element: ElementType | 'All') => void;
}

const ELEMENTS: (ElementType | 'All')[] = [
  'All',
  'Pyro',
  'Hydro',
  'Cryo',
  'Electro',
  'Anemo',
  'Geo',
  'Dendro',
];

const FilterBar: React.FC<FilterBarProps> = ({ selectedElement, onSelectElement }) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center p-4">
      {ELEMENTS.map((element) => (
        <button
          key={element}
          onClick={() => onSelectElement(element)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            selectedElement === element
              ? 'bg-white text-black shadow-lg scale-105'
              : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          {element}
        </button>
      ))}
    </div>
  );
};

export default FilterBar;
