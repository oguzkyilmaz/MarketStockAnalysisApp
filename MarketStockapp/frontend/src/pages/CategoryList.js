import React, { useEffect, useState } from 'react';
import axios from 'axios';

const modalBgStyle = {
  position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0006', zIndex: 1000,
  display: 'flex', alignItems: 'center', justifyContent: 'center'
};
const modalStyle = {
  background: '#fff', borderRadius: 12, boxShadow: '0 4px 32px #0002', padding: '2em', minWidth: 300, maxWidth: '90vw', zIndex: 1001
};

const CategoryList = () => {
  const [newCategory, setNewCategory] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.body.style.background = '#EBEBEB';
    return () => { document.body.style.background = ''; };
  }, []);

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line 
  }, []);

  const fetchCategories = () => {
    axios.get('http://localhost:8000/categories')
      .then((response) => {
        setCategories(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.detail || err.message);
        setLoading(false);
      });
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    axios.post('http://localhost:8000/categories', { name: newCategory })
      .then(() => {
        setNewCategory("");
        setShowAddModal(false);
        fetchCategories();
      })
      .catch((err) => {
        setError(err.response?.data?.detail || err.message);
      });
  };

  if (loading) return <div>Kategoriler yükleniyor...</div>;
  if (error) return <div>Hata: {error}</div>;

  const handleEdit = (cat) => {
    setEditTarget(cat);
    setEditValue(cat.name);
    setShowEditModal(true);
  };

  const handleUpdate = (cat) => {
    if (!editValue.trim()) return;
    axios.put(`http://localhost:8000/categories/${cat.id || cat.category_id}`, { name: editValue })
      .then(() => {
        setShowEditModal(false);
        setEditTarget(null);
        setEditValue("");
        fetchCategories();
      })
      .catch((err) => setError(err.message));
  };

  const handleDelete = (cat) => {
    setDeleteTarget(cat);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    axios.delete(`http://localhost:8000/categories/${deleteTarget.id || deleteTarget.category_id}`)
      .then(() => {
        setShowDeleteModal(false);
        setDeleteTarget(null);
        fetchCategories();
      })
      .catch((err) => setError(err.message));
  };
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  return (
    <div style={{background:'#EBEBEB', minHeight:'100vh'}}>
      <h2 style={{marginBottom:'1em', marginLeft:'60px'}}>Kategoriler</h2>
      <button onClick={() => setShowAddModal(true)} style={{
  marginBottom:'1em',
  marginLeft:'60px',
  padding:'0.6em 1em',
  borderRadius:10,
  border:'none',
  background:'#10B981',
  color:'#fff',
  fontWeight:'bold',
  fontSize:'1.2em',
  boxShadow:'0 2px 10px #10B98122',
  cursor:'pointer'
}}>Kategori Ekle</button>
      {/* Kategori Ekle Modalı */}
      {showAddModal && (
        <div style={modalBgStyle}>
          <div style={modalStyle}>
            <div style={{fontWeight:'bold',marginBottom:'1em'}}>Kategori Ekle</div>
            <form onSubmit={handleAddCategory}>
              <input
                type="text"
                value={newCategory}
                autoFocus
                onChange={e => setNewCategory(e.target.value)}
                placeholder="Kategori adı"
                style={{padding:'0.7em', borderRadius:6, border:'1px solid #ccc', width:'100%', marginBottom:'1.2em'}}
              />
              <div style={{display:'flex',gap:'1em',justifyContent:'flex-end'}}>
                <button type="submit" style={{background:'#10B981', color:'#fff', border:'none', borderRadius:6, padding:'8px 20px', fontWeight:'bold', cursor:'pointer'}}>Kategori Ekle</button>
                <button type="button" onClick={() => {setShowAddModal(false); setNewCategory("");}} style={{background:'#eee', color:'#222', border:'none', borderRadius:6, padding:'8px 20px', fontWeight:'bold', cursor:'pointer'}}>İptal</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <div style={{overflowX:'auto', marginLeft:'60px'}}>
        <table style={{
  borderCollapse:'collapse', width:'100%', minWidth:400, background:'#fff', borderRadius:12, overflow:'hidden', boxShadow:'0 2px 16px #0001', fontSize:'1.15em',
  fontFamily: 'Montserrat'}}>
          <thead>
            <tr style={{background:'#f3f4f6'}}>
              <th style={{padding:'12px 8px', textAlign:'left', fontSize:'1.15em', fontFamily:'inherit'}}>ID</th>
              <th style={{padding:'12px 8px', textAlign:'left', fontSize:'1.15em', fontFamily:'inherit'}}>Kategori Adı</th>
              <th style={{padding:'12px 8px', textAlign:'left', fontSize:'1.15em', fontFamily:'inherit'}}>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category, idx) => {
              const id = category.id || category.category_id;
              return (
                <tr key={id} style={idx % 2 === 1 ? {background:'#e2e2e2'} : {}}>
                  <td style={{padding:'10px 8px', fontSize:'1.15em'}}>{id}</td>
                  <td style={{padding:'10px 8px', fontSize:'1.15em'}}>{category.name}</td>
                  <td style={{padding:'10px 8px', fontSize:'1.15em'}}>
                    <button onClick={() => handleEdit(category)} style={{marginRight:'8px', background:'#3b82f6', color:'#fff', border:'none', borderRadius:6, padding:'6px 16px', fontWeight:'bold', cursor:'pointer'}}>Düzenle</button>
                    <button onClick={() => handleDelete(category)} style={{background:'#ef4444', color:'#fff', border:'none', borderRadius:6, padding:'6px 16px', fontWeight:'bold', cursor:'pointer'}}>✖</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Silme Modalı */}
      {showDeleteModal && (
        <div style={modalBgStyle}>
          <div style={modalStyle}>
            <div style={{marginBottom:'1.2em'}}>Bu kategoriyi silmek istediğinize emin misiniz?</div>
            <div style={{display:'flex',gap:'1em',justifyContent:'flex-end'}}>
              <button onClick={confirmDelete} style={{background:'#ef4444', color:'#fff', border:'none', borderRadius:6, padding:'8px 20px', fontWeight:'bold', cursor:'pointer'}}>Sil</button>
              <button onClick={cancelDelete} style={{background:'#eee', color:'#222', border:'none', borderRadius:6, padding:'8px 20px', fontWeight:'bold', cursor:'pointer'}}>İptal</button>
            </div>
          </div>
        </div>
      )}
      {/* Güncelleme Modalı */}
      {showEditModal && editTarget && (
        <div style={modalBgStyle}>
          <div style={modalStyle}>
            <div style={{fontWeight:'bold',marginBottom:'1em'}}>Kategori Düzenle</div>
            <input
              type="text"
              value={editValue}
              autoFocus
              onChange={e => setEditValue(e.target.value)}
              style={{padding:'0.7em', borderRadius:6, border:'1px solid #ccc', width:'100%', marginBottom:'1.2em'}}
            />
            <div style={{display:'flex',gap:'1em',justifyContent:'flex-end'}}>
              <button onClick={() => handleUpdate(editTarget)} style={{background:'#10B981', color:'#fff', border:'none', borderRadius:6, padding:'8px 20px', fontWeight:'bold', cursor:'pointer'}}>Kaydet</button>
              <button onClick={() => {setShowEditModal(false);setEditTarget(null);}} style={{background:'#eee', color:'#222', border:'none', borderRadius:6, padding:'8px 20px', fontWeight:'bold', cursor:'pointer'}}>İptal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;
