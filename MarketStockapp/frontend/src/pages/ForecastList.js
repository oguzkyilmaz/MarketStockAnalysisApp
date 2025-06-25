import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ForecastList = () => {
  const [monthlySales, setMonthlySales] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [forecasts, setForecasts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);

  useEffect(() => {
    if (!selectedProduct) return setMonthlySales([]);
    axios.get(`http://localhost:8000/sales/monthly/${selectedProduct}`)
      .then(res => {
        // API'den gelen veriyi BarChart'ın beklediği formata dönüştür
        const formatted = res.data.map(item => ({
          month: item.year_month ? (typeof item.year_month === 'string' ? item.year_month.substring(0,7) : new Date(item.year_month).toLocaleString('default', { year: 'numeric', month: 'short' })) : item.month,
          units_sold: item.total_units_sold ?? item.units_sold
        }));
        setMonthlySales(formatted);
      })
      .catch(() => setMonthlySales([]));
  }, [selectedProduct]);

  useEffect(() => {
    fetchForecasts();
    axios.get('http://localhost:8000/products')
      .then(res => setProducts(res.data))
      .catch(() => {});
  }, []);

  const fetchForecasts = () => {
    setLoading(true);
    axios.get('http://localhost:8000/forecasts')
      .then(res => {
        setForecasts(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handleDeleteForecast = async (forecast) => {
    if(!window.confirm('Bu tahmini silmek istediğinize emin misiniz?')) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await axios.delete(`http://localhost:8000/forecasts/${forecast.id}`);
      fetchForecasts();
    } catch (err) {
      setActionError(err.response?.data?.detail || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTrainAndPredict = async () => {
    if (!selectedProduct) return;
    setActionLoading(true);
    setActionError(null);
    try {
      await axios.post(`http://localhost:8000/models/${selectedProduct}/train`);
      await axios.get(`http://localhost:8000/models/${selectedProduct}/predict`);
      fetchForecasts();
    } catch (err) {
      setActionError(err.response?.data?.detail || err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div>Hata: {error}</div>;

  return (
    <div style={{ background: '#EBEBEB', minHeight: '100vh', width: '100vw' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', background: '#fff', padding: '2em', borderRadius: '16px', boxShadow: '0 2px 16px #0001' }}>
        <h2 style={{ marginBottom: '1em' }}>Tahminler</h2>
        <div style={{ width: '100%', height: 300, marginBottom: '2em' }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlySales} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="units_sold" name="Aylık Satış" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ margin: '1em 0', display: 'flex', alignItems: 'center', gap: '1em' }}>
          <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)} style={{ padding: '0.5em', borderRadius: '8px', border: '1px solid #ddd' }}>
            <option value="">Ürün seçin</option>
            {products.map(product => (
              <option key={product.id || product.product_id} value={product.id || product.product_id}>
                {product.name} (ID: {product.id || product.product_id})
              </option>
            ))}
          </select>
          <button onClick={handleTrainAndPredict} disabled={!selectedProduct || actionLoading} style={{ padding: '0.5em 1em', borderRadius: '8px', border: 'none', background: '#4CAF50', color: '#fff', cursor: 'pointer' }}>
            {actionLoading ? 'Tahmin Yapılıyor...' : 'Tahmin Oluştur'}
          </button>
          {actionError && <span style={{color:'red'}}>{actionError}</span>}
        </div>
        <table style={{ borderCollapse: 'collapse', width: '100%', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 8px #0001', marginTop: '1em' }}>
          <thead style={{ background: '#f2f2f2' }}>
            <tr>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Ürün ID</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Tahmin Tarihi</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Tahmin Edilen Satış</th>
              <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>İşlem</th>
            </tr>
          </thead>
          <tbody>
          {forecasts.map((forecast, idx) => (
            <tr key={forecast.id || `${forecast.product_id}-${forecast.forecast_date}`} style={{ borderBottom: '1px solid #ddd', background: idx % 2 === 1 ? '#f9f9f9' : '#fff' }}>
              <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{forecast.product_id}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{forecast.forecast_date ? new Date(forecast.forecast_date).toLocaleDateString() : ''}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>{forecast.predicted_demand}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                <button onClick={() => handleDeleteForecast(forecast)} disabled={actionLoading} style={{color:'red', border:'none', background:'none', cursor:'pointer', fontWeight:'bold'}}>Sil</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
  );
};

export default ForecastList;
