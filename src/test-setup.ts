/**
 * Vitest 全局 setup
 * happy-dom 不支持 IndexedDB，全局 mock 避免 stderr 噪音。
 * 此文件仅用于测试，已从 tsconfig.json exclude，不参与类型检查。
 */

globalThis.indexedDB = {
  open: () => ({
    onerror: null,
    onsuccess: null,
    onupgradeneeded: null,
    result: {
      transaction: () => ({
        objectStore: () => ({
          put: () => {},
          get: () => {},
          delete: () => {},
          clear: () => {},
          getAll: () => ({ onsuccess: null }),
        }),
      }),
      createObjectStore: () => {},
      objectStoreNames: { contains: () => false },
    },
    error: null,
  }),
  deleteDatabase: () => {},
  cmp: () => 0,
  databases: () => Promise.resolve([]),
};
