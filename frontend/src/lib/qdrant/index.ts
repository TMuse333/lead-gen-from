// src/lib/qdrant/index.ts

export { qdrant } from './client';

export {
  ensureAdviceCollection,
  ADVICE_COLLECTION,
} from './collections/vector/advice/collection';

export {
  storeAgentAdvice,
  updateAdvice,
  deleteAdvice,
} from './collections/vector/advice/upsert';

export {
  queryRelevantAdvice,
  queryAdviceForLocation,
  getAgentAdvice,
  type QueryAdviceOptions,
} from './collections/vector/advice/queries';

export { incrementAdviceUsage } from './collections/vector/advice/usage';