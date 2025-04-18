import React, { useEffect, useState } from "react";

const App = () => {
  const [products, setProducts] = useState([]);
  const [exchange, setExchange] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingExchange, setLoadingExchange] = useState(true); 
  const [translatedProducts, setTranslatedProducts] = useState([]); 

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("https://fakestoreapi.com/products");
        const data = await res.json();
        setProducts(data);
        setLoading(false);
      } catch (err) {
        setError("Ürünler yüklenemedi.");
        setLoading(false); 
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
        const data = await res.json();
        setExchange(data.rates.TRY);
        setLoadingExchange(false); 
      } catch (err) {
        setError("Döviz verisi yüklenemedi.");
        setLoadingExchange(false);
      }
    };
    fetchExchangeRate();
  }, []);

  // Çeviri işlemi
  useEffect(() => {
    const fetchTranslations = async () => {
      try {
        const translatedData = await Promise.all(
          products.map(async (product) => {
            const titleRes = await fetch(
              `https://api.mymemory.translated.net/get?q=${encodeURIComponent(product.title)}&langpair=en|tr`
            );
            const titleData = await titleRes.json();

            const categoryRes = await fetch(
              `https://api.mymemory.translated.net/get?q=${encodeURIComponent(product.category)}&langpair=en|tr`
            );
            const categoryData = await categoryRes.json();

            return {
              ...product,
              translatedTitle: titleData.responseData.translatedText,
              translatedCategory: categoryData.responseData.translatedText,
            };
          })
        );
        setTranslatedProducts(translatedData);
      } catch (err) {
        setError("İşlem başarısız oldu");
      }
    };

    if (products.length > 0) {
      fetchTranslations();
    }
  }, [products]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "20px",
        gridAutoRows: "minmax(200px, auto)",
      }}
    >
      {loading ? (
        <p style={{ textAlign: "center", fontWeight: "bold" }}>Yükleniyor...</p>
      ) : error ? (
        <p style={{ color: "red", fontWeight: "bold", gridColumn: "1 / -1", textAlign: "center" }}>
          {error}
        </p>
      ) : (
        translatedProducts.map((product) => (
          <div key={product.id} style={{ textAlign: "center" }}>
            <img
              src={product.image}
              alt={product.title}
              style={{ width: "200px", height: "200px", objectFit: "cover" }}
            />
            <h3>{product.translatedTitle}</h3>
            <p>{product.translatedCategory}</p>

            {exchange && (
              <p>
                ₺{(product.price * exchange).toFixed(2)}
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default App;
