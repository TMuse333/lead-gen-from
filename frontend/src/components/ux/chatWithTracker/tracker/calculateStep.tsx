import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { JSX } from 'react';

interface CalculationStepProps {
  item: {
    icon: JSX.Element;
    text: string;
    subtext: string;
    step: number;
    color: string;
  };
  calculationStep: number;
}

export function CalculationStep({ item, calculationStep }: CalculationStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ 
        opacity: calculationStep >= item.step ? 1 : 0.4,
        x: 0 
      }}
      transition={{ delay: item.step * 0.1 }}
      className={`flex items-start gap-3 p-3 rounded-lg ${
        calculationStep >= item.step 
          ? 'bg-white/80 shadow-md' 
          : 'bg-white/40'
      }`}
    >
      <div className={`flex-shrink-0 mt-0.5 ${
        calculationStep >= item.step ? item.color : 'text-gray-400'
      }`}>
        {item.icon}
      </div>
      <div className="flex-1">
        <div className={`text-sm font-semibold ${
          calculationStep >= item.step ? 'text-gray-900' : 'text-gray-500'
        }`}>
          {item.text}
        </div>
        <div className={`text-xs mt-0.5 ${
          calculationStep >= item.step ? 'text-gray-600' : 'text-gray-400'
        }`}>
          {item.subtext}
        </div>
      </div>
      <div className="flex-shrink-0">
        {calculationStep > item.step && (
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            className="bg-green-100 rounded-full p-1"
          >
            <Check className="w-4 h-4 text-green-600" />
          </motion.div>
        )}
        {calculationStep === item.step && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5 border-3 border-indigo-600 border-t-transparent rounded-full"
          />
        )}
      </div>
    </motion.div>
  );
}