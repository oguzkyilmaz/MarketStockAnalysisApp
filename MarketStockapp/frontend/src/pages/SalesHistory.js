import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SalesHistory = () => {
  // Ana state'ler
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [page, setPage] = useState(1);

  // Popup ve form state'leri
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ product_id: '', category_id: '', units_sold: '', created_at: '', price: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editSaleId, setEditSaleId] = useState(null);

  // Data fetch
  const fetchSales = () => {
    axios.get('http://localhost:8000/sales')
      .then(res => {
        setSales(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  const fetchProducts = () => {
    axios.get('http://localhost:8000/products')
      .then(res => setProducts(res.data))
      .catch(() => {});
  };

  const fetchCategories = () => {
    axios.get('http://localhost:8000/categories')
      .then(res => setCategories(res.data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchSales();
    fetchProducts();
    fetchCategories();
    // eslint-disable-next-line
  }, []);

  // Kategori otomatik doldurma
  useEffect(() => {
    if (form.product_id) {
      const prod = products.find(p => (p.id || p.product_id) === form.product_id);
      console.log('Otomatik kategori doldurma:', prod);
      setForm(f => ({ ...f, category_id: prod ? (prod.category_id || '') : '' }));
    } else {
      setForm(f => ({ ...f, category_id: '' }));
    }
  }, [form.product_id, products]);

  // Filtreleme
  const filteredSales = sales.filter(sale => {
    const product = products.find(p => (p.id || p.product_id) === sale.product_id);
    const matchesSearch = product ? product.name.toLowerCase().includes(search.toLowerCase()) : false;
    const matchesCategory = filterCategory ? (product && String(product.category_id) === filterCategory) : true;
    return matchesSearch && matchesCategory;
  });

  // Sayfalama
  const pageSize = 50;
  const totalPages = Math.ceil(filteredSales.length / pageSize);
  const pagedSales = filteredSales.slice((page-1)*pageSize, page*pageSize);

  // Yükleniyor/hata kontrolü
  if (loading) return <div>Satışlar yükleniyor...</div>;
  if (error) return <div>Hata: {error}</div>;

  const handleFormChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleFormSubmit = async e => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    // Kategori otomatik dolmuş mu kontrol et
    if (!form.category_id) {
      setFormError("Kategori otomatik olarak doldurulamadı. Lütfen ürün seçimini kontrol edin.");
      setFormLoading(false);
      return;
    }
    try {
      await axios.post('http://localhost:8000/sales', {
        product_id: form.product_id,
        category_id: form.category_id,
        units_sold: Number(form.units_sold),
        created_at: form.created_at,
        price: Number(form.price)
      });
      setShowModal(false);
      setForm({ product_id: '', category_id: '', units_sold: '', created_at: '', price: '' });
      fetchSales();
    } catch (err) {
      setFormError(err.response?.data?.detail || err.message || "Bilinmeyen bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setFormLoading(false);
    }
  };

  // Satış silme
  const handleDeleteSale = async (sale) => {
    if (!window.confirm('Bu satışı silmek istediğinize emin misiniz?')) return;
    try {
      await axios.delete(`http://localhost:8000/sales/${sale.id || sale.sale_id}`);
      fetchSales();
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    }
  };

  // Satış düzenleme
  const handleEditSale = (sale) => {
    setEditMode(true);
    setEditSaleId(sale.id || sale.sale_id);
    setShowModal(true);
    setForm({
      product_id: sale.product_id,
      category_id: sale.category_id || '',
      units_sold: sale.units_sold,
      created_at: sale.created_at ? sale.created_at.slice(0,10) : '',
      price: sale.price || ''
    });
  };

  // Satış güncelleme submit
  const handleUpdateSale = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    try {
      if (!form.category_id) {
        setFormError("Kategori otomatik olarak doldurulamadı. Lütfen ürün seçimini kontrol edin.");
        setFormLoading(false);
        return;
      }
      await axios.put(`http://localhost:8000/sales/${editSaleId}`, form);
      setShowModal(false);
      setEditMode(false);
      setEditSaleId(null);
      setForm({ product_id: '', category_id: '', units_sold: '', created_at: '', price: '' });
      fetchSales();
    } catch (err) {
      setFormError(err.response?.data?.detail || err.message || "Bilinmeyen bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div style={{ background: '#EBEBEB', minHeight: '100vh', width: '100vw' }}>
      <div style={{ maxWidth: 900, margin: '0 auto', background: '#fff', padding: '2em', borderRadius: '16px', boxShadow: '0 2px 16px #0001' }}>
        <h2 style={{marginBottom:'1em'}}>Satış Geçmişi</h2>
        <button onClick={() => setShowModal(true)} style={{marginBottom:'1em', padding:'0.7em 1.5em', borderRadius:8, background:'#4CAF50', color:'#fff', border:'none', fontWeight:'bold', fontSize:'1em', cursor:'pointer'}}>Yeni Satış Ekle</button>
        {showModal && (
          <div style={{position:'fixed',top:0,left:0,width:'100vw',height:'100vh',background:'#0006',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}}>
            <div style={{background:'#fff',padding:'2em',borderRadius:12,minWidth:350,boxShadow:'0 2px 16px #0003',position:'relative'}}>
              <button onClick={()=>setShowModal(false)} style={{position:'absolute',top:12,right:16,fontSize:20,color:'#aaa',background:'none',border:'none',cursor:'pointer'}}>×</button>
              <h3>{editMode ? 'Satışı Güncelle' : 'Yeni Satış Ekle'}</h3>
              <form onSubmit={editMode ? handleUpdateSale : handleFormSubmit} style={{display:'flex',flexDirection:'column',gap:'1em',marginTop:'1em'}}>
                <div>
                  <label>Ürün Adı:</label><br/>
                  <select name="product_id" value={form.product_id} onChange={handleFormChange} required style={{padding:'0.5em',borderRadius:8,width:'100%'}}>
                    <option value="">Seçiniz</option>
                    {products.map(p => (
                      <option key={p.id || p.product_id} value={p.id || p.product_id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Kategori:</label><br/>
                  <select name="category_id" value={form.category_id} onChange={handleFormChange} required style={{padding:'0.5em',borderRadius:8,width:'100%'}} >
                    <option value="">Seçiniz</option>
                    {categories.map(c => (
                      <option key={c.id || c.category_id} value={c.id || c.category_id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label>Satış Miktarı:</label><br/>
                  <input name="units_sold" type="number" min="1" value={form.units_sold} onChange={handleFormChange} required style={{padding:'0.5em',borderRadius:8,width:'100%'}} />
                </div>
                <div>
                  <label>Satış Tarihi:</label><br/>
                  <input name="created_at" type="date" value={form.created_at} onChange={handleFormChange} required style={{padding:'0.5em',borderRadius:8,width:'100%'}} />
                </div>
                <div>
                  <label>Fiyat:</label><br/>
                  <input name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleFormChange} required style={{padding:'0.5em',borderRadius:8,width:'100%'}} />
                </div>
                {formError && <div style={{color:'red'}}>{formError}</div>}
                <button type="submit" disabled={formLoading} style={{padding:'0.7em',borderRadius:8,background:editMode ? '#1976d2' : '#4CAF50',color:'#fff',border:'none',fontWeight:'bold',fontSize:'1em',cursor:'pointer'}}>
                  {formLoading ? (editMode ? 'Kaydediliyor...' : 'Ekleniyor...') : (editMode ? 'Kaydet' : 'Kaydet')}
                </button>
              </form>
            </div>
          </div>
        )}
      <div style={{display:'flex', gap:'1em', alignItems:'center', marginBottom:'1.5em'}}>
        <input
          type="text"
          placeholder="Ürün adına göre ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding:'0.7em',
            borderRadius:8,
            border:'1px solid #bbb',
            width:250,
            fontSize:'1em',
            outline:'none',
            boxShadow:'0 1px 4px #0001'
          }}
        />
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          style={{
            padding:'0.7em',
            borderRadius:8,
            border:'1px solid #bbb',
            fontSize:'1em',
            outline:'none',
            boxShadow:'0 1px 4px #0001'
          }}
        >
          <option value="">Tüm Kategoriler</option>
          {categories.map(cat => (
            <option key={cat.id || cat.category_id} value={cat.id || cat.category_id}>{cat.name}</option>
          ))}
        </select>
      </div>
      <table style={{ borderCollapse: 'collapse', width: '100%', background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 8px #0001' }}>
        <thead style={{ background: '#f2f2f2' }}>
          <tr>
            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Ürün Adı</th>
            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Kategori</th>
            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Satış Miktarı</th>
            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Satış Tarihi</th>
            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>Fiyat</th>
            <th style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>İşlem</th>
          </tr>
        </thead>
        <tbody>
          {pagedSales.map((sale, idx) => {
            const product = products.find(p => (p.id || p.product_id) === sale.product_id);
            const category = product && categories.find(c => (c.id || c.category_id) === product.category_id);
            return (
              <tr key={sale.id || sale.sale_id} style={{ background: idx % 2 === 1 ? '#e2e2e2' : '#fff', borderBottom:'1px solid #eee' }}>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign:'center' }}>{product ? product.name : sale.product_id}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign:'center' }}>{category ? category.name : (product ? product.category_id : '')}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign:'center' }}>{sale.units_sold}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign:'center' }}>{sale.created_at ? new Date(sale.created_at).toLocaleString() : ''}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign:'center' }}>{product && product.price ? product.price : ''}</td>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign:'center', display:'flex', gap:'0.5em', justifyContent:'center' }}>
                  <button onClick={() => handleEditSale(sale)} style={{padding:'0.3em 0.7em', borderRadius:6, background:'#1976d2', color:'#fff', border:'none', fontWeight:'bold', fontSize:'0.98em', cursor:'pointer'}}>Düzenle</button>
                  <button onClick={() => handleDeleteSale(sale)} style={{padding:'0.3em 0.7em', borderRadius:6, background:'#e53935', color:'#fff', border:'none', fontWeight:'bold', fontSize:'1em', cursor:'pointer'}}>✖</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Pagination Controls */}
      <div style={{marginTop:'1em', display:'flex', justifyContent:'center', alignItems:'center', gap:'1em'}}>
        <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}>Önceki</button>
        <span>Sayfa {page} / {totalPages || 1}</span>
        <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages || totalPages===0}>Sonraki</button>
      </div>
      </div>
    </div>
  );
};

export default SalesHistory;
