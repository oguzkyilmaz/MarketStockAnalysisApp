import React, { useEffect, useState } from 'react';
import axios from 'axios';

const modalBgStyle = {
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0006', zIndex: 1000,
  display: 'flex', alignItems: 'center', justifyContent: 'center'
};
const modalStyle = {
  background: '#fff', borderRadius: 12, boxShadow: '0 4px 32px #0002', padding: '2em', minWidth: 340, maxWidth: '90vw', zIndex: 1001
};

const ProductList = () => {
  const [newProduct, setNewProduct] = useState({ name: '', category_id: '', stock_quantity: '', price: '' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editProduct, setEditProduct] = useState({ name: '', category_id: '', stock_quantity: '', price: '' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.body.style.background = '#EBEBEB';
    return () => { document.body.style.background = ''; };
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    // eslint-disable-next-line
  }, []);

  const fetchProducts = () => {
    axios.get('http://localhost:8000/products')
      .then(res => {
        setProducts(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  const fetchCategories = () => {
    axios.get('http://localhost:8000/categories')
      .then(res => setCategories(res.data))
      .catch(() => {});
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory ? String(product.category_id) === filterCategory : true;
    return matchesSearch && matchesCategory;
  });

  if (loading) return <div>Ürünler yükleniyor...</div>;
  if (error) return <div>Hata: {error}</div>;

  // Ürün ekleme fonksiyonu
  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.category_id || !newProduct.stock_quantity || !newProduct.price) return;
    axios.post('http://localhost:8000/products', newProduct)
      .then(() => {
        setNewProduct({ name: '', category_id: '', stock_quantity: '', price: '' });
        fetchProducts();
      })
      .catch(err => setError(err.message));
  };

  // Ürün silme fonksiyonu
  const handleDelete = (product) => {
    setDeleteTarget(product);
    setShowDeleteModal(true);
  };
  const confirmDelete = () => {
    if (!deleteTarget) return;
    axios.delete(`http://localhost:8000/products/${deleteTarget.id || deleteTarget.product_id}`)
      .then(() => {
        setShowDeleteModal(false);
        setDeleteTarget(null);
        fetchProducts();
      })
      .catch(err => setError(err.message));
  };
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  // Ürün güncelleme başlat
  const handleEdit = (product) => {
    setEditTarget(product);
    setEditProduct({
      name: product.name,
      category_id: product.category_id,
      stock_quantity: product.stock_quantity,
      price: product.price
    });
    setShowEditModal(true);
  };

  // Ürün güncelle kaydet
  const handleUpdate = (product) => {
    axios.put(`http://localhost:8000/products/${product.id || product.product_id}`, editProduct)
      .then(() => {
        setShowEditModal(false);
        setEditTarget(null);
        setEditProduct({ name: '', category_id: '', stock_quantity: '', price: '' });
        fetchProducts();
      })
      .catch(err => setError(err.message));
  };

  return (
    <div style={{fontFamily:'Rubik', minHeight:'100vh'}}>
      <h2 style={{marginBottom:'1em', marginLeft:'60px', fontSize:'2.3em'}}>Ürünler</h2>
      <button onClick={() => setShowAddModal(true)} style={{
        marginBottom:'1em',
        marginLeft:'60px',
        padding:'0.7em 1.2em',
        borderRadius:10,
        border:'none',
        background:'#10B981',
        color:'#fff',
        fontWeight:'bold',
        fontSize:'1.2em',
        boxShadow:'0 2px 10px #10B98122',
        cursor:'pointer'
      }}>Ürün Ekle</button>
      {/* Ürün Ekle Modalı */}
      {showAddModal && (
        <div style={modalBgStyle}>
          <div style={modalStyle}>
            <div style={{fontWeight:'bold',marginBottom:'1em'}}>Ürün Ekle</div>
            <form onSubmit={handleAddProduct}>
              <input
                type="text"
                placeholder="Ürün adı"
                value={newProduct.name}
                autoFocus
                onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
                style={{padding:'0.7em', borderRadius:6, border:'1px solid #ccc', width:'100%', marginBottom:'1.2em'}}
              />
              <select
                value={newProduct.category_id}
                onChange={e => setNewProduct({ ...newProduct, category_id: e.target.value })}
                style={{padding:'0.7em', borderRadius:6, border:'1px solid #ccc', width:'100%', marginBottom:'1.2em'}}
              >
                <option value="">Kategori seç</option>
                {categories.map(cat => (
                  <option key={cat.id || cat.category_id} value={cat.id || cat.category_id}>{cat.name}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Stok"
                value={newProduct.stock_quantity}
                onChange={e => setNewProduct({ ...newProduct, stock_quantity: e.target.value })}
                min="0"
                style={{padding:'0.7em', borderRadius:6, border:'1px solid #ccc', width:'100%', marginBottom:'1.2em'}}
              />
              <input
                type="number"
                placeholder="Fiyat"
                value={newProduct.price}
                onChange={e => setNewProduct({ ...newProduct, price: e.target.value })}
                min="0"
                style={{padding:'0.7em', borderRadius:6, border:'1px solid #ccc', width:'100%', marginBottom:'1.2em'}}
              />
              <div style={{display:'flex',gap:'1em',justifyContent:'flex-end'}}>
                <button type="submit" style={{background:'#10B981', color:'#fff', border:'none', borderRadius:6, padding:'8px 20px', fontWeight:'bold', cursor:'pointer'}}>Ürün Ekle</button>
                <button type="button" onClick={() => {setShowAddModal(false); setNewProduct({ name: '', category_id: '', stock_quantity: '', price: '' });}} style={{background:'#eee', color:'#222', border:'none', borderRadius:6, padding:'8px 20px', fontWeight:'bold', cursor:'pointer'}}>İptal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ürün Düzenle Modalı */}
      {showEditModal && editTarget && (
        <div style={modalBgStyle}>
          <div style={modalStyle}>
            <div style={{fontWeight:'bold',marginBottom:'1em'}}>Ürün Düzenle</div>
            <input
              type="text"
              placeholder="Ürün adı"
              value={editProduct.name}
              autoFocus
              onChange={e => setEditProduct({ ...editProduct, name: e.target.value })}
              style={{padding:'0.7em', borderRadius:6, border:'1px solid #ccc', width:'100%', marginBottom:'1.2em'}}
            />
            <select
              value={editProduct.category_id}
              onChange={e => setEditProduct({ ...editProduct, category_id: e.target.value })}
              style={{padding:'0.7em', borderRadius:6, border:'1px solid #ccc', width:'100%', marginBottom:'1.2em'}}
            >
              <option value="">Kategori seç</option>
              {categories.map(cat => (
                <option key={cat.id || cat.category_id} value={cat.id || cat.category_id}>{cat.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Stok"
              value={editProduct.stock_quantity}
              onChange={e => setEditProduct({ ...editProduct, stock_quantity: e.target.value })}
              min="0"
              style={{padding:'0.7em', borderRadius:6, border:'1px solid #ccc', width:'100%', marginBottom:'1.2em'}}
            />
            <input
              type="number"
              placeholder="Fiyat"
              value={editProduct.price}
              onChange={e => setEditProduct({ ...editProduct, price: e.target.value })}
              min="0"
              style={{padding:'0.7em', borderRadius:6, border:'1px solid #ccc', width:'100%', marginBottom:'1.2em'}}
            />
            <div style={{display:'flex',gap:'1em',justifyContent:'flex-end'}}>
              <button onClick={() => handleUpdate(editTarget)} style={{background:'#10B981', color:'#fff', border:'none', borderRadius:6, padding:'8px 20px', fontWeight:'bold', cursor:'pointer'}}>Kaydet</button>
              <button onClick={() => {setShowEditModal(false); setEditTarget(null);}} style={{background:'#eee', color:'#222', border:'none', borderRadius:6, padding:'8px 20px', fontWeight:'bold', cursor:'pointer'}}>İptal</button>
            </div>
          </div>
        </div>
      )}

      {/* Silme Modalı */}
      {showDeleteModal && (
        <div style={modalBgStyle}>
          <div style={modalStyle}>
            <div style={{marginBottom:'1.2em'}}>Bu ürünü silmek istediğinize emin misiniz?</div>
            <div style={{display:'flex',gap:'1em',justifyContent:'flex-end'}}>
              <button onClick={confirmDelete} style={{background:'#ef4444', color:'#fff', border:'none', borderRadius:6, padding:'8px 20px', fontWeight:'bold', cursor:'pointer'}}>Sil</button>
              <button onClick={cancelDelete} style={{background:'#eee', color:'#222', border:'none', borderRadius:6, padding:'8px 20px', fontWeight:'bold', cursor:'pointer'}}>İptal</button>
            </div>
          </div>
        </div>
      )}

      <h3 style={{marginLeft:'60px'}}>Ürün Ara</h3>
      <div style={{ marginBottom: '1em', marginLeft:'60px' }}>
        <input
          type="text"
          placeholder="Ürün ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            marginRight: '1em',
            padding: '0.7em',
            borderRadius: 6,
            border: '1px solid #ccc',
            outline: 'none',
            transition: 'box-shadow .2s, border-color .2s',
          }}
          onFocus={e => {
            e.target.style.boxShadow = '0 0 0 3px #6366f155';
            e.target.style.borderColor = '#6366f1';
          }}
          onBlur={e => {
            e.target.style.boxShadow = '';
            e.target.style.borderColor = '#ccc';
          }}
        />
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{padding:'0.7em', borderRadius:6, border:'1px solid #ccc', outline:'none', fontWeight:'bold', background:'#f8fafc'}}>
          <option value="" style={{background:'#f3f4f6', color:'#222', fontWeight:'bold'}}>Tüm Kategoriler</option>
          {categories.map(cat => (
            <option key={cat.id || cat.category_id} value={cat.id || cat.category_id}>{cat.name}</option>
          ))}
        </select>
      </div>
      <div style={{overflowX:'auto', marginLeft:'60px'}}>
        <table style={{
          borderCollapse:'collapse', width:'100%', minWidth:500, background:'#fff', borderRadius:12, overflow:'hidden', boxShadow:'0 2px 16px #0001', fontSize:'1.15em', fontFamily:'Rubik'}}>
          <thead>
            <tr style={{background:'#f3f4f6'}}>
              <th style={{padding:'12px 8px', textAlign:'left', fontSize:'1.15em'}}>Ürün Adı</th>
              <th style={{padding:'12px 8px', textAlign:'left', fontSize:'1.15em'}}>Kategori</th>
              <th style={{padding:'12px 8px', textAlign:'left', fontSize:'1.15em'}}>Stok</th>
              <th style={{padding:'12px 8px', textAlign:'left', fontSize:'1.15em'}}>Fiyat</th>
              <th style={{padding:'12px 8px', textAlign:'left', fontSize:'1.15em'}}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product, idx) => {
              const cat = categories.find(c => (c.id || c.category_id) === product.category_id);
              const id = product.id || product.product_id;
              return (
                <tr key={id} style={{background: idx % 2 === 1 ? '#e2e2e2' : '#f3f4fa'}}>
                  <td style={{padding:'10px 8px', fontSize:'0.8em'}}>{product.name}</td>
                  <td style={{padding:'10px 8px', fontSize:'0.8em'}}>{cat ? cat.name : product.category_id}</td>
                  <td style={{padding:'10px 8px', fontSize:'0.8em'}}>{product.stock_quantity}</td>
                  <td style={{padding:'10px 8px', fontSize:'0.8em'}}>{product.price}</td>
                  <td style={{padding:'10px 8px', fontSize:'0.8em'}}>
                    <button onClick={() => handleEdit(product)} style={{marginRight:'8px', background:'#3b82f6', color:'#fff', border:'none', borderRadius:6, padding:'6px 16px', fontWeight:'bold', cursor:'pointer'}}>Düzenle</button>
                    <button onClick={() => handleDelete(product)} style={{background:'#ef4444', color:'#fff', border:'none', borderRadius:6, padding:'6px 16px', fontWeight:'bold', cursor:'pointer'}}>✖</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductList;
