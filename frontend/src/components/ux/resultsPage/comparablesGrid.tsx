import { motion } from 'framer-motion';

interface ComparableHome {
  id: string;
  address: string;
  city: string;
  propertyDetails: { type: string; bedrooms: number; bathrooms: number; squareFeet?: number };
  saleInfo: { soldPrice?: number; listPrice?: number; status: string };
}

export default function ComparablesGrid({ homes, summary }: { homes: ComparableHome[]; summary: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6"
    >
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Similar Properties</h3>
      <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">{summary}</p>
      <div className="grid gap-4 md:grid-cols-3">
        {homes.slice(0, 3).map((home) => (
          <div key={home.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition">
            <h4 className="font-bold text-gray-900 dark:text-white">{home.address}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {home.propertyDetails.type} • {home.propertyDetails.bedrooms} bed • {home.propertyDetails.bathrooms} bath
              {home.propertyDetails.squareFeet && ` • ${home.propertyDetails.squareFeet.toLocaleString()} sqft`}
            </p>
            <div className="mt-2 text-right">
              <div className={`text-lg font-bold ${home.saleInfo.soldPrice ? 'text-green-600' : 'text-blue-600'}`}>
                ${home.saleInfo.soldPrice?.toLocaleString() || home.saleInfo.listPrice?.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">{home.saleInfo.status}</div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}