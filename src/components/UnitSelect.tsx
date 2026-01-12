import React from 'react';
import { IconList } from '@tabler/icons-react';

interface Props {
  units: number[];
  onSelectUnit: (unit: number) => void;
  onSelectReverseUnit: (unit: number) => void;
  onShowUnitList: (unit: number) => void;
}

const UnitSelect: React.FC<Props> = ({ units, onSelectUnit, onSelectReverseUnit, onShowUnitList }) => (
  <div className="divide-y divide-gray-700">
    {units.map(unit => (
      <div key={unit} className="flex flex-col sm:flex-row items-center py-4 gap-2 sm:gap-4">
        <span className="text-indigo-300 font-bold min-w-[4em] text-lg">Unit {unit}</span>
        <div className="flex flex-row gap-2 w-full justify-center">
          <button
            onClick={() => onSelectUnit(unit)}
            className="bg-indigo-700 hover:bg-indigo-800 text-white font-semibold py-2 px-4 rounded-sm transition duration-200 shadow-md text-base"
          >
            日→英
          </button>
          <button
            onClick={() => onSelectReverseUnit(unit)}
            className="bg-pink-700 hover:bg-pink-800 text-white font-semibold py-2 px-4 rounded-sm transition duration-200 shadow-md text-base"
          >
            英→日
          </button>
          <button
            onClick={() => onShowUnitList(unit)}
            className="bg-gray-700 hover:bg-gray-600 text-indigo-200 font-semibold py-2 px-4 rounded-sm transition duration-200 shadow-md text-base"
          >
            <IconList size={18} stroke={2} className="inline-block mr-1" /> 一覧
          </button>
        </div>
      </div>
    ))}
  </div>
);

export default UnitSelect;