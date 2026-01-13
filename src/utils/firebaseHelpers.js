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

export const getUniqueValues = (array, key) => {
  return [...new Set(array.map(item => item[key]))];
};

