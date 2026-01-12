/**
 * Firestore veri yükleme helper fonksiyonları
 */

/**
 * Collection'dan tüm verileri çeker
 * @param {Object} db - Firestore instance
 * @param {Object} collection - Firestore collection fonksiyonu
 * @param {Object} getDocs - Firestore getDocs fonksiyonu
 * @param {string} collectionName - Collection adı
 * @returns {Promise<Array>} Veri dizisi
 */
export const fetchCollectionData = async (db, collection, getDocs, collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const data = [];

    querySnapshot.forEach((doc) => {
      data.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return data;
  } catch (error) {
    console.error(`${collectionName} verileri yüklenirken hata:`, error);
    throw error;
  }
};

/**
 * Benzersiz değerleri filtreler
 * @param {Array} array - Filtrelenecek dizi
 * @param {string} key - Benzersiz değer anahtarı
 * @returns {Array} Benzersiz değerler dizisi
 */
export const getUniqueValues = (array, key) => {
  return [...new Set(array.map(item => item[key]))];
};

