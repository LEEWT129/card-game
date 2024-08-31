import { openDB } from 'idb';

const DB_NAME = 'MemoryGame';
const STORE_NAME = 'images';

export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

// 檢查圖片是否存在
export async function saveImage(imageDataURL) {
  const db = await getDB();
  const existingImages = await getImages();

  // 存在不再儲存
  if (existingImages.includes(imageDataURL)) {
    return;
  }

  return db.add(STORE_NAME, { image: imageDataURL });
}

// GET 所有圖片
export async function getImages() {
  const db = await getDB();
  const items = await db.getAll(STORE_NAME);
  return items.map(item => item.image);
}

// 清空圖片
export async function clearImages() {
  const db = await getDB();
  return db.clear(STORE_NAME);
}
