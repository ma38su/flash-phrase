import React from 'react';
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';

interface Props {
  unit: number;
  onBack: () => void;
  onPrev: () => void;
  onNext: () => void;
  disablePrev: boolean;
  disableNext: boolean;
}

const UnitListHeader: React.FC<Props> = ({ unit, onBack, onPrev, onNext, disablePrev, disableNext }) => (
  <div className="flex items-center mb-6 gap-4">
    <button
      onClick={onBack}
      className="bg-gray-700 hover:bg-gray-600 text-gray-100 font-semibold py-2 px-4 rounded-sm transition duration-200 mr-2 shadow-md"
    >
      ← ユニット選択に戻る
    </button>
    <h2 className="text-2xl font-bold text-gray-100">Unit {unit} 一覧</h2>
    <div className="flex gap-2 ml-auto">
      <button
        disabled={disablePrev}
        onClick={onPrev}
        className={`flex items-center gap-1 bg-gray-700 hover:bg-gray-600 text-gray-100 font-semibold py-1 px-2 rounded-sm transition duration-200 shadow-md text-sm ${disablePrev ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <IconArrowLeft size={16} stroke={2} /> 前
      </button>
      <button
        disabled={disableNext}
        onClick={onNext}
        className={`flex items-center gap-1 bg-gray-700 hover:bg-gray-600 text-gray-100 font-semibold py-1 px-2 rounded-sm transition duration-200 shadow-md text-sm ${disableNext ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        次 <IconArrowRight size={16} stroke={2} />
      </button>
    </div>
  </div>
);

export default UnitListHeader;